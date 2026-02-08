import { useQuery } from '@tanstack/react-query';
import { fetchRecentReports } from './api';
import { reportKeys } from './keys';

export const useRecentReports = ({ limit = 10, q } = {}) =>
  useQuery({
    queryKey: reportKeys.list({ limit, q: q || '' }),
    queryFn: () => fetchRecentReports({ limit, q }),
  });
