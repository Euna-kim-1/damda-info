export const normalizeStoreName = (name = '') =>
  name
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[^a-z0-9가-힣]/g, '');
