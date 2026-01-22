import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getReports, getReport, createReport } from './api';
import { reportsKeys } from './keys';

export function useReportsList(params) {
  return useQuery({
    queryKey: reportsKeys.list(params),
    queryFn: () => getReports(), // ✅ params 안 넘김
    keepPreviousData: true,
  });
}

export function useReport(id) {
  return useQuery({
    queryKey: reportsKeys.detail(id),
    queryFn: () => getReport(id),
    enabled: !!id,
  });
}

export function useCreateReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createReport,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: reportsKeys.all });
    },
  });
}
