import { Box, Typography } from '@mui/material';
import ContainerSection from '../../../shared/layout/ContainerSection';
import StoresMapView from './StoresMapView';

const StoresMap = () => {
  return (
    <ContainerSection sx={{ py: 2 }}>
      <Box
        sx={{
          mb: 1.5,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <Typography
          variant="overline"
          sx={{
            display: 'block',
            color: 'text.secondary',
            width: '100%',
            px: 0.5,
            letterSpacing: 1.2,
            fontSize: 12,
          }}
        >
          Explore nearby stores on the map.
        </Typography>
      </Box>

      <StoresMapView
        height={{ xs: '40vh', md: '45vh' }}
        scrollWheelZoom
        fitPadding={[40, 40]}
        showPopups
        enableMyLocationFeatures
      />
    </ContainerSection>
  );
};

export default StoresMap;
