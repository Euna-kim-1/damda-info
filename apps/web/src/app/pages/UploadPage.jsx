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
  ToggleButton,
  ToggleButtonGroup,
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

    price,
    setPrice,
    priceCandidates,
    nameCandidates,
    productName,

    receiptItems,
    selectedReceiptIndex,
    selectReceiptItem,

    mode,
    setMode,

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
        {/* ================= PICK / PREVIEW ================= */}
        <Paper
          sx={{
            p: 2.5,
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Stack spacing={2}>
            {/* Header */}
            <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontWeight: 900, fontSize: 20 }}>
                  Upload
                </Typography>
                <Typography sx={{ color: 'text.secondary', fontSize: 12 }}>
                  Select mode first, then choose a photo.
                </Typography>
              </Box>

              <BackButton onClick={() => navigate(-1)} />
            </Stack>

            {/* ✅ Centered controls */}
            <Stack spacing={1.25} alignItems="center">
              {/* Toggle */}
              <ToggleButtonGroup
                value={mode}
                exclusive
                onChange={(_, v) => v && setMode(v)}
                size="small"
                sx={{
                  borderRadius: 999,
                  overflow: 'hidden',
                  border: '1px solid',
                  borderColor: 'divider',
                  '& .MuiToggleButton-root': {
                    px: 3,
                    py: 1,
                    fontWeight: 900,
                    textTransform: 'none',
                    borderRadius: 0,
                    minWidth: 140,
                  },
                }}
              >
                <ToggleButton value="single">Single photo</ToggleButton>
                <ToggleButton value="receipt">Receipt</ToggleButton>
              </ToggleButtonGroup>

              <Typography sx={{ color: 'text.secondary', fontSize: 12 }}>
                {mode === 'receipt'
                  ? 'Receipt mode: extract multiple items'
                  : 'Single mode: extract one product'}
              </Typography>

              {/* Choose + Cancel */}
              <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap">
                <Button
                  variant="contained"
                  component="label"
                  disabled={loading || uploadLoading}
                  sx={{
                    fontWeight: 900,
                    px: 3.5,
                    py: 1.2,
                    borderRadius: 999,
                    whiteSpace: 'nowrap',
                    minWidth: 260,
                  }}
                >
                  {mode === 'receipt'
                    ? 'Choose receipt photo'
                    : 'Choose product photo'}
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
                    sx={{ fontWeight: 800, whiteSpace: 'nowrap' }}
                  >
                    Cancel
                  </Button>
                )}
              </Stack>
            </Stack>

            {/* Preview */}
            {previewUrl && (
              <Box>
                <Typography sx={{ fontWeight: 800, mb: 1 }}>Preview</Typography>
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

        {/* ================= EXTRACTED ================= */}
        <Paper
          sx={{
            p: 2.5,
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Stack spacing={2.5}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2.5}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontWeight: 800 }}>Extracted</Typography>

                {/* ✅ SINGLE: 기존처럼 Price/Final name 보여주기 */}
                {mode !== 'receipt' ? (
                  <Stack spacing={1} sx={{ mt: 1 }}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography color="text.secondary">Price</Typography>
                      <Typography fontWeight={700}>{price || '—'}</Typography>
                    </Stack>

                    <Stack direction="row" justifyContent="space-between">
                      <Typography color="text.secondary">Final name</Typography>
                      <Typography fontWeight={700}>{finalName || '—'}</Typography>
                    </Stack>
                  </Stack>
                ) : (
                  // ✅ RECEIPT: 안내 문구만
                  <Typography sx={{ color: 'text.secondary', mt: 1 }}>
                    Receipt mode is on. Select an item below to preview name/price.
                  </Typography>
                )}

                {/* ✅ RECEIPT ITEMS: 이름 + 가격 오른쪽에 표시 */}
                {mode === 'receipt' && receiptItems.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography fontWeight={800}>
                      Receipt items ({receiptItems.length})
                    </Typography>

                    <Stack spacing={1} sx={{ mt: 1 }}>
                      {receiptItems.map((it, idx) => {
                        const selected = idx === selectedReceiptIndex;
                        const displayPrice =
                          it.price_display ?? (it.price != null ? `$${it.price}` : '—');

                        return (
                          <Paper
                            key={idx}
                            onClick={() => selectReceiptItem(idx)}
                            role="button"
                            tabIndex={0}
                            sx={{
                              p: 1.5,
                              cursor: 'pointer',
                              borderRadius: 3,
                              border: '1px solid',
                              borderColor: selected ? 'primary.main' : 'divider',
                              boxShadow: selected ? 3 : 1,
                            }}
                          >
                            <Stack direction="row" justifyContent="space-between" spacing={2}>
                              <Typography
                                fontWeight={800}
                                noWrap
                                sx={{ minWidth: 0, flex: 1 }}
                              >
                                {it.name}
                              </Typography>

                              <Typography fontWeight={800} sx={{ flexShrink: 0 }}>
                                {displayPrice}
                              </Typography>
                            </Stack>
                          </Paper>
                        );
                      })}
                    </Stack>
                  </Box>
                )}

                {/* ✅ SINGLE MODE CANDIDATES: 기존 유지 */}
                {mode === 'single' && (
                  <>
                    {priceCandidates.length > 1 && (
                      <>
                        <Typography sx={{ mt: 2, fontWeight: 700 }}>
                          Price candidates
                        </Typography>

                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                          {priceCandidates.map((p) => (
                            <Chip
                              key={p}
                              label={p}
                              onClick={() => setPrice(p)}
                              color={p === price ? 'primary' : 'default'}
                            />
                          ))}
                        </Stack>
                      </>
                    )}

                    <Typography sx={{ mt: 2, fontWeight: 700 }}>
                      Name candidates
                    </Typography>

                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      {nameCandidates.map((c) => (
                        <Chip
                          key={c}
                          label={c}
                          onClick={() =>
                            setValue('productName', c, { shouldValidate: true })
                          }
                          color={c === productName ? 'primary' : 'default'}
                        />
                      ))}
                    </Stack>
                  </>
                )}
              </Box>

              {/* ✅ Manual name: Receipt 모드에서는 숨기기 */}
              {mode !== 'receipt' && (
                <Stack sx={{ flex: 1, minWidth: 0 }}>
                  <TextField
                    label="Manual name"
                    {...register('manualName')}
                    fullWidth
                    error={submitted && !!errors.manualName}
                    helperText={
                      submitted && errors.manualName ? errors.manualName.message : ' '
                    }
                  />
                </Stack>
              )}
            </Stack>

            <Divider />

            {/* Store + Upload: 기존 유지 */}
            <Stack spacing={2}>
              <Controller
                name="storeName"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={submitted && !!errors.storeName}>
                    <InputLabel>Store</InputLabel>
                    <Select
                      {...field}
                      label="Store"
                      disabled={storesLoading || stores.length === 0}
                    >
                      {stores.map((s) => (
                        <MenuItem key={s.id} value={s.name}>
                          {s.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />

              <Button
                variant="contained"
                onClick={uploadReport}
                disabled={loading || uploadLoading || !canUpload}
                sx={{ fontWeight: 900, borderRadius: 999 }}
              >
                Upload
              </Button>

              {saveMsg && saveMsg.toLowerCase().includes('failed') && (
                <Alert severity="error">{saveMsg}</Alert>
              )}
            </Stack>
          </Stack>
        </Paper>


        {/* ================= RAW OCR ================= */}
        <Paper
          sx={{
            p: 2.5,
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography fontWeight={800}>Raw OCR</Typography>
          <TextField value={ocrText} multiline minRows={10} fullWidth />
        </Paper>
      </Stack>

      {/* OCR MODAL */}
      <Dialog open={loading} onClose={() => { }}>
        <DialogTitle>Running OCR…</DialogTitle>
        <DialogContent>
          <CircularProgress />
        </DialogContent>
        <DialogActions />
      </Dialog>

      {/* SUCCESS MODAL */}
      <Dialog open={successOpen} onClose={() => { }}>
        <DialogTitle>Upload complete</DialogTitle>
        <DialogContent>{saveMsg}</DialogContent>
        <DialogActions>
          <Button onClick={() => navigate('/report')}>Go now</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
