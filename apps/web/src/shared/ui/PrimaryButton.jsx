import { Button } from '@mui/material';

export default function PrimaryButton({ children, sx, ...props }) {
  return (
    <Button
      variant="contained"
      disableElevation
      sx={{
        borderRadius: 999,
        fontWeight: 800,
        textTransform: 'none',
        px: 3,
        py: 1.1,
        ...sx,
      }}
      {...props}
    >
      {children}
    </Button>
  );
}
