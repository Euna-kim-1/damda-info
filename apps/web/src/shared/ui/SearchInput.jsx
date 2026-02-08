import { TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const SearchInput = ({
  value,
  defaultValue,
  onChange,
  onSubmit,
  placeholder,
}) => {
  const valueProps =
    value !== undefined ? { value } : { defaultValue: defaultValue ?? '' };

  return (
    <TextField
      {...valueProps}
      onChange={onChange}
      placeholder={placeholder}
      size="small"
      fullWidth
      onKeyDown={(e) => {
        if (e.key === 'Enter') onSubmit?.();
      }}
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
};

export default SearchInput;
