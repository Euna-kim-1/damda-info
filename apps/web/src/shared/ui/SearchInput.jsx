import { TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

export default function SearchInput({ value, onChange, placeholder }) {
  return (
    <TextField
      value={value || ''}
      onChange={onChange}
      placeholder={placeholder}
      size="small"
      fullWidth
      sx={{
        '& .MuiOutlinedInput-root': {
          bgcolor: 'background.default',
          borderRadius: 999,
        },
      }}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon sx={{ color: 'text.secondary' }} />
          </InputAdornment>
        ),
      }}
    />
  );
}
