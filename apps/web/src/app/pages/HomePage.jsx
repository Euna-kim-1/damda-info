import { useRef, useState } from 'react';
import { Box, Typography, Stack, TextField, InputAdornment } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ContainerSection from '../../shared/layout/ContainerSection';
import PrimaryButton from '../../shared/ui/buttons/PrimaryButton';
import { ReportCard } from '../../shared/ui/reports';
import { useRecentReports } from '../../features/reports/hooks';
import StoresMapView from './store/StoresMapView';
import AddHomeWorkOutlinedIcon from '@mui/icons-material/AddHomeWorkOutlined';
import SearchIcon from '@mui/icons-material/Search';

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
  const { data, isLoading, isError } = useRecentReports({
    page: 1,
    pageSize: 10,
  });
  const items = data?.reports ?? [];

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

          <Stack
            direction="row"
            spacing={1.25}
            sx={{
              overflowX: 'auto',
              pb: 0.5,
              WebkitOverflowScrolling: 'touch',
              touchAction: 'pan-x',
              scrollbarWidth: 'none',
              '&::-webkit-scrollbar': {
                display: 'none',
              },
            }}
          >
            <Box
              sx={{
                width: {
                  xs: '88%',
                  sm: 'calc((100% - 10px) / 2)',
                  md: 'calc((100% - 20px) / 3)',
                },
                flex: '0 0 auto',
                borderRadius: 2.5,
                p: 2,
                color: '#fff',
                background:
                  'linear-gradient(135deg, #0f7a86 0%, #15537f 55%, #123d69 100%)',
                boxShadow: '0 6px 14px rgba(22, 74, 104, 0.2)',
              }}
            >
              <Typography sx={{ fontSize: 12, opacity: 0.9, mb: 0.5 }}>
                Sponsored
              </Typography>
              <Typography sx={{ fontSize: { xs: 22, md: 26 }, fontWeight: 800, lineHeight: 1.1 }}>
                Fresh deals
                <br />
                this week
              </Typography>
              <PrimaryButton variantStyle="primary1" sx={{ mt: 1.3 }}>
                Learn more
              </PrimaryButton>
            </Box>

            <Box
              sx={{
                width: {
                  xs: '88%',
                  sm: 'calc((100% - 10px) / 2)',
                  md: 'calc((100% - 20px) / 3)',
                },
                flex: '0 0 auto',
                borderRadius: 2.5,
                p: 2,
                bgcolor: '#F2EEE8',
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: '0 6px 14px rgba(0,0,0,0.08)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <Typography
                sx={{
                  color: '#4A1F14',
                  fontSize: { xs: 23, md: 28 },
                  fontWeight: 800,
                  lineHeight: 1.1,
                }}
              >
                Start the day
                <br />
                with great taste
              </Typography>
              <PrimaryButton variantStyle="primary4" sx={{ mt: 1.3 }}>
                Order now
              </PrimaryButton>
            </Box>

            <Box
              sx={{
                width: {
                  xs: '88%',
                  sm: 'calc((100% - 10px) / 2)',
                  md: 'calc((100% - 20px) / 3)',
                },
                flex: '0 0 auto',
                borderRadius: 2.5,
                p: 2,
                color: '#fff',
                background:
                  'linear-gradient(135deg, #58723c 0%, #6e7b4f 55%, #85915f 100%)',
                boxShadow: '0 6px 14px rgba(72, 87, 46, 0.2)',
              }}
            >
              <Typography sx={{ fontSize: 12, opacity: 0.9, mb: 0.5 }}>
                Sponsored
              </Typography>
              <Typography sx={{ fontSize: { xs: 22, md: 26 }, fontWeight: 800, lineHeight: 1.1 }}>
                Save more
                <br />
                every weekend
              </Typography>
              <PrimaryButton variantStyle="primary1" sx={{ mt: 1.3 }}>
                Check deals
              </PrimaryButton>
            </Box>
          </Stack>

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

        {!isLoading && !isError && (
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
            {items.slice(0, 6).map((r) => (
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
};

export default HomePage;
