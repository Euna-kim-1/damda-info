import { Box, IconButton } from '@mui/material';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';

const DeleteItemButton = ({
  onDelete,
  disabled = false,
  iconColor = 'text.secondary',
}) => {
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
          e.preventDefault();
          e.stopPropagation();
          onDelete?.();
        }}
        disabled={disabled}
      >
        <DeleteOutlineRoundedIcon fontSize="small" sx={{ color: iconColor }} />
      </IconButton>
    </Box>
  );
};

export default DeleteItemButton;
