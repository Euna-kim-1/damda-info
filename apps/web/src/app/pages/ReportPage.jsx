import { Box, Button, Typography } from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import { useRecentReports } from '../../features/reports/hooks';

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatPrice(price) {
  if (price == null) return '—';
  const n = Number(price);
  if (!Number.isFinite(n)) return '—';
  return `$${n.toFixed(2)}`;
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
    <Box sx={{ p: 2 }}>
      <Typography variant="subtitle1" sx={{ mb: 1 }}>
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
        <Typography color="text.secondary">
          {q ? '(No results)' : '(No reports yet)'}
        </Typography>
      )}

      {!isLoading &&
        !isError &&
        reports.map((r) => {
          const hasImage = !!r.image_url;

          return (
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

              {/* ✅ 기존: image_url 있을 때는 그대로 이미지 렌더링 */}
              {hasImage ? (
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
                    flexShrink: 0,
                  }}
                />
              ) : (
                /* ✅ 새로 추가: image_url이 null이면 placeholder (깨짐 방지) */
                <Box
                  sx={{
                    width: 90,
                    height: 90,
                    borderRadius: 1,
                    bgcolor: 'grey.100',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    px: 1,
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    No image
                  </Typography>
                </Box>
              )}

              <Box sx={{ flex: 1, pr: 6 }}>
                <Typography variant="subtitle1" fontWeight={600} color="text.primary">
                  {r.product_name ?? '(No name)'}
                </Typography>

                <Typography variant="subtitle2" color="secondary.dark" display="block">
                  {formatPrice(r.price)}
                </Typography>

                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                  Store: {r.store_name ?? '—'}
                </Typography>
              </Box>
            </Box>
          );
        })}
    </Box>
  );
}
