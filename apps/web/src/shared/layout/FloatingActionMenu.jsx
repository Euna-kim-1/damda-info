import { Box, IconButton, Typography } from '@mui/material';
import { useEffect, useRef, useState } from 'react';

export default function FloatingActionMenu({ actions, radius = 84 }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [open]);

  return (
    <Box
      ref={containerRef}
      sx={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 3,
      }}
    >
      {actions.map((action) => {
        const angleRad = (action.angle * Math.PI) / 180;
        const x = Math.cos(angleRad) * radius;
        const y = Math.sin(angleRad) * radius;

        return (
          <IconButton
            key={action.label}
            aria-label={action.label}
            onClick={() => {
              setOpen(false);
              action.onClick();
            }}
            sx={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: 52,
              height: 52,
              bgcolor: 'background.paper',
              color: action.color ?? 'text.primary',
              boxShadow: 3,
              border: '1px solid',
              borderColor: 'divider',
              fontSize: 26,
              opacity: open ? 1 : 0,
              pointerEvents: open ? 'auto' : 'none',
              transform: open
                ? `translate(-50%, -50%) translate(${x}px, ${y}px)`
                : 'translate(-50%, -50%)',
              transition:
                'transform 220ms ease, opacity 220ms ease, box-shadow 220ms ease',
              '&:hover': { boxShadow: 5, bgcolor: 'background.paper' },
            }}
          >
            {action.icon}
          </IconButton>
        );
      })}

      <IconButton
        aria-label="Floating menu"
        onClick={() => setOpen((value) => !value)}
        sx={{
          position: 'relative',
          width: 56,
          height: 56,
          bgcolor: 'secondary.light',
          color: '#fff',
          boxShadow: 4,
          border: '1px solid',
          borderColor: 'secondary.light',
          '&:hover': { bgcolor: 'secondary.main' },
        }}
      >
        <Typography component="span" fontSize={26} fontWeight={700}>
          {open ? '×' : '+'}
        </Typography>
      </IconButton>
    </Box>
  );
}
