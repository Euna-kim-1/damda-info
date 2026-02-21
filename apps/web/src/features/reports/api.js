import { apiGet } from '../../shared/api/client';

/**
 * 최근/검색 report 목록 가져오기
 * @param {number} page
 * @param {number} limit
 * @param {string} q
 */
export const fetchRecentReports = ({ page = 1, limit = 10, q } = {}) => {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('limit', String(limit));
  if (q) params.set('q', q);

  return apiGet(`/report?${params.toString()}`);
};

/**
 * 인기 report 목록 가져오기 (product_id 기준 집계 Top N)
 * @param {number} limit
 */
export const fetchPopularReports = ({ limit = 5 } = {}) => {
  const params = new URLSearchParams();
  params.set('limit', String(limit));

  return apiGet(`/report/popular?${params.toString()}`);
};
