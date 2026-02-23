import { useEffect, useState, useMemo } from 'react';
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
  FormHelperText,
  Select,
  MenuItem,
  Alert,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useUploadReport } from '../../features/upload/useUploadReport';
import { Controller } from 'react-hook-form';
import BackButton from '../../shared/ui/buttons/BackButton';
import LoadingState from '../../shared/ui/LoadingState';
import DeleteItemButton from '../../shared/ui/buttons/DeleteItemButton';

export default function UploadPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [successOpen, setSuccessOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState(''); // hmart, emart, amart

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
    storeName,
    removeReceiptItem,
    mode,
    setMode,
    setSelectedStoreType,
    saveMsg,
    submitted,
    finalName,
    ocrScanCount,
    ocrFreeLimit,
    ocrLimitReached,
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
    const modeParam = (searchParams.get('mode') || '').toLowerCase();
    if (modeParam === 'receipt' || modeParam === 'single') {
      setMode(modeParam);
    }
  }, [searchParams, setMode]);

  useEffect(() => {
    setSelectedStoreType(selectedStore);
    console.log('🏪 UploadPage - selectedStore 변경:', selectedStore);
  }, [selectedStore, setSelectedStoreType]);

  const filteredStores = useMemo(() => {
    if (mode === 'single') return stores;
    if (!selectedStore) return stores;
    return stores.filter((s) => {
      const storeName = s.name.toLowerCase();

      if (selectedStore === 'amart') {
        return storeName.includes('a-mart');
      } else if (selectedStore === 'emart') {
        return storeName.includes('e-mart');
      } else if (selectedStore === 'hmart') {
        return storeName.includes('h-mart');
      }

      return false;
    });
  }, [mode, selectedStore, stores]);

  const isBusy = loading || uploadLoading;
  const loadingText = loading ? 'Running OCR...' : 'Uploading report...';
  useEffect(() => {
    if (mode !== 'receipt') return;

    if (!selectedStore) {
      if (storeName) {
        setValue('storeName', '', { shouldValidate: true });
      }
      return;
    }

    const hasCurrentStore = filteredStores.some((s) => s.name === storeName);

    if (selectedStore === 'emart' && filteredStores.length === 1) {
      const onlyStore = filteredStores[0].name;
      if (storeName !== onlyStore) {
        setValue('storeName', onlyStore, { shouldValidate: true });
      }
      return;
    }

    if (!hasCurrentStore && storeName) {
      setValue('storeName', '', { shouldValidate: true });
    }
  }, [filteredStores, mode, selectedStore, setValue, storeName]);

  const requiresManualLocation =
    mode === 'receipt' &&
    (selectedStore === 'hmart' || selectedStore === 'amart');
  const receiptStoreMissing = requiresManualLocation && !storeName?.trim();
  const receiptStoreUnavailable =
    mode === 'receipt' && !!selectedStore && filteredStores.length === 0;
  const ocrLimitLabel = Number.isFinite(ocrFreeLimit) ? ocrFreeLimit : '∞';

  useEffect(() => {
    if (!saveMsg) return;

    const isSuccess =
      saveMsg.toLowerCase().includes('complete') || saveMsg.startsWith('✅');

    if (!isSuccess) return;

    const openTimer = setTimeout(() => {
      setSuccessOpen(true);
    }, 0);
    const navigateTimer = setTimeout(() => {
      navigate('/report');
    }, 1200);

    return () => {
      clearTimeout(openTimer);
      clearTimeout(navigateTimer);
    };
  }, [saveMsg, navigate]);

  return (
    <Box sx={{ maxWidth: 860, mx: 'auto', px: { xs: 1.5, sm: 2 }, py: 2 }}>
      <Stack spacing={2.5}>
        <Stack spacing={1.5}>
          <Typography
            variant="overline"
            sx={{
              color: 'text.secondary',
              px: 0.5,
              letterSpacing: 1.2,
              fontSize: 12,
            }}
          >
            Upload a receipt or product photo.
          </Typography>
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
              <Stack
                direction="row"
                alignItems="flex-start"
                justifyContent="space-between"
              >
                <Box sx={{ minWidth: 0 }}>
                  <Stack direction="row" spacing={1} alignItems="baseline">
                    <Typography sx={{ fontWeight: 900, fontSize: 20 }}>
                      Upload
                    </Typography>
                    <Typography
                      sx={{
                        color: 'text.secondary',
                        fontSize: 13,
                        fontWeight: 700,
                      }}
                    >
                      ({ocrScanCount}/{ocrLimitLabel})
                    </Typography>
                  </Stack>
                  <Typography sx={{ color: 'text.secondary', fontSize: 12 }}>
                    {mode === 'receipt'
                      ? 'Select mode and store first, then choose a photo.'
                      : 'Select mode first, then choose a photo.'}
                  </Typography>
                </Box>

                <BackButton onClick={() => navigate(-1)} />
              </Stack>

              {/* ✅ Centered controls */}
              <Stack spacing={1.25} alignItems="center">
                {/* Toggle - Single/Receipt */}
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
                      color: 'secondary.main',
                      '&.Mui-selected, &.Mui-selected:hover': {
                        bgcolor: 'secondary.light',
                        color: 'secondary.contrastText',
                        borderColor: 'secondary.light',
                      },
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

                {mode === 'receipt' && (
                  <>
                    <ToggleButtonGroup
                      value={selectedStore}
                      exclusive
                      onChange={(_, v) => v && setSelectedStore(v)}
                      size="small"
                      sx={{
                        borderRadius: 999,
                        overflow: 'hidden',
                        border: '1px solid',
                        borderColor: 'divider',
                        '& .MuiToggleButton-root': {
                          px: 2.5,
                          py: 0.8,
                          fontWeight: 900,
                          textTransform: 'none',
                          borderRadius: 0,
                          minWidth: 100,
                          fontSize: 14,
                          color: 'secondary.main',
                          '&.Mui-selected, &.Mui-selected:hover': {
                            bgcolor: 'secondary.light',
                            color: 'secondary.contrastText',
                            borderColor: 'secondary.light',
                          },
                        },
                      }}
                    >
                      <ToggleButton value="hmart">H-mart</ToggleButton>
                      <ToggleButton value="emart">E-mart</ToggleButton>
                      <ToggleButton value="amart">A-mart</ToggleButton>
                    </ToggleButtonGroup>

                    <Typography sx={{ color: 'text.secondary', fontSize: 12 }}>
                      {selectedStore
                        ? `Selected: ${selectedStore.toUpperCase()}`
                        : 'Select a store for accurate OCR parsing'}
                    </Typography>
                  </>
                )}

                {/* Choose + Cancel */}
                <Stack
                  direction="row"
                  spacing={1}
                  justifyContent="center"
                  flexWrap="wrap"
                >
                  <Button
                    variant="contained"
                    component="label"
                    disabled={
                      loading ||
                      uploadLoading ||
                      ocrLimitReached ||
                      (mode === 'receipt' && !selectedStore)
                    }
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
                      }}
                      disabled={loading || uploadLoading}
                      sx={{ fontWeight: 800, whiteSpace: 'nowrap' }}
                    >
                      Cancel
                    </Button>
                  )}
                </Stack>
                {ocrLimitReached && (
                  <Alert
                    severity="warning"
                    sx={{ width: '100%', maxWidth: 520 }}
                  >
                    OCR free limit reached ({ocrLimitLabel}/{ocrLimitLabel}).
                  </Alert>
                )}
              </Stack>

              {/* Preview */}
              {previewUrl && (
                <Box>
                  <Typography sx={{ fontWeight: 800, mb: 1 }}>
                    Preview
                  </Typography>
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
        </Stack>

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
                      <Typography fontWeight={700}>
                        {finalName || '—'}
                      </Typography>
                    </Stack>
                  </Stack>
                ) : (
                  // ✅ RECEIPT: 안내 문구만
                  <Typography sx={{ color: 'text.secondary', mt: 1 }}>
                    Receipt mode is on. Select an item below to preview
                    name/price.
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
                          it.price_display ??
                          (it.price != null ? `$${it.price}` : '—');

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
                              borderColor: selected
                                ? 'primary.main'
                                : 'divider',
                              boxShadow: selected ? 3 : 1,
                            }}
                          >
                            <Stack
                              direction="row"
                              justifyContent="space-between"
                              spacing={2}
                            >
                              <Typography
                                fontWeight={800}
                                noWrap
                                sx={{ minWidth: 0, flex: 1 }}
                              >
                                {it.name}
                              </Typography>

                              <Stack
                                direction="row"
                                spacing={0.5}
                                alignItems="center"
                                sx={{ flexShrink: 0 }}
                              >
                                <Typography fontWeight={800}>
                                  {displayPrice}
                                </Typography>
                                <DeleteItemButton
                                  onDelete={() => removeReceiptItem(idx)}
                                  iconColor="error.main"
                                />
                              </Stack>
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

                        <Stack
                          direction="row"
                          spacing={1}
                          flexWrap="wrap"
                          useFlexGap
                        >
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

                    <Stack
                      direction="row"
                      spacing={1}
                      flexWrap="wrap"
                      useFlexGap
                    >
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
                      submitted && errors.manualName
                        ? errors.manualName.message
                        : ' '
                    }
                  />
                </Stack>
              )}
            </Stack>

            <Divider />

            {/* Store + Upload */}
            <Stack spacing={2}>
              <Controller
                name="storeName"
                control={control}
                render={({ field }) => (
                  <FormControl
                    fullWidth
                    error={
                      submitted &&
                      (!!errors.storeName ||
                        receiptStoreMissing ||
                        receiptStoreUnavailable)
                    }
                  >
                    <InputLabel>Store</InputLabel>
                    <Select
                      {...field}
                      label="Store"
                      disabled={
                        storesLoading ||
                        filteredStores.length === 0 ||
                        (mode === 'receipt' && !selectedStore)
                      }
                    >
                      {filteredStores.map((s) => (
                        <MenuItem key={s.id} value={s.name}>
                          {s.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {submitted && errors.storeName?.message && (
                      <FormHelperText>
                        {errors.storeName.message}
                      </FormHelperText>
                    )}
                    {submitted &&
                      !errors.storeName?.message &&
                      receiptStoreMissing && (
                        <FormHelperText>
                          Please select a store location before upload.
                        </FormHelperText>
                      )}
                    {submitted &&
                      !errors.storeName?.message &&
                      !receiptStoreMissing &&
                      receiptStoreUnavailable && (
                        <FormHelperText>
                          No matching store location found for this mart.
                        </FormHelperText>
                      )}
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

      <LoadingState open={isBusy && !successOpen} text={loadingText} />
      <LoadingState
        open={successOpen}
        status="success"
        text="Success"
      />
    </Box>
  );
}
