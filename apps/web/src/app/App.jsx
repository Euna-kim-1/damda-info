import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './providers/theme';
import HomePage from './pages/HomePage';

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <HomePage />
    </ThemeProvider>
  );
}
