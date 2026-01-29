import { AppBar, Toolbar, IconButton, Box, Avatar } from '@mui/material';
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
        <Toolbar sx={{ gap: 3 }}>
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
            <Box sx={{ width: '100%', maxWidth: 650 }}>
              <SearchInput placeholder="Search for product..." />
            </Box>
          </Box>

          <Avatar sx={{ width: 32, height: 32 }} />
        </Toolbar>
      </ContainerSection>
    </AppBar>
  );
}
