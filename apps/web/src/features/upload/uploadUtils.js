const toProductNameSafe = (s) =>
  s
    .replace(/[^A-Za-z0-9\s()/.&'-]/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();

const isMostlyNumbers = (s) => {
  const t = s.replace(/\s/g, '');
  if (!t) return true;
  const digits = (t.match(/[0-9]/g) || []).length;
  return digits / t.length > 0.6;
};

const looksLikeDateOrCode = (s) => {
  if (/\b20\d{2}[./-]\d{1,2}[./-]\d{1,2}\b/.test(s)) return true;
  if (/\b\d{8,}\b/.test(s)) return true;
  if (/\b(lot|expiry|exp|best before|bb)\b/i.test(s)) return true;
  return false;
};

const badText =
  /(nutrition|ingredients|saturated|trans|cholesterol|sodium|recycle|refund|apply|where|consignee|not a significant|daily value|calories|protein|carb|fat|vitamin|keep out|warning|may contain|contains)/i;

const sloganText =
  /(for your|since \d{4}|made in|product of|best choice|premium|quality|fresh)/i;

const productKeywords =
  /(seasoning|mix|powder|salt|soup|base|broth|flavor|flavoured|paste|sauce|ramen|noodle|tea|snack|curry|dashida|ssamjang|soy|kimchi|tofu|sprouts|chip|onion|shrimp|cracker|pancake|pepper|clam|mushroom|paper)/i;

const scoreName = (s) => {
  let score = 0;

  const letters = (s.match(/[A-Za-z]/g) || []).length;
  const upper = (s.match(/[A-Z]/g) || []).length;
  const words = s.split(/\s+/).filter(Boolean).length;

  score += letters * 2;
  score += upper * 0.5;
  score += Math.min(s.length, 30);

  if (productKeywords.test(s)) score += 10;
  if (sloganText.test(s)) score -= 10;
  if (words <= 1) score -= 4;

  return score;
};

export function extractPriceCandidates(raw, limit = 6) {
  const lines = raw
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
  const candidates = [];

  for (const line of lines) {
    const matches = [
      ...line.matchAll(
        /(\$?\s*\d{1,3}(?:[,\s]\d{3})*(?:\.\d{2})|\$?\s*\d+\.\d{2})/g,
      ),
    ];
    for (const m of matches)
      candidates.push({ token: m[1].replace(/\s/g, ''), line });
  }

  const filtered = candidates.filter(({ token }) => {
    const num = Number(token.replace('$', '').replace(/,/g, ''));
    return Number.isFinite(num) && num > 0 && num < 9999;
  });

  const uniq = [];
  const seen = new Set();

  for (const c of filtered) {
    const val = c.token.startsWith('$') ? c.token : `$${c.token}`;
    if (seen.has(val)) continue;
    seen.add(val);
    uniq.push(val);
    if (uniq.length >= limit) break;
  }

  return uniq;
}

export function extractBestPrice(raw) {
  return extractPriceCandidates(raw, 1)[0] || '';
}

const pickNameCandidatesFrom = (lines, limit) => {
  const cleaned = lines
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => toProductNameSafe(l))
    .filter(Boolean)
    .filter((l) => !badText.test(l))
    .filter((l) => !looksLikeDateOrCode(l))
    .filter((l) => !isMostlyNumbers(l))
    .filter((l) => l.length >= 4 && l.length <= 45);

  const uniq = Array.from(new Set(cleaned));
  uniq.sort((a, b) => scoreName(b) - scoreName(a));
  return uniq.slice(0, limit);
};

export function extractNameCandidates(raw, bestPrice, limit = 3) {
  const lines = raw
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
  return pickNameCandidatesFrom(lines, limit);
}

export { parseReceiptItems } from './receiptParsers/emartReceiptParser';
export { parseHmartReceipt } from './receiptParsers/hmartReceiptParser';
export { parseEmartReceipt } from './receiptParsers/emartReceiptParser';
export { parseAmartReceipt } from './receiptParsers/amartReceiptParser';
export { parseReceiptByStoreType } from './receiptParsers/receiptParserByStoreType';
