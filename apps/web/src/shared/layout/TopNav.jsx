import { AppBar, Toolbar, Box, Avatar } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useMemo, useRef } from 'react';
import SearchInput from '../ui/SearchInput';
import ContainerSection from './ContainerSection';

const TopNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const qRef = useRef('');
  const qFromUrl = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get('q') || '';
  }, [location.search]);

  useEffect(() => {
    qRef.current = qFromUrl;
  }, [qFromUrl]);

  const onSubmit = () => {
    const query = qRef.current.trim();
    if (!query) return;
    navigate(`/report?q=${encodeURIComponent(query)}`);
  };

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
            onClick={() => navigate('/')}
            sx={{ height: 60, width: 'auto', cursor: 'pointer' }}
          />

          <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
            <Box sx={{ width: '100%', maxWidth: 650 }}>
              <SearchInput
                placeholder="Search for product..."
                key={qFromUrl}
                defaultValue={qFromUrl}
                onChange={(e) => {
                  qRef.current = e.target.value;
                }}
                onSubmit={onSubmit}
              />
            </Box>
          </Box>

          <Avatar sx={{ width: 32, height: 32 }} />
        </Toolbar>
      </ContainerSection>
    </AppBar>
  );
};

export default TopNav;
