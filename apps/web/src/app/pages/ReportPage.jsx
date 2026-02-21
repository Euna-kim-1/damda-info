import { Box, Pagination, Stack, Typography } from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import { useRecentReports } from '../../features/reports/hooks';
import ContainerSection from '../../shared/layout/ContainerSection';
import { ReportCard } from '../../shared/ui/reports';
import LoadingState from '../../shared/ui/LoadingState';

const ReportPage = () => {
  const [params, setParams] = useSearchParams();
  const q = (params.get('q') || '').trim();
  const rawPage = Number(params.get('page') || 1);
  const page = Number.isFinite(rawPage) && rawPage > 0 ? Math.trunc(rawPage) : 1;
  const pageSize = 10;

  const { data, isLoading, isError } = useRecentReports({
    page,
    pageSize,
    q: q || undefined,
  });

  const reports = data?.reports ?? [];
  const hasNext = Boolean(data?.has_next);
  const hasPrev = page > 1;
  const totalPages =
    Number.isFinite(data?.total_pages) && data.total_pages > 0
      ? data.total_pages
      : hasNext
        ? page + 1
        : page;
  const pageCount = Math.max(1, totalPages);

  const movePage = (nextPage) => {
    const safePage = Math.max(1, Math.trunc(nextPage));
    const nextParams = new URLSearchParams(params);
    if (safePage === 1) nextParams.delete('page');
    else nextParams.set('page', String(safePage));
    setParams(nextParams);
  };

  return (
    <ContainerSection sx={{ py: 2 }}>
      <Typography variant="overline" sx={{ mb: 1 }}>
        {q ? `Results for "${q}"` : 'Recent reports'}
      </Typography>

      {isLoading && <LoadingState />}

      {isError && (
        <Box
          sx={{
            mt: 3,
            mb: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: 1.25,
          }}
        >
          <Box
            component="img"
            src="/no-result.png"
            alt="No results"
            sx={{
              width: { xs: 250, sm: 350 },
              height: 'auto',
              opacity: 0.92,
            }}
          />
          <Typography variant="subtitle1" fontWeight={600} sx={{ color: 'text.secondary' }}>
            Failed to load
          </Typography>
        </Box>
      )}

      {!isLoading && !isError && reports.length === 0 && (
        <Box
          sx={{
            mt: 3,
            mb: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: 1,
          }}
        >
          <Box
            component="img"
            src="/no-result.png"
            alt="No results"
            sx={{
              width: { xs: 250, sm: 350 },
              height: 'auto',
              opacity: 0.9,
            }}
          />
          <Typography variant="subtitle1" fontWeight={600}>
            There are no results.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {q
              ? 'Try a different keyword or adjust your search.'
              : 'Reports will appear here once available.'}
          </Typography>
        </Box>
      )}

      {!isLoading && !isError && (
        <Stack spacing={1.2}>
          {reports.map((r) => (
            <ReportCard key={r.id} variant="recent" report={r} />
          ))}

          {reports.length > 0 && (
            <Stack alignItems="center" sx={{ pt: 0.5 }}>
              <Pagination
                page={page}
                count={pageCount}
                onChange={(_, value) => movePage(value)}
                shape="rounded"
                color="primary"
                siblingCount={0}
                boundaryCount={1}
                showFirstButton={hasPrev}
                showLastButton={hasNext}
              />
            </Stack>
          )}
        </Stack>
      )}
    </ContainerSection>
  );
};

export default ReportPage;
