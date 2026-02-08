import { Button } from '@mui/material';

const DeleteCheckedButton = ({
  count = 0,
  onClick,
  disabled = false,
  sx,
}) => (
  <Button size="small" onClick={onClick} disabled={disabled} sx={sx}>
    Delete checked items ({count})
  </Button>
);

export default DeleteCheckedButton;
