import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import generateOrderNumber from '../utils/generateOrderNumber.js';

// @route  POST /api/orders
// @access Private (customer)
export const placeOrder = async (req, res, next) => {
  try {
    const rawItems = req.body.items || req.body.orderItems || [];
    const shippingAddress = req.body.shippingAddress || {};
    const customerNote = req.body.customerNote || req.body.customerNotes || '';

    if (!rawItems || rawItems.length === 0) {
      return res.status(400).json({ success: false, message: 'No items in order' });
    }

    // Standardize shipping address for Mongoose schema (ensure line1 is set)
    const formattedAddress = {
      fullName: shippingAddress.fullName || '',
      phone: shippingAddress.phone || '',
      line1: shippingAddress.line1 || shippingAddress.street || '',
      line2: shippingAddress.line2 || shippingAddress.landmark || '',
      city: shippingAddress.city || '',
      state: shippingAddress.state || '',
      pincode: shippingAddress.pincode || '',
    };

    if (!formattedAddress.fullName || !formattedAddress.phone || !formattedAddress.line1 || !formattedAddress.city || !formattedAddress.state || !formattedAddress.pincode) {
      return res.status(400).json({ success: false, message: 'Incomplete shipping address. Please fill all required fields.' });
    }

    const orderItems = [];
    let subtotal = 0;

    for (const item of rawItems) {
      const prodId = item.productId || item.product;
      const product = await Product.findById(prodId);
      if (!product || !product.isAvailable) {
        return res.status(400).json({ success: false, message: `Product is no longer available` });
      }

      let price = product.discountPrice || product.price;
      let selectedVariantName = item.variantName || item.size || '';
      let availableStock = product.stock;

      if (product.hasVariants && product.variants?.length > 0) {
        const variant = product.variants.find(
          (v) => v.name === selectedVariantName || v.size === selectedVariantName || v._id?.toString() === selectedVariantName
        ) || product.variants[0];

        if (variant) {
          if (variant.price > 0) price = variant.price;
          else if (variant.priceModifier) price += variant.priceModifier;
          availableStock = variant.stock;
          selectedVariantName = variant.name || variant.size;
        }
      }

      const qty = Number(item.quantity) || 1;
      if (qty > availableStock && availableStock > 0) {
        return res.status(400).json({
          success: false,
          message: `Only ${availableStock} unit(s) available for "${product.name}"`,
        });
      }

      const firstImg = Array.isArray(product.images) ? product.images[0] : product.image;
      const imageUrl = typeof firstImg === 'string' ? firstImg : (firstImg?.url || '/logo.jpg');

      orderItems.push({
        product: product._id,
        name: product.name,
        image: imageUrl,
        price,
        size: selectedVariantName || undefined,
        quantity: qty,
      });

      subtotal += price * qty;
    }

    const shippingFee = subtotal >= 999 || subtotal === 0 ? 0 : 99;
    const totalAmount = subtotal + shippingFee;

    // Create order
    const order = await Order.create({
      orderNumber: generateOrderNumber(),
      customer: req.user._id,
      items: orderItems,
      shippingAddress: formattedAddress,
      subtotal,
      shippingFee,
      totalAmount,
      paymentMethod: req.body.paymentMethod || 'COD',
      paymentStatus: 'Pending',
      orderStatus: 'Pending',
      customerNote,
    });

    // Deduct stock after order creation
    for (const item of rawItems) {
      const prodId = item.productId || item.product;
      const product = await Product.findById(prodId);
      if (!product) continue;

      const qty = Number(item.quantity) || 1;
      const selectedVariantName = item.variantName || item.size || '';

      if (product.hasVariants && product.variants?.length > 0) {
        const vIndex = product.variants.findIndex(
          (v) => v.name === selectedVariantName || v.size === selectedVariantName
        );
        if (vIndex !== -1) {
          product.variants[vIndex].stock = Math.max(0, product.variants[vIndex].stock - qty);
        }
      } else {
        product.stock = Math.max(0, product.stock - qty);
      }

      const totalStock = product.hasVariants
        ? product.variants.reduce((s, v) => s + (v.stock || 0), 0)
        : product.stock;
      if (totalStock === 0) product.isAvailable = false;
      await product.save();
    }

    await order.populate('customer', 'name email phone');
    res.status(201).json({ success: true, order });
  } catch (err) { next(err); }
};

// @route  GET /api/orders/my-orders
// @access Private (customer)
export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ customer: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (err) { next(err); }
};

// @route  GET /api/orders/:id
// @access Private (customer — own order only, or admin)
export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('customer', 'name email phone');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    // Customers can only view their own orders
    if (req.user.role !== 'admin' && order.customer._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    res.json({ success: true, order });
  } catch (err) { next(err); }
};

// @route  PATCH /api/orders/:id/cancel
// @access Private (customer)
export const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, customer: req.user._id });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const cancellable = ['Pending', 'Confirmed'];
    if (!cancellable.includes(order.orderStatus)) {
      return res.status(400).json({ success: false, message: `Cannot cancel an order that is already "${order.orderStatus}"` });
    }

    order.orderStatus = 'Cancelled';
    order.cancelledAt = new Date();
    order.cancelReason = req.body.reason || 'Cancelled by customer';
    await order.save();

    // Restore stock
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (!product) continue;
      if (product.hasVariants && item.size) {
        const v = product.variants.find((v) => v.size === item.size);
        if (v) v.stock += item.quantity;
      } else {
        product.stock += item.quantity;
      }
      product.isAvailable = true;
      await product.save();
    }

    res.json({ success: true, order });
  } catch (err) { next(err); }
};

// ─── Admin Controllers ──────────────────────────────────────────────

// @route  GET /api/orders/admin/all
// @access Admin
export const getAllOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20, search } = req.query;
    const filter = {};
    if (status) filter.orderStatus = status;

    let orders = await Order.find(filter)
      .populate('customer', 'name email phone')
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    if (search) {
      orders = orders.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
          o.customer?.name?.toLowerCase().includes(search.toLowerCase())
      );
    }

    const total = await Order.countDocuments(filter);
    res.json({ success: true, orders, pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) } });
  } catch (err) { next(err); }
};

// @route  PATCH /api/orders/admin/:id/status
// @access Admin
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, orderStatus, adminNote } = req.body;
    const newStatus = status || orderStatus;
    const allowed = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
    if (!allowed.includes(newStatus)) {
      return res.status(400).json({ success: false, message: `Invalid status "${newStatus}"` });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    order.orderStatus = newStatus;
    if (adminNote !== undefined) order.adminNote = adminNote;
    if (newStatus === 'Delivered') order.paymentStatus = 'Paid';
    await order.save();

    res.json({ success: true, order });
  } catch (err) { next(err); }
};

// @route  GET /api/orders/admin/stats
// @access Admin
export const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalOrders,
      pendingOrders,
      processingOrders,
      deliveredOrders,
      cancelledOrders,
      totalProducts,
      totalCustomers,
      revenueData,
      deliveredRevenueData
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ orderStatus: 'Pending' }),
      Order.countDocuments({ orderStatus: 'Processing' }),
      Order.countDocuments({ orderStatus: 'Delivered' }),
      Order.countDocuments({ orderStatus: 'Cancelled' }),
      (await import('../models/Product.js')).default.countDocuments(),
      User.countDocuments({ role: 'customer' }),
      Order.aggregate([
        { $match: { orderStatus: { $nin: ['Cancelled'] } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      Order.aggregate([
        { $match: { orderStatus: 'Delivered' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
    ]);

    const totalRevenue = revenueData[0]?.total || 0;
    const deliveredRevenue = deliveredRevenueData[0]?.total || 0;

    const recentOrders = await Order.find()
      .populate('customer', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      stats: {
        totalOrders,
        pendingOrders,
        processingOrders,
        deliveredOrders,
        cancelledOrders,
        totalProducts,
        totalCustomers,
        totalRevenue,
        revenue: totalRevenue,
        deliveredRevenue,
        recentOrders,
      },
    });
  } catch (err) { next(err); }
};
