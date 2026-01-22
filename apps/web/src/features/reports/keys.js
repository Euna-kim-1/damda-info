export const reportsKeys = {
  all: ['reports'],
  list: (params) => ['reports', 'list', params ?? {}],
  detail: (id) => ['reports', 'detail', id],
};
