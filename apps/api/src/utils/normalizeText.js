export const normalizeName = (name = '') =>
  String(name)
    .toLowerCase()
    .trim()
    .split('')
    .filter((char) => char.charCodeAt(0) > 31)
    .join('')
    .replace(/[^a-z0-9가-힣\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
