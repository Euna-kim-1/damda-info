import { Button } from '@mui/material';

export default function ResetCheckedButton({ onClick, disabled = false, sx }) {
  return (
    <Button size="small" onClick={onClick} disabled={disabled} sx={sx}>
      Reset
    </Button>
  );
}
