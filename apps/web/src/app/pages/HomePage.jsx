import { Box, Typography, Stack, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ContainerSection from '../../shared/layout/ContainerSection';
import PrimaryButton from '../../shared/ui/buttons/PrimaryButton';
import { useRecentReports } from '../../features/reports/hooks';
import { ReportCard } from '../../shared/ui/reports';
import StoresMapView from './store/StoresMapView';
import AddIcon from '@mui/icons-material/Add';
import AddHomeWorkOutlinedIcon from '@mui/icons-material/AddHomeWorkOutlined';
function money(n) {
  const num = Number(n);
  if (Number.isNaN(num)) return '';
  return `$${num.toFixed(2)}`;
}

export default function HomePage() {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useRecentReports({
    page: 1,
    pageSize: 10,
  });
  const items = data?.reports ?? [];

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
            <PrimaryButton
              variantStyle="primary3"
              startIcon={<AddIcon fontSize="small" />}
            >
              Share a price
            </PrimaryButton>
          </Box>
        </Stack>
      </Box>

      {/* ✅ Recent reports */}
      <Box sx={{ mt: 3 }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ mb: 1.5 }}
        >
          <Typography sx={{ fontWeight: 800 }}>Recent reports</Typography>

          <PrimaryButton
            variantStyle="primary4"
            onClick={() => navigate('/report')}
          >
            View more
          </PrimaryButton>
        </Stack>

        {isLoading && (
          <Typography sx={{ color: 'text.secondary' }}>Loading...</Typography>
        )}

        {isError && (
          <Typography sx={{ color: 'error.main' }}>
            Failed to load reports.
          </Typography>
        )}

        {!isLoading && !isError && items.length === 0 && (
          <Typography sx={{ color: 'text.secondary' }}>
            No reports yet.
          </Typography>
        )}

        {!isLoading && !isError && (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, minmax(0, 1fr))',
              },
              gap: 1.5,
              width: '100%',
            }}
          >
            {items.slice(0, 2).map((r) => (
              <ReportCard
                key={r.id}
                title={r.product_name}
                storeName={r.store_name}
                price={money(r.price)}
                imageUrl={r.image_url}
                reportedAt={r.reported_at}
              />
            ))}
          </Box>
        )}
      </Box>

      <Box sx={{ mt: 3 }}>
        <Typography sx={{ fontWeight: 800, mb: 1.5 }}>Stores</Typography>

        <Box sx={{ position: 'relative' }}>
          <StoresMapView />
          <PrimaryButton
            startIcon={<AddHomeWorkOutlinedIcon fontSize="small" />}
            variantStyle="primary2"
            onClick={() => navigate('/storesMap')}
            sx={{
              position: 'absolute',
              bottom: 12,
              left: 12,
              zIndex: 1000,
              pointerEvents: 'auto',
            }}
          >
            View store details
          </PrimaryButton>
        </Box>
      </Box>
    </ContainerSection>
  );
}
