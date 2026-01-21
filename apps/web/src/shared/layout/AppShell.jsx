import { Box } from '@mui/material';
import TopNav from './TopNav';

export default function AppShell({ children }) {
  return (
    <Box
      sx={(theme) => ({
        minHeight: '100vh',
        color: 'text.primary',
        bgcolor: 'background.default',

        backgroundImage: `
          linear-gradient(
            180deg,
            ${theme.palette.primary.dark}22 0%,
            ${theme.palette.primary.main}22 50%,
            ${theme.palette.custom.navy} 100%
          )
        `,
      })}
    >
      <TopNav />
      {children}
    </Box>
  );
}
