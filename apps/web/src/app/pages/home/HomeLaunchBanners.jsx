import { Box, Stack, Typography } from '@mui/material';
import PrimaryButton from '../../../shared/ui/buttons/PrimaryButton';

const launchBannerItems = [
  {
    tag: 'Product Updates',
    title: 'Tell us what to improve\nWe review every idea\nand ship updates',
    cta: 'Send feedback',
    variantStyle: 'primary3',
    sx: {
      bgcolor: '#F5F8F3',
      border: '1px solid',
      borderColor: '#DFEBDD',
      boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
      color: 'text.primary',
    },
  },
  {
    tag: 'Upload Tips',
    title: 'Clear photos work best\nCapture full receipts\nfor better parsing',
    cta: 'Read tips',
    variantStyle: 'primary3',
    sx: {
      bgcolor: '#F7F9FC',
      border: '1px solid',
      borderColor: '#E4EAF3',
      boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
      color: 'text.primary',
    },
  },
  {
    tag: 'Receipt History',
    title: 'Keep receipts in one place\nSearch past records\nwhenever you need',
    cta: 'View history',
    variantStyle: 'primary3',
    sx: {
      bgcolor: 'background.paper',
      border: '1px solid',
      borderColor: 'divider',
      boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
      color: 'text.primary',
    },
  },
];

const HomeLaunchBanners = () => (
  <Stack
    direction="row"
    spacing={1.25}
    sx={{
      overflowX: 'auto',
      pb: 0.5,
      WebkitOverflowScrolling: 'touch',
      touchAction: 'pan-x',
      scrollbarWidth: 'none',
      '&::-webkit-scrollbar': {
        display: 'none',
      },
    }}
  >
    {launchBannerItems.map((item) => (
      <Box
        key={item.title}
        sx={{
          width: {
            xs: '88%',
            sm: 'calc((100% - 10px) / 2)',
            md: 'calc((100% - 20px) / 3)',
          },
          flex: '0 0 auto',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 2.5,
          p: 2,
          ...item.sx,
        }}
      >
        <Typography
          sx={{
            fontSize: 12,
            color: 'text.secondary',
            mb: 0.75,
            fontWeight: 500,
          }}
        >
          {item.tag}
        </Typography>
        <Typography
          sx={{
            fontSize: { xs: 19, md: 21 },
            fontWeight: 600,
            lineHeight: 1.2,
            whiteSpace: 'pre-line',
            minHeight: '3.6em',
          }}
        >
          {item.title}
        </Typography>
        <Box sx={{ mt: 'auto', pt: 1.3 }}>
          <PrimaryButton variantStyle={item.variantStyle}>{item.cta}</PrimaryButton>
        </Box>
      </Box>
    ))}
  </Stack>
);

export default HomeLaunchBanners;
