import { AppBar, Toolbar, Box, Avatar } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ContainerSection from './ContainerSection';

const TopNav = () => {
  const navigate = useNavigate();

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
        <Toolbar sx={{ gap: 2, minHeight: { xs: 72, sm: 80 } }}>
          <Box
            component="img"
            src="/logo.png"
            alt="Damda"
            onClick={() => navigate('/')}
            sx={{ height: 60, width: 'auto', cursor: 'pointer' }}
          />
          <Box sx={{ flex: 1 }} />
          <Avatar sx={{ width: 36, height: 36 }} />
        </Toolbar>
      </ContainerSection>
    </AppBar>
  );
};

export default TopNav;
