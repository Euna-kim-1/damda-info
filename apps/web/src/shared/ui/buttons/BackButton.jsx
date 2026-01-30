import { Button } from '@mui/material';

export default function BackButton({ onClick, sx, label = '<- Back', ...props }) {
  return (
    <Button
      size="small"
      variant="text"
      onClick={onClick}
      sx={sx}
      {...props}
    >
      {label}
    </Button>
  );
}
