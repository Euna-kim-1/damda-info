import { AppBar, Toolbar, IconButton, Box, Avatar } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SearchInput from '../ui/SearchInput';
import ContainerSection from './ContainerSection';

export default function TopNav() {
  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <ContainerSection>
        <Toolbar sx={{ gap: 1.5 }}>
          <IconButton edge="start" sx={{ color: 'text.primary' }}>
            <MenuIcon />
          </IconButton>

          <Box
            component="img"
            src="/logo.png"
            alt="Damda"
            sx={{
              height: 60,
              width: 'auto',
            }}
          />

          <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
            <Box sx={{ width: '100%', maxWidth: 560 }}>
              <SearchInput placeholder="Search for product..." />
            </Box>
          </Box>

          <Avatar sx={{ width: 32, height: 32 }} />
        </Toolbar>
      </ContainerSection>
    </AppBar>
  );
}
