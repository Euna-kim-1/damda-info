import { Box, Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ContainerSection from '../../../shared/layout/ContainerSection';
import StoresMapView from './StoresMapView';

export default function StoresMap() {
  const navigate = useNavigate();

  return (
    <ContainerSection sx={{ py: 2 }}>
      <Box
        sx={{
          mb: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        <Box>
          <Typography sx={{ fontWeight: 800, mb: 0.5 }}>Stores</Typography>
        </Box>
        <Button variant="text" onClick={() => navigate(-1)}>
          Back
        </Button>
      </Box>

      <StoresMapView
        height={{ xs: '40vh', md: '45vh' }}
        scrollWheelZoom
        fitPadding={[40, 40]}
        showPopups
      />
    </ContainerSection>
  );
}
