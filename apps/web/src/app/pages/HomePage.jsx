import { Box, Typography, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ContainerSection from '../../shared/layout/ContainerSection';
import PrimaryButton from '../../shared/ui/PrimaryButton';
import { useReportsList } from '../../features/reports/hooks';
import { ReportCard } from '../../shared/ui/reports';

function money(n) {
  const num = Number(n);
  if (Number.isNaN(num)) return '';
  return `$${num.toFixed(2)}`;
}

export default function HomePage() {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useReportsList({
    page: 1,
    pageSize: 10,
  });
  const items = data?.items ?? [];

  return (
    <ContainerSection sx={{ py: 2 }}>
      {/* Hero */}
      <Box
        sx={{
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 4,
          overflow: 'hidden',
          p: { xs: 3, md: 4 },
        }}
      >
        <Stack spacing={2}>
          <Typography variant="h4">
            Share prices.
            <br />
            Help your neighbors.
          </Typography>

          <Typography
            variant="overline"
            sx={{
              color: 'text.secondary',
            }}
          >
            Find the best price near you.
          </Typography>

          <Box>
            <PrimaryButton onClick={() => navigate('/upload')}>
              Share a price
            </PrimaryButton>
          </Box>
        </Stack>
      </Box>

      {/* ✅ Recent reports */}
      <Box sx={{ mt: 3 }}>
        <Typography sx={{ fontWeight: 800, mb: 1.5 }}>
          Recent reports
        </Typography>

        {isLoading && (
          <Typography sx={{ color: 'text.secondary' }}>Loading...</Typography>
        )}

        {isError && (
          <Typography sx={{ color: 'error.main' }}>
            Failed to load reports.
          </Typography>
        )}

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
            gap: 1.5,
            width: '100%',
          }}
        >
          {items.map((r) => (
            <ReportCard
              key={r.id}
              title={r.productName}
              brand={r.brand}
              storeName={r.storeName}
              price={money(r.price)}
              imageUrl={r.photoUrl} // ❗ 없으면 undefined → 자동으로 cart.png
            />
          ))}
        </Box>
      </Box>
    </ContainerSection>
  );
}
