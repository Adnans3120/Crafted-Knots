// Generate a unique order number like CK-20260918-A3F2
const generateOrderNumber = () => {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `CK-${dateStr}-${random}`;
};

export default generateOrderNumber;
