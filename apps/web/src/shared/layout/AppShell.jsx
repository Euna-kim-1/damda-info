import {
  Box,
  Paper,
  BottomNavigation,
  BottomNavigationAction,
  Typography,
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';

import TopNav from './TopNav';

import ContainerSection from './ContainerSection';
import StorefrontIcon from '@mui/icons-material/Storefront';
import LocalOfferRoundedIcon from '@mui/icons-material/LocalOfferRounded';
import ListAltIcon from '@mui/icons-material/ListAlt';
import CottageIcon from '@mui/icons-material/Cottage';

const NAV_HEIGHT = 72;

const navItems = [
  { label: 'Home', value: '/', icon: <CottageIcon /> },
  { label: 'Report', value: '/report', icon: <LocalOfferRoundedIcon /> },
  {
    value: '/upload',
    showLabel: false,
    ariaLabel: 'Add',
    icon: (
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          bgcolor: 'primary.light',
          display: 'grid',
          placeItems: 'center',
          boxShadow: 2,
          transform: 'translateY(-6px)',
        }}
      >
        <Typography component="span" aria-label="add" fontSize={24}>
          +
        </Typography>
      </Box>
    ),
  },
  { label: 'Store', value: '/storesMap', icon: <StorefrontIcon /> },
  { label: 'List', value: '/lists', icon: <ListAltIcon /> },
];

export default function AppShell({ children }) {
  const location = useLocation();
  const navigate = useNavigate();

  const current =
    navItems.find((n) =>
      n.value === '/'
        ? location.pathname === '/'
        : location.pathname.startsWith(n.value),
    )?.value ?? '/';

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
          pb: 'env(safe-area-inset-bottom)',
          zIndex: (theme) => theme.zIndex.appBar + 10,
        }}
      >
        <ContainerSection>
          <BottomNavigation
            value={current}
            onChange={(e, next) => navigate(next)}
            showLabels
            sx={{ height: NAV_HEIGHT }}
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
        </ContainerSection>
      </Paper>
    </Box>
  );
}
