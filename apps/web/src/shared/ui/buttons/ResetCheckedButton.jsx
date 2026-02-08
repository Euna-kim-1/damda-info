import { Button } from '@mui/material';

const ResetCheckedButton = ({ onClick, disabled = false, sx }) => (
  <Button size="small" onClick={onClick} disabled={disabled} sx={sx}>
    Reset
  </Button>
);

export default ResetCheckedButton;
