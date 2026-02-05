import { Box, Button, Typography } from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import { useRecentReports } from '../../features/reports/hooks';
import ContainerSection from '../../shared/layout/ContainerSection';

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function ReportPage() {
  const [params] = useSearchParams();
  const q = (params.get('q') || '').trim();

  const { data, isLoading, isError, refetch } = useRecentReports({
    limit: 10,
    q: q || undefined,
  });

  const reports = data?.reports ?? [];

  return (
    <ContainerSection sx={{ py: 2 }}>
      <Typography variant="overline" sx={{ mb: 1 }}>
        {q ? `Results for "${q}"` : 'Recent reports'}
      </Typography>

      {isLoading && <Typography>Loading...</Typography>}

      {isError && (
        <Box sx={{ mt: 1 }}>
          <Typography color="error" sx={{ mb: 1 }}>
            Failed to load reports.
          </Typography>
          <Button variant="outlined" onClick={() => refetch()}>
            Retry
          </Button>
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

      {!isLoading &&
        !isError &&
        reports.map((r) => (
          <Box
            key={r.id}
            sx={{
              position: 'relative',
              display: 'flex',
              gap: 2,
              mb: 2,
              p: 1.5,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            {r.reported_at && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ position: 'absolute', top: 8, right: 12 }}
              >
                Updated: {formatDate(r.reported_at)}
              </Typography>
            )}

            <Box
              component="img"
              src={r.image_url}
              alt={r.product_name ?? 'report image'}
              sx={{
                width: 90,
                height: 90,
                objectFit: 'cover',
                borderRadius: 1,
                bgcolor: 'grey.100',
              }}
            />

            <Box sx={{ flex: 1, pr: 6, pt: { xs: 1.3 } }}>
              <Typography
                variant="subtitle1"
                fontWeight={600}
                color="text.primary"
              >
                {r.product_name ?? '(No name)'}
              </Typography>

              <Typography
                variant="subtitle2"
                color="secondary.dark"
                display="block"
              >
                {r.price != null ? `$${Number(r.price).toFixed(2)}` : '—'}
              </Typography>

              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                sx={{ mt: 1 }}
              >
                Store: {r.store_name ?? '—'}
              </Typography>
            </Box>
          </Box>
        ))}
    </ContainerSection>
  );
}
