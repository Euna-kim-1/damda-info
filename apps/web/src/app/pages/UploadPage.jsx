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
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import { useNavigate } from 'react-router-dom';
import { useUploadReport } from '../../features/upload/useUploadReport';
import { Controller } from 'react-hook-form';

export default function UploadPage() {
  const navigate = useNavigate();

  const [successOpen, setSuccessOpen] = useState(false);

  const {
    previewUrl,
    ocrText,
    loading, // ✅ OCR 로딩 상태
    stores,
    storesLoading,
    price,
    setPrice,
    priceCandidates,
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
    canUpload,
  } = useUploadReport();

  // ✅ 업로드 성공 메시지 감지하면 성공 모달 열고 1.2초 후 이동
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
                  disabled={loading || uploadLoading}
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
                    // ✅ OCR status 줄 제거 (모달로 대신 보여줌)
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

              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1.5}
                alignItems="center"
              >
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

      {/* ✅ OCR 로딩 모달: 사진 업로드하면 바로 중앙에 뜸 */}
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
        <DialogActions>
          {/* 일부러 닫기 버튼 없음: “진짜 진행중”을 확실히 보여주려고 */}
        </DialogActions>
      </Dialog>

      {/* ✅ 업로드 성공 모달 */}
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
