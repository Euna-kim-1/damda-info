import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { extractBestPrice, extractNameCandidates } from './uploadUtils';

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
  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

  const [pickedFile, setPickedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [ocrText, setOcrText] = useState('');
  const [price, setPrice] = useState('');
  const [nameCandidates, setNameCandidates] = useState([]);

  const [saveMsg, setSaveMsg] = useState('');
  const [submitted, setSubmitted] = useState(false);

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
        const r = await fetch(`${API_BASE}/stores`);
        const data = await r.json();
        if (!r.ok) throw new Error(JSON.stringify(data));
        return data.stores || [];
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
    if (!storesQuery.data?.length) return;
    if (!storesQuery.data.some((s) => s.name === storeName)) {
      setValue('storeName', storesQuery.data[0]?.name || '', {
        shouldValidate: true,
      });
    }
  }, [setValue, storeName, storesQuery.data]);

  const ocrMutation = useMutation({
    mutationFn: async (file) => {
      const form = new FormData();
      form.append('image', file);

      const r = await fetch(`${API_BASE}/ocr`, { method: 'POST', body: form });
      const data = await r.json();
      if (!r.ok) throw new Error(JSON.stringify(data));

      const raw = data.text || '';
      const nextPrice = extractBestPrice(raw);
      const candidates = extractNameCandidates(raw, nextPrice);
      return { raw, nextPrice, candidates };
    },
    onSuccess: ({ raw, nextPrice, candidates }) => {
      setOcrText(raw);
      setPrice(nextPrice);
      setNameCandidates(candidates);
      setValue('productName', candidates[0] || '', { shouldValidate: true });
    },
    onError: (e) => {
      console.error(e);
      setOcrText('OCR failed. Check backend logs and the Network tab.');
      setPrice('');
      setNameCandidates([]);
      setValue('productName', '', { shouldValidate: true });
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async ({ file, values }) => {
      const form = new FormData();
      form.append('image', file);
      form.append('storeName', values.storeName.trim());
      form.append('productName', values.productName.trim());
      form.append('price', price);
      if (values.unit?.trim()) form.append('unit', values.unit.trim());
      if (values.notes?.trim()) form.append('notes', values.notes.trim());

      const r = await fetch(`${API_BASE}/report`, {
        method: 'POST',
        body: form,
      });

      const data = await r.json();
      if (!r.ok) throw new Error(JSON.stringify(data));
      return data;
    },
    onSuccess: () => {
      setSaveMsg('✅ Upload complete! (Storage + DB saved)');
    },
    onError: (e) => {
      console.error(e);
      setSaveMsg('❌ Upload failed. Check backend logs and the Network tab.');
    },
  });

  const onPick = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPickedFile(file);
    setPreviewUrl(URL.createObjectURL(file));

    setOcrText('');
    setPrice('');
    setNameCandidates([]);
    setValue('manualName', '');
    setValue('productName', '');
    setSaveMsg('');
    setSubmitted(false);

    ocrMutation.mutate(file);

    e.target.value = '';
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
    setNameCandidates([]);
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
  const missingPrice = !price;
  const missingName = !finalName;
  const missingStore = !storeName?.trim();

  const canUpload =
    !!pickedFile &&
    !!price &&
    !!finalName &&
    !!storeName?.trim() &&
    !uploadMutation.isPending &&
    !isSubmitting;

  const uploadReport = handleSubmit(
    async (values) => {
      setSubmitted(true);
      if (!canUpload) return;
      setSaveMsg('');
      await uploadMutation.mutateAsync({
        file: pickedFile,
        values: {
          ...values,
          productName: finalName,
        },
      });
    },
    () => {
      setSubmitted(true);
    },
  );

  return {
    previewUrl,
    ocrText,
    loading: ocrMutation.isPending,
    stores: storesQuery.data || [],
    storesLoading: storesQuery.isLoading,
    price,
    nameCandidates,
    storeName,
    saveMsg,
    submitted,
    finalName,
    missingFile,
    missingPrice,
    missingName,
    missingStore,
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
