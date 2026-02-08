import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  extractBestPrice,
  extractNameCandidates,
  extractPriceCandidates,
  parseReceiptItems,
} from './uploadUtils';
import { apiGet, apiPostForm } from '../../shared/api/client';

const formSchema = z
  .object({
    storeName: z.string().trim().min(1, 'Store is required.'),
    productName: z.string().trim().optional().default(''),
    manualName: z.string().trim().optional().default(''),
    unit: z.string().trim().optional().default(''),
    notes: z.string().trim().optional().default(''),
  })
  .superRefine((data, ctx) => {
    if (!data.manualName && !data.productName) {
      ctx.addIssue({
        code: 'custom',
        path: ['manualName'],
        message: 'Please select or type a name.',
      });
    }
  });

export function useUploadReport() {
  // ✅ NEW: mode
  const [mode, setMode] = useState('single'); // 'single' | 'receipt'

  const [pickedFile, setPickedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [ocrText, setOcrText] = useState('');

  const [price, setPrice] = useState('');
  const [priceCandidates, setPriceCandidates] = useState([]);
  const [nameCandidates, setNameCandidates] = useState([]);
  const [saveMsg, setSaveMsg] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const [receiptItems, setReceiptItems] = useState([]);
  const [selectedReceiptIndex, setSelectedReceiptIndex] = useState(0);

  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      storeName: '',
      productName: '',
      manualName: '',
      unit: '',
      notes: '',
    },
  });

  const storeName = watch('storeName');
  const productName = watch('productName');
  const manualName = watch('manualName');

  const finalName = useMemo(
    () => (manualName?.trim() ? manualName.trim() : productName?.trim() || ''),
    [manualName, productName],
  );

  // ✅ IMPORTANT: isReceipt는 "receiptItems로 추측"이 아니라 mode가 기준이어야 함
  const isReceipt = mode === 'receipt';

  const storesQuery = useQuery({
    queryKey: ['stores'],
    queryFn: async () => {
      try {
        const data = await apiGet('/stores');
        return data?.stores || [];
      } catch (e) {
        console.error('stores fetch failed:', e);
        return [
          { id: 'hmart', name: 'H-mart' },
          { id: 'emart', name: 'E-mart' },
          { id: 'amart', name: 'Amart' },
        ];
      }
    },
  });

  useEffect(() => {
    const list = storesQuery.data || [];
    if (list.length === 0) return;

    if (!list.some((s) => s.name === storeName)) {
      setValue('storeName', list[0]?.name || '', { shouldValidate: true });
    }
  }, [setValue, storeName, storesQuery.data]);

  const ocrMutation = useMutation({
    mutationFn: async ({ file, mode }) => {
      const form = new FormData();
      form.append('image', file);

      const data = await apiPostForm('/ocr', form);
      const raw = data?.text || '';

      // ✅ mode에 따라 receipt 파싱을 "켜거나 끄기"
      const receipt = mode === 'receipt' ? parseReceiptItems(raw) || [] : [];

      const prices = extractPriceCandidates(raw, 6);
      const nextPrice = prices[0] || extractBestPrice(raw);
      const candidates = extractNameCandidates(raw, nextPrice, 3);

      return { raw, prices, nextPrice, candidates, receipt };
    },
    onSuccess: ({ raw, prices, nextPrice, candidates, receipt }) => {
      setOcrText(raw);

      setReceiptItems(receipt);
      setSelectedReceiptIndex(0);

      setPriceCandidates(prices);
      setPrice(nextPrice);

      setNameCandidates(candidates);
      setValue('productName', candidates[0] || '', { shouldValidate: true });

      // ✅ receipt mode일 때만 첫번째 아이템으로 세팅
      if (mode === 'receipt' && receipt && receipt.length > 0) {
        const first = receipt[0];
        if (first?.price_display) setPrice(first.price_display);
        else if (first?.price != null) setPrice(`$${first.price}`);
        if (first?.name) setValue('productName', first.name, { shouldValidate: true });
      }
    },
    onError: (e) => {
      console.error(e);
      setOcrText('OCR failed. Check backend logs and the Network tab.');
      setPrice('');
      setPriceCandidates([]);
      setNameCandidates([]);
      setReceiptItems([]);
      setSelectedReceiptIndex(0);
      setValue('productName', '', { shouldValidate: true });
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async ({ file, values }) => {
      const form = new FormData();
      form.append('image', file);

      form.append('storeName', values.storeName.trim());
      form.append('productName', (values.productName || '').trim());
      form.append('price', (values.price ?? price) || '');

      if (values.unit?.trim()) form.append('unit', values.unit.trim());
      if (values.notes?.trim()) form.append('notes', values.notes.trim());

      return apiPostForm('/report', form);
    },
    onSuccess: () => setSaveMsg('✅ Upload complete! Redirecting…'),
    onError: (e) => {
      console.error(e);
      setSaveMsg('❌ Upload failed. Please try again.');
    },
  });

  const onPick = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPickedFile(file);
    setPreviewUrl(URL.createObjectURL(file));

    // reset view states
    setOcrText('');
    setPrice('');
    setPriceCandidates([]);
    setNameCandidates([]);
    setReceiptItems([]);
    setSelectedReceiptIndex(0);

    setValue('manualName', '');
    setValue('productName', '');
    setSaveMsg('');
    setSubmitted(false);

    // ✅ mode 포함해서 OCR
    ocrMutation.mutate({ file, mode });

    e.target.value = '';
  };

  // ✅ mode 바꾸면 (사진 선택 전) 상태를 한번 정리해주는게 UX 좋음
  useEffect(() => {
    // 이미 파일이 선택된 상태에서 mode 바꾸면 혼란 생김 → 초기화 추천
    // (원치 않으면 이 블록 삭제해도 됨)
    if (!pickedFile) {
      setOcrText('');
      setPrice('');
      setPriceCandidates([]);
      setNameCandidates([]);
      setReceiptItems([]);
      setSelectedReceiptIndex(0);
      setValue('manualName', '');
      setValue('productName', '');
      setSaveMsg('');
      setSubmitted(false);
    }
  }, [mode]); // eslint-disable-line react-hooks/exhaustive-deps

  const selectReceiptItem = (idx) => {
    setSelectedReceiptIndex(idx);
    const it = receiptItems[idx];
    if (!it) return;

    if (it.price_display) setPrice(it.price_display);
    else if (it.price != null) setPrice(`$${it.price}`);

    if (it.name) setValue('productName', it.name, { shouldValidate: true });
  };

  useEffect(() => {
    if (!previewUrl) return;
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const resetUpload = () => {
    setPickedFile(null);
    setPreviewUrl('');
    setOcrText('');
    setPrice('');
    setPriceCandidates([]);
    setNameCandidates([]);
    setReceiptItems([]);
    setSelectedReceiptIndex(0);
    setSaveMsg('');
    setSubmitted(false);

    reset({
      storeName: storeName || '',
      productName: '',
      manualName: '',
      unit: '',
      notes: '',
    });
  };

  const missingFile = !pickedFile;

  // ✅ mode 기준으로 missingPrice 결정
  const missingPrice = mode === 'single' ? !price : receiptItems.length === 0;

  const canUpload =
    !!pickedFile &&
    !!storeName?.trim() &&
    !uploadMutation.isPending &&
    !isSubmitting &&
    (
      (mode === 'single' && !!price && !!finalName) ||
      (mode === 'receipt' &&
        receiptItems.filter((it) => !!it?.name && (it?.price_display || it?.price != null)).length >= 2)
    );

  const uploadReport = handleSubmit(
    async (values) => {
      setSubmitted(true);
      if (!canUpload) return;

      setSaveMsg('');

      if (mode === 'receipt') {
        const itemsToSave = receiptItems.filter(
          (it) => !!it?.name && (it?.price_display || it?.price != null),
        );

        if (itemsToSave.length === 0) {
          setSaveMsg('❌ No valid receipt items found.');
          return;
        }

        try {
          for (let i = 0; i < itemsToSave.length; i++) {
            const it = itemsToSave[i];
            const itemPrice = it.price_display || (it.price != null ? `$${it.price}` : '');

            await uploadMutation.mutateAsync({
              file: pickedFile,
              values: {
                ...values,
                productName: it.name,
                price: itemPrice,
              },
            });
          }

          setSaveMsg(`✅ Saved ${itemsToSave.length} items! Redirecting…`);
          return;
        } catch (e) {
          console.error(e);
          setSaveMsg('❌ Upload failed while saving receipt items.');
          return;
        }
      }

      await uploadMutation.mutateAsync({
        file: pickedFile,
        values: {
          ...values,
          productName: finalName,
          price,
        },
      });
    },
    () => setSubmitted(true),
  );

  return {
    // ✅ expose mode
    mode,
    setMode,

    previewUrl,
    ocrText,
    loading: ocrMutation.isPending,

    stores: storesQuery.data || [],
    storesLoading: storesQuery.isLoading,

    price,
    setPrice,
    priceCandidates,

    nameCandidates,
    storeName,

    receiptItems,
    selectedReceiptIndex,
    selectReceiptItem,

    saveMsg,
    submitted,
    finalName,

    missingFile,
    missingPrice,
    canUpload,

    productName,
    manualName,
    register,
    control,
    errors,
    setValue,
    onPick,
    uploadReport,
    uploadLoading: uploadMutation.isPending || isSubmitting,
    resetUpload,
    hasFile: !!pickedFile,
  };
}
