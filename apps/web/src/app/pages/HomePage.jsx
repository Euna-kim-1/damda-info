import { useMemo, useRef, useState } from 'react';
import { Box, Typography, Stack, TextField, InputAdornment } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ContainerSection from '../../shared/layout/ContainerSection';
import PrimaryButton from '../../shared/ui/buttons/PrimaryButton';
import { ReportCard } from '../../shared/ui/reports';
import { usePopularReports, useRecentReports } from '../../features/reports/hooks';
import StoresMapView from './store/StoresMapView';
import AddHomeWorkOutlinedIcon from '@mui/icons-material/AddHomeWorkOutlined';
import SearchIcon from '@mui/icons-material/Search';
import HomeLaunchBanners from './home/HomeLaunchBanners';
import LoadingState from '../../shared/ui/LoadingState';

const HomePage = () => {
  const navigate = useNavigate();
  const [searchKeyword, setSearchKeyword] = useState('');
  const popularRowRef = useRef(null);
  const dragRef = useRef({
    active: false,
    pointerId: null,
    startX: 0,
    startScrollLeft: 0,
  });
  const {
    data: recentData,
    isLoading: isRecentLoading,
    isError: isRecentError,
  } = useRecentReports({
    page: 1,
    pageSize: 10,
  });
  const {
    data: popularData,
    isLoading: isPopularLoading,
    isError: isPopularError,
  } = usePopularReports({
    limit: 5,
  });
  const items = useMemo(() => recentData?.reports ?? [], [recentData]);
  const popularItems = useMemo(() => popularData?.reports ?? [], [popularData]);

  const onSearch = () => {
    const query = searchKeyword.trim();
    if (!query) return;
    navigate(`/report?q=${encodeURIComponent(query)}`);
  };

  return (
    <ContainerSection sx={{ py: 2 }}>
      <Box
        sx={{
          mb: 2,
        }}
      >
        <Stack spacing={1.5}>
          <Typography
            variant="overline"
            sx={{
              color: 'text.secondary',
              px: 0.5,
              letterSpacing: 1.2,
              fontSize: 12,
            }}
          >
            Find the best price near you.
          </Typography>

          <TextField
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSearch();
            }}
            placeholder="Search products"
            fullWidth
            size="medium"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 999,
                bgcolor: 'background.paper',
                '& input': {
                  py: 1,
                  fontSize: 16,
                },
              },
            }}
          />

          <HomeLaunchBanners />

        </Stack>
      </Box>

      <Box sx={{ mt: 2.5 }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ mb: 1.25 }}
        >
          <Typography sx={{ fontWeight: 800 }}>Most Popular</Typography>
          <PrimaryButton
            variantStyle="primary4"
            onClick={() => navigate('/report')}
            sx={{ minWidth: 0 }}
          >
            See all
          </PrimaryButton>
        </Stack>

        {isPopularLoading && <LoadingState />}

        {isPopularError && (
          <Typography sx={{ color: 'error.main' }}>
            Failed to load popular reports.
          </Typography>
        )}

        {!isPopularLoading && !isPopularError && popularItems.length === 0 && (
          <Typography sx={{ color: 'text.secondary' }}>
            No popular reports yet.
          </Typography>
        )}

        {!isPopularLoading && !isPopularError && (
          <Stack
            ref={popularRowRef}
            direction="row"
            spacing={1.25}
            onPointerDown={(event) => {
              if (!popularRowRef.current) return;
              dragRef.current.active = true;
              dragRef.current.pointerId = event.pointerId;
              dragRef.current.startX = event.clientX;
              dragRef.current.startScrollLeft = popularRowRef.current.scrollLeft;
              popularRowRef.current.setPointerCapture?.(event.pointerId);
            }}
            onPointerMove={(event) => {
              if (!dragRef.current.active || !popularRowRef.current) return;
              const deltaX = event.clientX - dragRef.current.startX;
              popularRowRef.current.scrollLeft =
                dragRef.current.startScrollLeft - deltaX;
            }}
            onPointerUp={() => {
              if (!popularRowRef.current) return;
              if (
                dragRef.current.pointerId !== null &&
                popularRowRef.current.hasPointerCapture?.(dragRef.current.pointerId)
              ) {
                popularRowRef.current.releasePointerCapture(dragRef.current.pointerId);
              }
              dragRef.current.active = false;
              dragRef.current.pointerId = null;
            }}
            onPointerCancel={() => {
              dragRef.current.active = false;
              dragRef.current.pointerId = null;
            }}
            sx={{
              overflowX: 'auto',
              overflowY: 'hidden',
              pb: 0.5,
              WebkitOverflowScrolling: 'touch',
              touchAction: 'pan-x',
              cursor: 'grab',
              userSelect: 'none',
              scrollbarWidth: 'none',
              '&::-webkit-scrollbar': {
                display: 'none',
              },
            }}
          >
            {popularItems.map((r) => (
              <ReportCard key={`popular-${r.id}`} variant="popular" report={r} />
            ))}
          </Stack>
        )}
      </Box>

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

        {isRecentLoading && <LoadingState />}

        {isRecentError && (
          <Typography sx={{ color: 'error.main' }}>
            Failed to load reports.
          </Typography>
        )}

        {!isRecentLoading && !isRecentError && items.length === 0 && (
          <Typography sx={{ color: 'text.secondary' }}>
            No reports yet.
          </Typography>
        )}

        {!isRecentLoading && !isRecentError && (
          <Stack spacing={1.2}>
            {items.slice(0, 2).map((r) => (
              <ReportCard key={r.id} variant="recent" report={r} />
            ))}
          </Stack>
        )}
      </Box>

      <Box sx={{ mt: 3 }}>
        <Typography sx={{ fontWeight: 800, mb: 1.5 }}>Stores</Typography>

        <Box sx={{ position: 'relative' }}>
          <StoresMapView showLoading={!isRecentLoading} />
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
};

export default HomePage;
