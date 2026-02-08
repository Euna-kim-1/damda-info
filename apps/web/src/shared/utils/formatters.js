export const formatShortDate = (dateStr, fallback = '') => {
  if (!dateStr) return fallback;
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return fallback;
  return date.toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatPrice = (value, fallback = '') => {
  const num = Number(value);
  if (Number.isNaN(num)) return fallback;
  return `$${num.toFixed(2)}`;
};
