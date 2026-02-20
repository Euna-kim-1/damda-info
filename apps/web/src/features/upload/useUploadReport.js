import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  extractBestPrice,
  extractNameCandidates,
  extractPriceCandidates,
  parseReceiptByStoreType,
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
  const [mode, setMode] = useState('single'); // 'single' | 'receipt'
  const [selectedStoreType, setSelectedStoreType] = useState('');

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
    if (mode === 'receipt') return;

    if (!list.some((s) => s.name === storeName)) {
      setValue('storeName', list[0]?.name || '', { shouldValidate: true });
    }
  }, [mode, setValue, storeName, storesQuery.data]);

  const ocrMutation = useMutation({
    mutationFn: async ({ file, mode, storeType }) => {
      const form = new FormData();
      form.append('image', file);

      const data = await apiPostForm('/ocr', form);
      const raw = data?.text || '';

      const receipt = mode === 'receipt'
        ? parseReceiptByStoreType(raw, storeType)
        : [];

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

      if (mode === 'receipt' && receipt && receipt.length > 0) {
        const first = receipt[0];
        if (first?.price_display) setPrice(first.price_display);
        else if (first?.price != null) setPrice(`$${first.price}`);
        if (first?.name)
          setValue('productName', first.name, { shouldValidate: true });
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
    mutationFn: async ({ file, values, mode }) => {
      const form = new FormData();
      form.append('image', file);
      form.append('mode', mode);

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

    console.log('📸 OCR 실행 - mode:', mode, 'storeType:', selectedStoreType);
    ocrMutation.mutate({ file, mode, storeType: selectedStoreType });

    e.target.value = '';
  };

  useEffect(() => {
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

  const removeReceiptItem = (idx) => {
    if (idx < 0 || idx >= receiptItems.length) return;

    const nextItems = receiptItems.filter((_, i) => i !== idx);
    setReceiptItems(nextItems);

    if (nextItems.length === 0) {
      setSelectedReceiptIndex(0);
      setPrice('');
      setValue('productName', '', { shouldValidate: true });
      return;
    }

    const nextIndex =
      selectedReceiptIndex > idx
        ? selectedReceiptIndex - 1
        : Math.min(selectedReceiptIndex, nextItems.length - 1);

    setSelectedReceiptIndex(nextIndex);

    const nextItem = nextItems[nextIndex];
    if (nextItem?.price_display) setPrice(nextItem.price_display);
    else if (nextItem?.price != null) setPrice(`$${nextItem.price}`);
    else setPrice('');

    if (nextItem?.name) {
      setValue('productName', nextItem.name, { shouldValidate: true });
    } else {
      setValue('productName', '', { shouldValidate: true });
    }
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
  const missingPrice = mode === 'single' ? !price : receiptItems.length === 0;

  const canUpload =
    !!pickedFile &&
    !uploadMutation.isPending &&
    !isSubmitting &&
    ((mode === 'single' && !!storeName?.trim() && !!price && !!finalName) ||
      (mode === 'receipt' &&
        receiptItems.filter(
          (it) => !!it?.name && (it?.price_display || it?.price != null),
        ).length >= 1));

  const uploadReport = handleSubmit(
    async (values) => {
      setSubmitted(true);
      if (!canUpload) return;

      setSaveMsg('');

      if (mode === 'receipt') {
        if (!values.storeName?.trim()) {
          setSaveMsg('❌ Please select a store location before upload.');
          return;
        }

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
            const itemPrice =
              it.price_display || (it.price != null ? `$${it.price}` : '');

            await uploadMutation.mutateAsync({
              file: pickedFile,
              mode,
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
        mode,
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
    mode,
    setMode,

    selectedStoreType,
    setSelectedStoreType,

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
    removeReceiptItem,

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
