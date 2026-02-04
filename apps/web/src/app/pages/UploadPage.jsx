import { useEffect, useState } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useUploadReport } from '../../features/upload/useUploadReport';
import { Controller } from 'react-hook-form';
import BackButton from '../../shared/ui/buttons/BackButton';

export default function UploadPage() {
  const navigate = useNavigate();
  const [successOpen, setSuccessOpen] = useState(false);

  const {
    previewUrl,
    ocrText,
    loading,
    stores,
    storesLoading,

    // single-item (existing)
    price,
    setPrice,
    priceCandidates,
    nameCandidates,
    productName,

    // receipt (new)
    receiptItems,
    isReceipt,
    selectedReceiptIndex,
    selectReceiptItem,

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
    canUpload,
  } = useUploadReport();

  useEffect(() => {
    if (!saveMsg) return;

    const isSuccess =
      saveMsg.toLowerCase().includes('complete') || saveMsg.startsWith('✅');

    if (!isSuccess) return;

    setSuccessOpen(true);

    const t = setTimeout(() => {
      navigate('/report');
    }, 1200);

    return () => clearTimeout(t);
  }, [saveMsg, navigate]);

  return (
    <Box sx={{ maxWidth: 860, mx: 'auto', px: { xs: 1.5, sm: 2 }, py: 3 }}>
      <Stack spacing={2.5}>
        {/* Pick / preview */}
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
              <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
                <Button variant="contained" component="label" disabled={loading || uploadLoading}>
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
                    onClick={() => {
                      resetUpload();
                      setSuccessOpen(false);
                    }}
                    disabled={loading || uploadLoading}
                  >
                    Cancel
                  </Button>
                )}
              </Stack>

              <BackButton onClick={() => navigate(-1)} />
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

        {/* Extracted + candidates */}
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
                <Typography sx={{ fontWeight: 800, mb: 1 }}>Extracted</Typography>

                <Stack spacing={1}>
                  {[
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
                      <Typography sx={{ color: 'text.secondary' }}>{label}</Typography>
                      <Typography sx={{ fontWeight: 700 }}>{value}</Typography>
                    </Stack>
                  ))}
                </Stack>

                {/* Receipt items list (only when receipt) */}
                {isReceipt && receiptItems.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography sx={{ fontWeight: 800, mb: 1 }}>
                      Receipt items ({receiptItems.length})
                    </Typography>

                    <Stack spacing={1.25}>
                      {receiptItems.map((it, idx) => {
                        const selected = idx === selectedReceiptIndex;
                        return (
                          <Paper
                            key={`${it.name}-${it.price}-${idx}`}
                            onClick={() => selectReceiptItem(idx)}
                            role="button"
                            tabIndex={0}
                            sx={{
                              p: 1.5,
                              borderRadius: 3,
                              cursor: 'pointer',
                              border: '1px solid',
                              borderColor: selected ? 'primary.main' : 'divider',
                              boxShadow: selected ? 3 : 1,
                            }}
                          >
                            <Stack direction="row" justifyContent="space-between" spacing={2}>
                              <Box sx={{ minWidth: 0 }}>
                                <Typography sx={{ fontWeight: 800 }} noWrap>
                                  {it.name}
                                </Typography>
                                {it.detail ? (
                                  <Typography sx={{ color: 'text.secondary', fontSize: 12 }}>
                                    {it.detail}
                                  </Typography>
                                ) : null}
                              </Box>

                              <Typography sx={{ fontWeight: 800 }}>
                                {it.price_display}
                              </Typography>
                            </Stack>
                          </Paper>
                        );
                      })}
                    </Stack>

                    <Typography sx={{ color: 'text.secondary', fontSize: 12, mt: 1 }}>
                      Click an item to select which one you want to upload (for now).
                    </Typography>
                  </Box>
                )}

                {/* Keep existing candidates UI (works for both) */}
                {priceCandidates.length > 1 && (
                  <>
                    <Typography sx={{ fontWeight: 700, mt: 2, mb: 1 }}>
                      Price candidates
                    </Typography>

                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      {priceCandidates.map((p) => (
                        <Chip
                          key={p}
                          label={p}
                          onClick={() => setPrice(p)}
                          color={p === price ? 'primary' : 'default'}
                          variant={p === price ? 'filled' : 'outlined'}
                          sx={{ fontWeight: 700 }}
                        />
                      ))}
                    </Stack>
                  </>
                )}

                <Typography sx={{ fontWeight: 700, mt: 2, mb: 1 }}>
                  Name candidates
                </Typography>

                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {nameCandidates.length === 0 ? (
                    <Typography sx={{ color: 'text.secondary' }}>(no candidates)</Typography>
                  ) : (
                    nameCandidates.map((c) => (
                      <Chip
                        key={c}
                        label={c}
                        onClick={() => setValue('productName', c, { shouldValidate: true })}
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
                    submitted && errors.manualName ? errors.manualName.message : ' '
                  }
                />
              </Stack>
            </Stack>

            <Divider />

            <Stack spacing={2}>
              <Controller
                name="storeName"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={submitted && !!errors.storeName}>
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

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems="center">
                <Button
                  variant="contained"
                  onClick={uploadReport}
                  disabled={loading || uploadLoading || !canUpload}
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

              {saveMsg && saveMsg.toLowerCase().includes('failed') && (
                <Alert severity="error">{saveMsg}</Alert>
              )}
            </Stack>
          </Stack>
        </Paper>

        {/* Raw OCR */}
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
                sx: { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' },
              }}
              fullWidth
            />
          </Stack>
        </Paper>
      </Stack>

      {/* OCR modal */}
      <Dialog open={loading} onClose={() => { }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Running OCR…</DialogTitle>
        <DialogContent>
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mt: 1 }}>
            <CircularProgress size={20} />
            <Typography sx={{ color: 'text.secondary' }}>
              Extracting price and name candidates…
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions />
      </Dialog>

      {/* Success modal */}
      <Dialog open={successOpen} onClose={() => { }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Upload complete</DialogTitle>
        <DialogContent>
          <Typography>{saveMsg || 'Upload complete! Redirecting…'}</Typography>
          <Typography sx={{ color: 'text.secondary', fontSize: 12, mt: 1 }}>
            Redirecting…
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={() => navigate('/report')}>
            Go now
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
