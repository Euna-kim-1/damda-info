import { parseEmartReceipt } from './emartReceiptParser';

const normalizeAmartText = (rawText = '') => {
  return rawText.replace(/[＠﹫]/g, '@');
};

const hasUnclosedBracket = (s) => {
  const openSquare = (s.match(/\[/g) || []).length;
  const closeSquare = (s.match(/]/g) || []).length;
  const openRound = (s.match(/\(/g) || []).length;
  const closeRound = (s.match(/\)/g) || []).length;
  return openSquare > closeSquare || openRound > closeRound;
};

const fragmentToken = (s) => s.replace(/[^A-Za-z0-9\]]/g, '');
const isPriceOrPromoLine = (s) =>
  /\$?\s*\d+\.\d{2}/.test(s) || /(on sale|reg\.|multi)/i.test(s);

const buildAmartLines = (rawText = '') => {
  const rawLines = normalizeAmartText(rawText)
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  const isShortFragment = (s) => /^[A-Za-z0-9]{1,5}\]?$/i.test(s);
  const normalized = [];

  for (const line of rawLines) {
    if (normalized.length > 0) {
      const token = fragmentToken(line);
      let unclosedIndex = -1;

      // 최근 4줄 안에서 닫히지 않은 대괄호/괄호가 있는 이름 라인을 찾는다.
      for (
        let k = normalized.length - 1;
        k >= 0 && normalized.length - k <= 4;
        k--
      ) {
        if (hasUnclosedBracket(normalized[k])) {
          unclosedIndex = k;
          break;
        }
        // 이미 다른 정상 이름 라인을 만나면 더 거슬러 올라가지 않는다.
        if (/[A-Za-z]{2,}/.test(normalized[k]) && !isPriceOrPromoLine(normalized[k])) {
          break;
        }
      }

      if (unclosedIndex >= 0 && isShortFragment(token) && !line.includes('$')) {
        let fragment = line;
        if (/^(?:o|0)g[l1i]?\]?$/i.test(token)) fragment = '0g]';
        normalized[unclosedIndex] = `${normalized[unclosedIndex]}${fragment}`;
        continue;
      }
    }

    normalized.push(line);
  }

  return normalized;
};

export function parseAmartReceipt(rawText = '') {
  console.log('🛒 A-mart 파싱 실행 (v2)');
  const lines = buildAmartLines(rawText);

  const hasEnglish = (s) => /[A-Za-z]{2,}/.test(s);
  const isStandalonePrice = (s) =>
    /^[A-Z]?\s*\$?\d+\.\d{2}(?:\s*\/\s*(ea|lb))?$/i.test(s);
  const isRegOrPromoLine = (s) => /(on sale|reg\.)/i.test(s);
  const stripLeadingCode = (name) =>
    name.replace(/^(?:[A-Z]{1,3}\d*|\d+)\)\s*/i, '').trim();
  const cleanName = (line) =>
    stripLeadingCode(
      line
        .replace(/\s+\$?\d+\.\d{2}(?:\s*\/\s*(ea|lb))?$/i, '')
        .replace(/\s+[A-Z]\s*$/i, '')
        .replace(/\s{2,}/g, ' ')
        .trim(),
    );

  const parseAtPrice = (s) => {
    const m = s.match(/(\d+)\s*[@x*]\s*\$?\s*(\d+\.\d{2})\s*(ea|lb)?/i);
    if (!m) return null;
    const qty = Number(m[1]);
    const unitPrice = Number(m[2]);
    if (!Number.isFinite(qty) || !Number.isFinite(unitPrice) || qty <= 0)
      return null;
    return { qty, unitPrice };
  };

  const parseMultiPrice = (s) => {
    const m = s.match(/(?:multi[:\s-]*)?(\d+)\s*\/\s*\$?\s*(\d+\.\d{2})/i);
    if (!m) return null;
    const qty = Number(m[1]);
    const total = Number(m[2]);
    if (
      !Number.isFinite(qty) ||
      !Number.isFinite(total) ||
      qty <= 0 ||
      total <= 0
    )
      return null;
    return { qty, total };
  };

  const extractLastMoney = (s) => {
    const matches = [...s.matchAll(/\$?\s*(\d+\.\d{2})/g)];
    if (matches.length === 0) return null;
    const val = Number(matches[matches.length - 1][1]);
    return Number.isFinite(val) ? val : null;
  };

  const isLikelyNameLine = (line, idx) => {
    if (!hasEnglish(line)) return false;
    if (isStandalonePrice(line)) return false;
    if (parseAtPrice(line)) return false;
    if (parseMultiPrice(line)) return false;
    if (
      idx > 0 &&
      hasUnclosedBracket(lines[idx - 1]) &&
      !/\s/.test(line) &&
      fragmentToken(line).length <= 5
    )
      return false;
    // 가격/프로모션 라인이 중간에 있어도 조각줄(Ogl 같은)은 이름으로 취급하지 않는다.
    if (!/\s/.test(line) && fragmentToken(line).length <= 5) {
      for (let back = 1; back <= 3; back++) {
        if (idx - back < 0) break;
        if (hasUnclosedBracket(lines[idx - back])) return false;
      }
    }

    const t = line.toLowerCase();
    if (
      /(sub[-\s]?total|total due|paid|change|tax|coupon|saving|discount|item number|unit price|reg\.?|multi)/i.test(
        t,
      )
    )
      return false;
    if (/^\d{3}\s+[A-Z\s]+\d{3}$/.test(line)) return false;
    return true;
  };

  const roundMoney = (n) => Number(n.toFixed(2));
  const items = [];
  const seenNames = new Set();
  const consumedPriceLineIndexes = new Set();
  const unresolvedItemIndexes = [];
  const nameLineIndexes = [];

  for (let i = 0; i < lines.length; i++) {
    if (isLikelyNameLine(lines[i], i)) nameLineIndexes.push(i);
  }

  const nextNameIndexAfter = (idx) => {
    for (const nameIdx of nameLineIndexes) {
      if (nameIdx > idx) return nameIdx;
    }
    return lines.length;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!isLikelyNameLine(line, i)) continue;

    const name = cleanName(line);
    if (!name || name.length < 2 || name.length > 80 || seenNames.has(name))
      continue;

    let bestPrice = null;
    let bestQty = 1;
    let bestRank = 0;

    const setBest = (price, qty, rank, lineIdx) => {
      if (!Number.isFinite(price) || price <= 0) return;
      const normalizedQty =
        Number.isFinite(qty) && qty > 0 ? Math.trunc(qty) : 1;
      if (rank < bestRank) return;
      bestPrice = roundMoney(price);
      bestQty = normalizedQty;
      bestRank = rank;
      if (Number.isInteger(lineIdx)) consumedPriceLineIndexes.add(lineIdx);
    };

    const nextNameIdx = nextNameIndexAfter(i);
    const scanEnd =
      nextNameIdx < lines.length
        ? nextNameIdx - 1
        : Math.min(lines.length - 1, i + 8);

    for (let j = i; j <= scanEnd; j++) {
      const current = lines[j];
      if (j > i && j < nextNameIdx && isLikelyNameLine(current, j)) break;

      const single = extractLastMoney(current);
      if (single != null && !isRegOrPromoLine(current)) {
        if (isStandalonePrice(current)) consumedPriceLineIndexes.add(j);
        setBest(single, 1, 1, j);
      }

      const multi = parseMultiPrice(current);
      if (multi) {
        consumedPriceLineIndexes.add(j);
        setBest(multi.total / multi.qty, multi.qty, 2, j);
      }

      const at = parseAtPrice(current);
      if (at) {
        consumedPriceLineIndexes.add(j);
        setBest(at.unitPrice, at.qty, 3, j);
        break;
      }
    }

    if (bestPrice == null) {
      items.push({
        name,
        quantity: 1,
        price: null,
        price_display: '',
      });
      unresolvedItemIndexes.push(items.length - 1);
      seenNames.add(name);
      continue;
    }

    items.push({
      name,
      quantity: bestQty,
      price: bestPrice,
      price_display: `$${bestPrice.toFixed(2)}`,
    });
    seenNames.add(name);
  }

  // 2차: 명시 단가를 못 찾은 아이템에 남은 단독 가격을 순서대로 매칭
  const remainingStandalonePrices = [];
  for (let i = 0; i < lines.length; i++) {
    if (consumedPriceLineIndexes.has(i)) continue;
    if (!isStandalonePrice(lines[i])) continue;

    const p = extractLastMoney(lines[i]);
    if (p == null || p <= 0) continue;
    remainingStandalonePrices.push(p);
  }

  for (let i = 0; i < unresolvedItemIndexes.length; i++) {
    const itemIdx = unresolvedItemIndexes[i];
    const price = remainingStandalonePrices[i];
    if (!Number.isFinite(price)) continue;

    const rounded = roundMoney(price);
    items[itemIdx] = {
      ...items[itemIdx],
      price: rounded,
      price_display: `$${rounded.toFixed(2)}`,
    };
  }

  const finalizedItems = items.filter(
    (it) => !!it?.name && Number.isFinite(it?.price) && it.price > 0,
  );

  // A-mart 전용 규칙으로 못 잡은 경우 기존 파서로 fallback
  if (finalizedItems.length === 0) {
    return parseEmartReceipt(rawText);
  }

  return finalizedItems;
}
