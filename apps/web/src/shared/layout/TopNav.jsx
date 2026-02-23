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
        <Toolbar sx={{ gap: { xs: 1.25, sm: 2 }, minHeight: { xs: 58, sm: 72, md: 80 } }}>
          <Box
            component="img"
            src="/logo.png"
            alt="Damda"
            onClick={() => navigate('/')}
            sx={{ height: { xs: 42, sm: 52, md: 60 }, width: 'auto', cursor: 'pointer' }}
          />
          <Box sx={{ flex: 1 }} />
          <Avatar sx={{ width: { xs: 30, sm: 34, md: 36 }, height: { xs: 30, sm: 34, md: 36 } }} />
        </Toolbar>
      </ContainerSection>
    </AppBar>
  );
};

export default TopNav;
