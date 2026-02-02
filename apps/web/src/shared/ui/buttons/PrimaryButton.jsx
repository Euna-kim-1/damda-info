import { Box, Button } from '@mui/material';

export default function PrimaryButton({
  children,
  sx,
  variantStyle = 'primary1',
  ...props
}) {
  const variantStyles = {
    primary1: {
      bgcolor: 'primary.light',
      color: 'primary.contrastText',
      border: '1px solid',
      borderColor: 'primary.dark',
      boxShadow: '0 6px 14px rgba(227, 192, 77, 0.35)',
    },
    primary2: {
      bgcolor: 'transparent',
      color: 'secondary.dark',
      border: '2px solid',
      borderColor: 'primary.main',
      boxShadow: '0 4px 10px rgba(227, 192, 77, 0.2)',
    },
    primary3: {
      bgcolor: 'primary.light',
      color: 'secondary.dark',
      border: '1px solid',
      borderColor: 'primary.light',
      boxShadow: 'none',
    },
    primary4: {
      bgcolor: 'transparent',
      color: 'primary.main',
      padding: 0.5,
    },
  };

  return (
    <Button
      disableElevation
      sx={[
        {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 700,
          px: 2.5,
          py: 1,
          gap: 0.5,
        },
        variantStyles[variantStyle] || variantStyles.primary3,
        sx,
      ]}
      {...props}
    >
      <Box component="span">{children}</Box>
    </Button>
  );
}
