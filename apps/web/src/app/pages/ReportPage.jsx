import { Box, Button, Typography } from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import { useRecentReports } from '../../features/reports/hooks';
import ContainerSection from '../../shared/layout/ContainerSection';
import { formatPrice, formatShortDate } from '../../shared/utils/formatters';

const ReportPage = () => {
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
                  Updated: {formatShortDate(r.reported_at)}
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
                  {formatPrice(r.price, '—')}
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
          );
        })}
    </ContainerSection>
  );
};

export default ReportPage;
