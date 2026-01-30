import { Button } from '@mui/material';

export default function DeleteCheckedButton({ count = 0, onClick, disabled = false, sx }) {
  return (
    <Button size="small" onClick={onClick} disabled={disabled} sx={sx}>
      Delete checked items ({count})
    </Button>
  );
}
