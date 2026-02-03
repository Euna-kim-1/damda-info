import { AppBar, Toolbar, Box, Avatar } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import SearchInput from '../ui/SearchInput';
import ContainerSection from './ContainerSection';

export default function TopNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [q, setQ] = useState('');

  // if q in URL changes, update the input
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setQ(params.get('q') || '');
  }, [location.search]);

  const onSubmit = () => {
    const query = q.trim();
    if (!query) return;
    navigate(`/report?q=${encodeURIComponent(query)}`);
  };

  return (
    <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider' }}>
      <ContainerSection>
        <Toolbar sx={{ gap: 3 }}>
          <Box component="img" src="/logo.png" alt="Damda" onClick={() => navigate('/')} sx={{ height: 60, width: 'auto', cursor: 'pointer' }} />

          <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
            <Box sx={{ width: '100%', maxWidth: 650 }}>
              <SearchInput
                placeholder="Search for product..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onSubmit={onSubmit}
              />
            </Box>
          </Box>

          <Avatar sx={{ width: 32, height: 32 }} />
        </Toolbar>
      </ContainerSection>
    </AppBar>
  );
}
