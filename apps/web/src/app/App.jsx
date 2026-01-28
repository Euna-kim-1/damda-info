import { ThemeProvider, CssBaseline } from '@mui/material';
import { Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import theme from './providers/theme';
import AppShell from '../shared/layout/AppShell';
import HomePage from './pages/HomePage';
import UploadPage from './pages/UploadPage';
import Map from './pages/store/storesMap';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AppShell>
          <Routes>
            <Route path="/" element={<HomePage />} />
            {/* 임시 라우트들 */}
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/community" element={<HomePage />} />
            <Route path="/calculator" element={<HomePage />} />
            <Route path="/profile" element={<HomePage />} />
            <Route path="/storesMap" element={<Map />} />
          </Routes>
        </AppShell>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
