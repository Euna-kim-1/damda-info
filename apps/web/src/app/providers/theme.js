import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',

    primary: {
      main: '#FFD84D',
      light: '#FFE680',
      dark: '#F5C400',
      contrastText: '#0F1210',
    },

    background: {
      default: '#0A1226',
      paper: '#1A1F1B',
    },

    text: {
      primary: '#FFFFFF',
      secondary: '#B5B5B5',
    },

    divider: '#2A2F2B',

    custom: {
      navy: '#0A1226',
      mustard: '#F5C400',
    },
  },

  shape: {
    borderRadius: 16,
  },
});

export default theme;
