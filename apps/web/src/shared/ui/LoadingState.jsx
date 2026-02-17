import { Backdrop, CircularProgress, Stack, Typography } from '@mui/material';

const LoadingState = ({ text = 'Loading...', sx, open = true }) => {
  const chars = String(text).split('');
  const charStep = 0.14;
  const cycleDuration = Math.max(2, chars.length * charStep + 0.9);
  const paletteWave = [
    '#FFF5C2',
    '#FFE999',
    '#FFDC70',
    '#FFD047',
    '#F4BE2F',
    '#D9A514',
  ];

  return (
    <Backdrop
      open={open}
      sx={{
        color: '#fff',
        bgcolor: 'rgba(0, 0, 0, 0.35)',
        zIndex: (theme) => theme.zIndex.modal + 1,
        ...sx,
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1.5}>
        <CircularProgress size={20} thickness={4} sx={{ color: '#FFF5C2' }} />
        <Typography
          sx={{
            fontSize: 17,
            fontWeight: 600,
            '@keyframes loadingTextWave': {
              '0%, 100%': {
                color: 'rgba(255,255,255,0.72)',
                transform: 'translateY(0)',
              },
              '12%': {
                color: 'var(--active-color)',
                transform: 'translateY(-2px)',
              },
              '24%': {
                color: 'rgba(255,255,255,0.72)',
                transform: 'translateY(0)',
              },
            },
          }}
        >
          {chars.map((ch, idx) => (
            <span
              key={`${ch}-${idx}`}
              style={{
                display: 'inline-block',
                animation: `loadingTextWave ${cycleDuration}s ease-in-out infinite`,
                animationDelay: `${idx * charStep}s`,
                animationFillMode: 'both',
                ['--active-color']: paletteWave[idx % paletteWave.length],
              }}
            >
              {ch === ' ' ? '\u00A0' : ch}
            </span>
          ))}
        </Typography>
      </Stack>
    </Backdrop>
  );
};

export default LoadingState;
