import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  // Snapshot fields — frozen at time of order so price changes don't affect history
  name: { type: String, required: true },
  image: { type: String },
  price: { type: Number, required: true }, // actual price paid (base + modifier)
  size: { type: String }, // selected variant size, if applicable
  quantity: { type: Number, required: true, min: 1 },
});

const shippingAddressSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  line1: { type: String, required: true },
  line2: String,
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
});

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [orderItemSchema],
    shippingAddress: { type: shippingAddressSchema, required: true },
    subtotal: { type: Number, required: true },
    shippingFee: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    paymentMethod: {
      type: String,
      enum: ['COD', 'Online'],
      default: 'COD',
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
      default: 'Pending',
    },
    orderStatus: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Pending',
    },
    customerNote: { type: String },
    adminNote: { type: String },
    cancelledAt: Date,
    cancelReason: String,
  },
  { timestamps: true }
);

// Virtual for status field compatibility
orderSchema.virtual('status')
  .get(function () { return this.orderStatus; })
  .set(function (val) { this.orderStatus = val; });

orderSchema.set('toJSON', { virtuals: true });
orderSchema.set('toObject', { virtuals: true });

const Order = mongoose.model('Order', orderSchema);
export default Order;
