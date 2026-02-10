import { parseEmartReceipt } from './emartReceiptParser';

export function parseHmartReceipt(rawText = '') {
  return parseEmartReceipt(rawText);
}
