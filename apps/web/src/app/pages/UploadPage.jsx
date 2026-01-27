import {
  Box,
  Typography,
  Stack,
  Paper,
  Button,
  Chip,
  Divider,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
} from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import { useNavigate } from 'react-router-dom';
import { useUploadReport } from '../../features/upload/useUploadReport';
import { Controller } from 'react-hook-form';

export default function UploadPage() {
  const navigate = useNavigate();
  const {
    previewUrl,
    ocrText,
    loading,
    stores,
    storesLoading,
    price,
    nameCandidates,
    productName,
    saveMsg,
    submitted,
    finalName,
    missingFile,
    missingPrice,
    register,
    control,
    errors,
    setValue,
    onPick,
    uploadReport,
    uploadLoading,
    resetUpload,
    hasFile,
  } = useUploadReport();

  return (
    <Box sx={{ maxWidth: 860, mx: 'auto', px: { xs: 1.5, sm: 2 }, py: 3 }}>
      <Stack spacing={2.5}>
        <Paper
          sx={{
            p: 2.5,
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            color: 'text.primary',
          }}
        >
          <Stack spacing={2}>
            <Stack
              direction="row"
              spacing={1.5}
              alignItems="center"
              justifyContent="space-between"
            >
              <Stack
                direction="row"
                spacing={1.5}
                alignItems="center"
                flexWrap="wrap"
              >
                <Button
                  variant="contained"
                  component="label"
                  disabled={loading}
                >
                  Choose photo
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    hidden
                    onChange={onPick}
                  />
                </Button>
                {hasFile && (
                  <Button
                    variant="text"
                    onClick={resetUpload}
                    disabled={loading || uploadLoading}
                  >
                    Cancel
                  </Button>
                )}
                {loading && (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CircularProgress size={18} />
                    <Typography sx={{ color: 'text.secondary' }}>
                      Running OCR…
                    </Typography>
                  </Stack>
                )}
              </Stack>

              <Button
                variant="text"
                size="small"
                startIcon={<ArrowBackRoundedIcon />}
                onClick={() => navigate(-1)}
              >
                Back
              </Button>
            </Stack>

            {previewUrl && (
              <Box>
                <Typography sx={{ fontWeight: 700, mb: 1 }}>Preview</Typography>
                <Box
                  component="img"
                  src={previewUrl}
                  alt="preview"
                  sx={{
                    width: '100%',
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                />
              </Box>
            )}
          </Stack>
        </Paper>

        <Paper
          sx={{
            p: 2.5,
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            color: 'text.primary',
          }}
        >
          <Stack spacing={2.5}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2.5}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontWeight: 800, mb: 1 }}>
                  Extracted
                </Typography>

                <Stack spacing={1}>
                  {[
                    ['OCR status', loading ? 'Running…' : 'Idle'],
                    ['Price', price || '—'],
                    ['Final name', finalName || '—'],
                  ].map(([label, value]) => (
                    <Stack
                      key={label}
                      direction="row"
                      justifyContent="space-between"
                      sx={{
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        py: 0.75,
                      }}
                    >
                      <Typography sx={{ color: 'text.secondary' }}>
                        {label}
                      </Typography>
                      <Typography sx={{ fontWeight: 700 }}>{value}</Typography>
                    </Stack>
                  ))}
                </Stack>

                <Typography sx={{ fontWeight: 700, mt: 2, mb: 1 }}>
                  Name candidates
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {nameCandidates.length === 0 ? (
                    <Typography sx={{ color: 'text.secondary' }}>
                      (no candidates)
                    </Typography>
                  ) : (
                    nameCandidates.map((c) => (
                      <Chip
                        key={c}
                        label={c}
                        onClick={() =>
                          setValue('productName', c, { shouldValidate: true })
                        }
                        color={c === productName ? 'primary' : 'default'}
                        variant={c === productName ? 'filled' : 'outlined'}
                        sx={{ fontWeight: 700 }}
                      />
                    ))
                  )}
                </Stack>
              </Box>

              <Stack spacing={1.5} sx={{ flex: 1, minWidth: 0 }}>
                <TextField
                  label="Manual name (optional)"
                  {...register('manualName')}
                  placeholder="Type a name if OCR is off"
                  fullWidth
                  error={submitted && !!errors.manualName}
                  helperText={
                    submitted && errors.manualName
                      ? errors.manualName.message
                      : ' '
                  }
                />

                <Box>
                  <Typography sx={{ color: 'text.secondary', fontSize: 12 }}>
                    Final name
                  </Typography>
                  <Typography sx={{ fontWeight: 800 }}>
                    {finalName || '(none)'}
                  </Typography>
                </Box>
              </Stack>
            </Stack>

            <Divider />

            <Stack spacing={2}>
              <Controller
                name="storeName"
                control={control}
                render={({ field }) => (
                  <FormControl
                    fullWidth
                    error={submitted && !!errors.storeName}
                  >
                    <InputLabel id="store-label">Store</InputLabel>
                    <Select
                      {...field}
                      labelId="store-label"
                      label="Store"
                      disabled={storesLoading || stores.length === 0}
                    >
                      {storesLoading ? (
                        <MenuItem value="">Loading...</MenuItem>
                      ) : (
                        stores.map((s) => (
                          <MenuItem key={s.id} value={s.name}>
                            {s.name}
                          </MenuItem>
                        ))
                      )}
                    </Select>
                  </FormControl>
                )}
              />

              <TextField
                label="Unit (optional)"
                {...register('unit')}
                placeholder="e.g. 1kg / 945 mL"
                fullWidth
              />

              <TextField
                label="Notes (optional)"
                {...register('notes')}
                placeholder="e.g. on sale, member price..."
                fullWidth
              />

              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1.5}
                alignItems="center"
              >
                <Button
                  variant="contained"
                  onClick={uploadReport}
                  disabled={loading || uploadLoading}
                  sx={{ minWidth: 180 }}
                >
                  {uploadLoading ? 'Uploading...' : 'Upload'}
                </Button>
                <Typography sx={{ color: 'text.secondary', fontSize: 12 }}>
                  {submitted
                    ? missingFile
                      ? 'Please choose a photo.'
                      : missingPrice
                        ? 'Price not detected.'
                        : ' '
                    : ' '}
                </Typography>
              </Stack>

              {saveMsg && (
                <Alert
                  severity={saveMsg.startsWith('✅') ? 'success' : 'error'}
                >
                  {saveMsg}
                </Alert>
              )}
            </Stack>
          </Stack>
        </Paper>

        <Paper
          sx={{
            p: 2.5,
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            color: 'text.primary',
          }}
        >
          <Stack spacing={1.5}>
            <Typography sx={{ fontWeight: 800 }}>Raw OCR</Typography>
            <TextField
              value={ocrText}
              placeholder="OCR text will appear here"
              multiline
              minRows={10}
              InputProps={{
                readOnly: true,
                sx: {
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                },
              }}
              fullWidth
            />
          </Stack>
        </Paper>
      </Stack>
    </Box>
  );
}
