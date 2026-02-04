import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  extractBestPrice,
  extractNameCandidates,
  extractPriceCandidates,
  parseReceiptItems, // ✅ 추가
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
    // ✅ 영수증 모드에서는 productName/manualName 없어도 "bulk 저장" 가능하게 할 거라
    // 이 검증은 UI 단에서만 의미가 있고, uploadReport에서 분기 처리할 예정.
    // 그래서 여기서는 유지하되, receipt 모드일 때는 uploadReport에서 통과시키게 처리.
    if (!data.manualName && !data.productName) {
      ctx.addIssue({
        code: 'custom',
        path: ['manualName'],
        message: 'Please select or type a name.',
      });
    }
  });

export function useUploadReport() {
  const [pickedFile, setPickedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [ocrText, setOcrText] = useState('');

  const [price, setPrice] = useState('');
  const [priceCandidates, setPriceCandidates] = useState([]);
  const [nameCandidates, setNameCandidates] = useState([]);
  const [saveMsg, setSaveMsg] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // ✅ receipt 관련 state 최소 추가
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

  const isReceipt = receiptItems.length >= 2;

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
    mutationFn: async (file) => {
      const form = new FormData();
      form.append('image', file);

      const data = await apiPostForm('/ocr', form);
      const raw = data?.text || '';

      // ✅ receipt 파싱 추가 (원본 로직은 유지)
      const receipt = parseReceiptItems(raw) || [];

      const prices = extractPriceCandidates(raw, 6);
      const nextPrice = prices[0] || extractBestPrice(raw);
      const candidates = extractNameCandidates(raw, nextPrice, 3);

      return { raw, prices, nextPrice, candidates, receipt };
    },
    onSuccess: ({ raw, prices, nextPrice, candidates, receipt }) => {
      setOcrText(raw);

      // ✅ receiptItems 세팅
      setReceiptItems(receipt);
      setSelectedReceiptIndex(0);

      // ✅ 기존 single 세팅 유지
      setPriceCandidates(prices);
      setPrice(nextPrice);

      setNameCandidates(candidates);
      setValue('productName', candidates[0] || '', { shouldValidate: true });

      // ✅ receipt가 있으면, UI 기본 선택값을 "첫 아이템"으로 맞춰주기
      if (receipt && receipt.length >= 2) {
        const first = receipt[0];
        if (first?.price_display) setPrice(first.price_display);
        else if (first?.price != null) setPrice(`$${first.price}`);

        if (first?.name) {
          setValue('productName', first.name, { shouldValidate: true });
        }
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

  // ✅ 업로드 mutation: price를 "state price"만 쓰지 말고 values.price를 받도록 최소 수정
  const uploadMutation = useMutation({
    mutationFn: async ({ file, values }) => {
      const form = new FormData();
      form.append('image', file);

      form.append('storeName', values.storeName.trim());
      form.append('productName', (values.productName || '').trim());

      // ✅ 핵심: receipt loop에서 각 아이템 price를 넣을 수 있게
      form.append('price', (values.price ?? price) || '');

      if (values.unit?.trim()) form.append('unit', values.unit.trim());
      if (values.notes?.trim()) form.append('notes', values.notes.trim());

      return apiPostForm('/report', form);
    },
    onSuccess: () => {
      setSaveMsg('✅ Upload complete! Redirecting…');
    },
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

    ocrMutation.mutate(file);

    e.target.value = '';
  };

  // ✅ receipt item 선택 (UI에서 클릭 시 해당 아이템 값으로 price/name 채워줌)
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

  // ✅ receipt 모드에서는 "단일 price/finalName"을 강제하지 않고 receiptItems가 있으면 OK로
  const missingPrice = !isReceipt ? !price : receiptItems.length === 0;

  const canUpload =
    !!pickedFile &&
    !!storeName?.trim() &&
    !uploadMutation.isPending &&
    !isSubmitting &&
    (
      // single
      (!isReceipt && !!price && !!finalName) ||
      // receipt: receiptItems에 name+price가 있는 애들이 2개 이상이면 업로드 가능
      (isReceipt &&
        receiptItems.filter((it) => !!it?.name && (it?.price_display || it?.price != null)).length >= 2)
    );

  // ✅ 핵심: receipt면 "4개 전부 저장"
  const uploadReport = handleSubmit(
    async (values) => {
      setSubmitted(true);
      if (!canUpload) return;

      setSaveMsg('');

      // receipt bulk 저장
      if (isReceipt) {
        const itemsToSave = receiptItems.filter(
          (it) => !!it?.name && (it?.price_display || it?.price != null),
        );

        if (itemsToSave.length === 0) {
          setSaveMsg('❌ No valid receipt items found.');
          return;
        }

        try {
          // 같은 영수증 사진을 item 수만큼 반복 업로드 (서버 수정 없이 가능)
          for (let i = 0; i < itemsToSave.length; i++) {
            const it = itemsToSave[i];
            const itemPrice =
              it.price_display || (it.price != null ? `$${it.price}` : '');

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

      // single 저장 (원본 그대로)
      await uploadMutation.mutateAsync({
        file: pickedFile,
        values: {
          ...values,
          productName: finalName,
          price, // 그대로
        },
      });
    },
    () => setSubmitted(true),
  );

  return {
    previewUrl,
    ocrText,
    loading: ocrMutation.isPending,

    stores: storesQuery.data || [],
    storesLoading: storesQuery.isLoading,

    // single item
    price,
    setPrice,
    priceCandidates,

    nameCandidates,
    storeName,

    // receipt
    receiptItems,
    isReceipt,
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
