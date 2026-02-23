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

export const formatFixedDecimal = (value, digits = 2, fallback = '') => {
  const num = Number(value);
  if (!Number.isFinite(num)) return fallback;

  const safeDigits = Number.isInteger(digits)
    ? Math.min(Math.max(digits, 0), 20)
    : 2;
  const normalized = Object.is(num, -0) ? 0 : num;
  return normalized.toFixed(safeDigits);
};
