// features/reports/hooks.js
import { useQuery } from "@tanstack/react-query";
import { fetchRecentReports } from "./api";
import { reportKeys } from "./keys";

export function useRecentReports({ limit = 10, q } = {}) {
  return useQuery({
    queryKey: reportKeys.list({ limit, q: q || "" }),
    queryFn: () => fetchRecentReports({ limit, q }),
  });
}
