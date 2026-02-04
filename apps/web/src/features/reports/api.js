// features/reports/api.js
import { apiGet } from "../../shared/api/client";

/**
 * 최근/검색 report 목록 가져오기
 * @param {number} limit
 * @param {string} q
 */
export function fetchRecentReports({ limit = 10, q } = {}) {
  const params = new URLSearchParams();
  params.set("limit", String(limit));
  if (q) params.set("q", q);

  return apiGet(`/report?${params.toString()}`);
}
