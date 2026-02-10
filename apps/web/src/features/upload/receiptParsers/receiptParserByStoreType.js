import { parseHmartReceipt } from './hmartReceiptParser';
import { parseEmartReceipt } from './emartReceiptParser';
import { parseAmartReceipt } from './amartReceiptParser';

export function parseReceiptByStoreType(rawText = '', storeType = '') {
  const type = storeType.toLowerCase();

  console.log(`🏪 파싱 마트 타입: ${type || '미선택 (기본)'}`);

  if (type === 'hmart') {
    return parseHmartReceipt(rawText);
  } else if (type === 'emart') {
    return parseEmartReceipt(rawText);
  } else if (type === 'amart') {
    return parseAmartReceipt(rawText);
  }

  console.log('🏪 기본 파싱 사용');
  return parseEmartReceipt(rawText);
}
