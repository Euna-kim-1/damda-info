import {
  Box,
  Paper,
  BottomNavigation,
  BottomNavigationAction,
} from '@mui/material';
import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import TopNav from './TopNav';

import ContainerSection from './ContainerSection';
import FloatingActionMenu from './FloatingActionMenu';
import StorefrontIcon from '@mui/icons-material/Storefront';
import LocalMallOutlinedIcon from '@mui/icons-material/LocalMallOutlined';
import ListAltIcon from '@mui/icons-material/ListAlt';
import CottageOutlinedIcon from '@mui/icons-material/CottageOutlined';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import CalculateIcon from '@mui/icons-material/Calculate';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';

const NAV_HEIGHT = 64;
const navItems = [
  { label: 'Home', value: '/', icon: <CottageOutlinedIcon /> },
  { label: 'Report', value: '/report', icon: <LocalMallOutlinedIcon /> },
  {
    value: '__fab__',
  },
  { label: 'Store', value: '/storesMap', icon: <StorefrontIcon /> },
  { label: 'List', value: '/lists', icon: <ListAltIcon /> },
];

const AppShell = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const current =
    navItems.find((n) =>
      n.value === '/'
        ? location.pathname === '/'
        : location.pathname.startsWith(n.value),
    )?.value ?? '/';

  const fabActions = useMemo(
    () => [
      {
        label: 'Receipt',
        angle: -140,
        icon: <ReceiptLongIcon />,
        color: 'secondary.light',
        onClick: () => {
          navigate('/profile');
        },
      },
      {
        label: 'Camera',
        angle: -90,
        icon: <PhotoCameraIcon />,
        color: 'secondary.main',
        onClick: () => {
          navigate('/upload');
        },
      },
      {
        label: 'Calculator',
        angle: -40,
        icon: <CalculateIcon />,
        color: 'secondary.light',
        onClick: () => {
          navigate('/calculator');
        },
      },
    ],
    [navigate],
  );

  return (
    <Box
      sx={(theme) => ({
        minHeight: '100vh',
        color: 'text.primary',
        bgcolor: 'background.default',
        backgroundImage: `
          linear-gradient(
            180deg,
            ${theme.palette.primary.dark}22 0%,
            ${theme.palette.primary.main}22 50%,
            ${theme.palette.custom.navy} 100%
          )
        `,
      })}
    >
      {/* 상단 네비는 공통 */}
      <TopNav />

      <Box sx={{ pb: `${NAV_HEIGHT + 16}px` }}>{children}</Box>

      <Paper
        elevation={12}
        sx={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          borderTop: '1px solid',
          borderColor: 'divider',
          borderRadius: 0,
          pb: 'env(safe-area-inset-bottom)',
          overflow: 'visible',
          zIndex: (theme) => theme.zIndex.appBar + 10,
        }}
      >
        <ContainerSection>
          <Box sx={{ position: 'relative' }}>
            <BottomNavigation
              value={current}
              onChange={(e, next) => {
                if (next === '__fab__') return;
                navigate(next);
              }}
              showLabels
              sx={{
                height: NAV_HEIGHT,
                '& .MuiBottomNavigationAction-root.Mui-selected': {
                  color: 'secondary.main',
                },
                '& .MuiBottomNavigationAction-root.Mui-selected svg': {
                  color: 'secondary.main',
                },
              }}
            >
              {navItems.map((item) => (
                <BottomNavigationAction
                  key={item.value}
                  label={item.label}
                  value={item.value}
                  icon={item.icon}
                  showLabel={item.showLabel}
                  aria-label={item.ariaLabel}
                />
              ))}
            </BottomNavigation>

            <FloatingActionMenu actions={fabActions} radius={92} />
          </Box>
        </ContainerSection>
      </Paper>
    </Box>
  );
};

export default AppShell;
