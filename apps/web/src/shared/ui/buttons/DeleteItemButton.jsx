import { Box, IconButton, useMediaQuery } from '@mui/material';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';

export default function DeleteItemButton({ onDelete, disabled = false }) {
  const isDesktop = useMediaQuery('(hover: hover) and (pointer: fine)');

  return (
    <Box
      sx={{
        minWidth: 36,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'text.secondary',
      }}
    >
      <IconButton
        size="small"
        onClick={(e) => {
          if (!isDesktop) return;
          e.preventDefault();
          e.stopPropagation();
          onDelete?.();
        }}
        disabled={!isDesktop || disabled}
      >
        {isDesktop ? (
          <DeleteOutlineRoundedIcon fontSize="small" color="error" />
        ) : (
          <DeleteSweepIcon fontSize="small" color="error" />
        )}
      </IconButton>
    </Box>
  );
}
