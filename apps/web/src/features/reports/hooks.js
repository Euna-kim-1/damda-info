import { useQuery } from '@tanstack/react-query';
import { fetchPopularReports, fetchRecentReports } from './api';
import { reportKeys } from './keys';

export const useRecentReports = ({ page = 1, pageSize = 10, limit, q } = {}) => {
  const finalLimit = limit ?? pageSize;

  return useQuery({
    queryKey: reportKeys.list({ page, limit: finalLimit, q: q || '' }),
    queryFn: () => fetchRecentReports({ page, limit: finalLimit, q }),
  });
};

export const usePopularReports = ({ limit = 5 } = {}) => {
  return useQuery({
    queryKey: reportKeys.popular({ limit }),
    queryFn: () => fetchPopularReports({ limit }),
  });
};
