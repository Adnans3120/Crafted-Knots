export const cleanWhatsAppNumber = (phone) => {
  const raw = phone || import.meta.env.VITE_WHATSAPP_NUMBER || '916364483034';
  let cleaned = String(raw).replace(/\D/g, ''); // strip spaces, +, -, etc.
  if (cleaned.length === 10) {
    cleaned = '91' + cleaned; // default to India prefix 91 if 10 digits
  }
  return cleaned;
};

export const getWhatsAppUrl = (message = '', phone) => {
  const num = cleanWhatsAppNumber(phone);
  const encodedText = encodeURIComponent(message);
  return `https://wa.me/${num}${encodedText ? `?text=${encodedText}` : ''}`;
};
