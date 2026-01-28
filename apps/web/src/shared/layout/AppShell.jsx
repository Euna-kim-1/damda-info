import {
  Box,
  Paper,
  BottomNavigation,
  BottomNavigationAction,
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';

import TopNav from './TopNav';
import ContainerSection from './ContainerSection';

import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded';
import LocalOfferRoundedIcon from '@mui/icons-material/LocalOfferRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import CalculateRoundedIcon from '@mui/icons-material/CalculateRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';

const NAV_HEIGHT = 72;

const navItems = [
  { label: 'Upload', value: '/upload', icon: <LocalOfferRoundedIcon /> },
  { label: 'Store', value: '/storesMap', icon: <PeopleAltRoundedIcon /> },
  { label: 'Home', value: '/', icon: <StorefrontRoundedIcon /> },
  { label: 'Calculator', value: '/calculator', icon: <CalculateRoundedIcon /> },
  { label: 'Profile', value: '/profile', icon: <PersonRoundedIcon /> },
];

export default function AppShell({ children }) {
  const location = useLocation();
  const navigate = useNavigate();

  const current =
    navItems.find((n) => location.pathname.startsWith(n.value))?.value ?? '/';

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
              />
            ))}
          </BottomNavigation>
        </ContainerSection>
      </Paper>
    </Box>
  );
}
