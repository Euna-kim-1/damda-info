import { Box, Button, Typography } from '@mui/material';
import { useRecentReports } from '../../features/reports/hooks';

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function ReportPage() {
  const { data, isLoading, isError, refetch } = useRecentReports({ limit: 10 });

  const reports = data?.reports ?? [];

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="subtitle1" sx={{ mb: 1 }}>
        Recent reports
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
        <Typography color="text.secondary">(No reports yet)</Typography>
      )}

      {!isLoading &&
        !isError &&
        reports.map((r) => (
          <Box
            key={r.id}
            sx={{
              position: 'relative', // ✅ 기준점
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
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 12,
                }}
              >
                Updated: {formatDate(r.reported_at)}
              </Typography>
            )}

            {/* Thumbnail */}
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

            {/* Info */}
            <Box sx={{ flex: 1, pr: 6 }}>
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
    </Box>
  );
}
