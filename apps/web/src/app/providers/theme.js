import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#E3C04D', // yellow
      light: '#F2D77A',
      dark: '#C7A236',
      contrastText: '#1A1407',
    },
    secondary: {
      main: '#6E7B4F', // olive green
      light: '#8A9966',
      dark: '#5A6541',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#FFFFFF',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1D1A14',
      secondary: '#6C6557',
    },
    divider: '#E7E1D6',
    custom: {
      mustard: '#E3C04D',
      olive: '#6E7B4F',
    },
  },
  shape: { borderRadius: 16 },
  components: {
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: '#6C6557',
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          color: '#1D1A14',
        },
        notchedOutline: {
          borderColor: '#E7E1D6',
        },
        '&:hover .MuiOutlinedInput-notchedOutline': {
          borderColor: '#E3C04D',
        },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
          borderColor: '#E3C04D',
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        select: {
          color: '#1D1A14',
        },
      },
    },
  },
});

export default theme;
