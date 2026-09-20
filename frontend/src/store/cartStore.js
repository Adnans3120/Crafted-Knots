import { create } from 'zustand';

const CART_KEY = 'ck_cart';

const loadCart = () => {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveCart = (items) => {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  } catch (err) {
    console.error('Failed to save cart to localStorage', err);
  }
};

const useCartStore = create((set, get) => ({
  items: loadCart(),

  addToCart: (product, selectedVariant = null, quantity = 1) => {
    const items = get().items;
    const variantId = selectedVariant?._id || selectedVariant?.name || 'standard';
    const cartItemId = `${product._id}_${variantId}`;

    const existingIndex = items.findIndex((i) => i.cartItemId === cartItemId);
    let updated;

    if (existingIndex > -1) {
      updated = [...items];
      updated[existingIndex].quantity += quantity;
    } else {
      updated = [
        ...items,
        {
          cartItemId,
          product,
          selectedVariant,
          quantity,
        },
      ];
    }

    saveCart(updated);
    set({ items: updated });
  },

  // Alias for backward compatibility
  addItem: (product, quantity = 1, variant = null) => {
    get().addToCart(product, variant, quantity);
  },

  updateQuantity: (cartItemId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(cartItemId);
      return;
    }

    const updated = get().items.map((i) =>
      i.cartItemId === cartItemId || i._id === cartItemId ? { ...i, quantity } : i
    );

    saveCart(updated);
    set({ items: updated });
  },

  removeItem: (cartItemId) => {
    const updated = get().items.filter(
      (i) => i.cartItemId !== cartItemId && i._id !== cartItemId
    );
    saveCart(updated);
    set({ items: updated });
  },

  clearCart: () => {
    saveCart([]);
    set({ items: [] });
  },

  getSubtotal: () => {
    const items = get().items || [];
    return items.reduce((acc, item) => {
      const price = item.selectedVariant
        ? item.selectedVariant.price
        : item.product?.discountPrice || item.product?.price || item.price || 0;
      return acc + price * item.quantity;
    }, 0);
  },

  getItemCount: () => {
    const items = get().items || [];
    return items.reduce((acc, item) => acc + item.quantity, 0);
  },

  // Getters for legacy property access
  get subtotal() {
    return get().getSubtotal();
  },
  get itemCount() {
    return get().getItemCount();
  },
}));

export default useCartStore;
