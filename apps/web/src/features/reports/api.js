// features/reports/api.js
import { apiGet } from "../../shared/api/client";

/**
 * 최근 report 목록 가져오기
 * @param {number} limit
 */
export function fetchRecentReports({ limit = 10 } = {}) {
  return apiGet(`/report?limit=${limit}`);
}
