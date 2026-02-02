import { Button } from '@mui/material';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';

export default function BackButton({
  onClick,
  sx,
  label = 'Back',
  icon = <KeyboardBackspaceIcon fontSize="small" />,
  ...props
}) {
  return (
    <Button
      size="small"
      variant="text"
      onClick={onClick}
      sx={[
        {
          '& .MuiButton-startIcon': {
            marginRight: 0.5,
          },
        },
        sx,
      ]}
      startIcon={icon}
      {...props}
    >
      {label}
    </Button>
  );
}
