export const normalizeName = (name = '') =>
  name
    .toLowerCase()
    .trim()
    .replace(/[\u0000-\u001f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/[^a-z0-9가-힣-]/g, '')
    .trim();
