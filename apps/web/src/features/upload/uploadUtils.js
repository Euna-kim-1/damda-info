// ===== 기존 코드 그대로 유지 =====
const toProductNameSafe = (s) =>
  s
    .replace(/[^A-Za-z0-9\s()\/\-\.&']/g, '')
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

function scoreName(s) {
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
}

export function extractPriceCandidates(raw, limit = 6) {
  const lines = raw.split('\n').map((l) => l.trim()).filter(Boolean);
  const candidates = [];

  for (const line of lines) {
    const matches = [
      ...line.matchAll(
        /(\$?\s*\d{1,3}(?:[,\s]\d{3})*(?:\.\d{2})|\$?\s*\d+\.\d{2})/g
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

function pickNameCandidatesFrom(lines, limit) {
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
}

export function extractNameCandidates(raw, bestPrice, limit = 3) {
  const lines = raw.split('\n').map((l) => l.trim()).filter(Boolean);
  return pickNameCandidatesFrom(lines, limit);
}

////////////////////////////////////////////////////////////////////////////////
// ✅ 새로운 접근: "X * 가격 EA" 패턴에서 가격 추출 → 아래에서 영어 이름 찾기
////////////////////////////////////////////////////////////////////////////////

export function parseReceiptItems(rawText = '') {
  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  // ✅ 핵심: "1 * 9.99 EA UNIT PRICE" 형식에서 가격 추출
  const extractPriceFromHeader = (s) => {
    // 패턴 1: "1 * 9.99 EA" (수량 있음)
    let match = s.match(/(\d+)\s*[\*\+]\s*(\d+\.\d{2})\s*EA/i);
    if (match) {
      const quantity = Number(match[1]);
      const unitPrice = Number(match[2]);
      return { unitPrice, quantity };
    }

    // 패턴 2: "* 6.99 EA" (수량 없음)
    match = s.match(/\*\s*(\d+\.\d{2})\s*EA/i);
    if (match) {
      const unitPrice = Number(match[1]);
      return { unitPrice, quantity: 1 };
    }

    return null;
  };

  // 영어가 있는지 체크 (최소 3글자 연속)
  const hasEnglish = (s) => /[A-Za-z]{3,}/.test(s);

  // 선행 코드 제거 (예: "1)", "Q1)", "SR)")
  const stripLeadingCode = (name) =>
    name.replace(/^[A-Z]?\d+\)\s*/i, '').trim();

  // 잡음 필터
  const looksLikeNoise = (s) => {
    const t = s.toLowerCase();

    // 카테고리/헤더/구분선
    if (/@@@|^\*\*\*|^-+>|^>/.test(s)) return true;
    if (/^\d{3}\s+[A-Z\s]+\d{3}$/.test(s)) return true; // "000 FOOD 000"

    // 가격/할인 정보 줄
    if (t.includes('unit price')) return true;
    if (t.includes('item number')) return true;
    if (t.includes('saving') && !hasEnglish(s.replace(/saving/gi, ''))) return true;
    if (t.includes('reg price') || t.includes('reg.')) return true;
    if (t.includes('on sale')) return true;

    // Footer
    if (t.includes('sub-total') || t.includes('subtotal')) return true;
    if (t.includes('total due') || t.includes('total item')) return true;
    if (t.includes('paid') || t.includes('change')) return true;

    // 숫자만 있는 코드 라인 (예: "420 6006")
    const compact = s.replace(/\s/g, '');
    const digits = (compact.match(/[0-9]/g) || []).length;
    if (compact.length > 0 && digits / compact.length > 0.85) return true;

    return false;
  };

  // Footer 시작점 찾기
  const cutIndex = lines.findIndex((l) => {
    const t = l.toLowerCase();
    return t.includes('sub-total') || t.includes('subtotal') || t.includes('total due');
  });

  const itemLines = cutIndex >= 0 ? lines.slice(0, cutIndex) : lines;

  const items = [];
  const seenNames = new Set();

  // ✅ 전략: 가격 헤더를 찾고 → 아래에서 영어 이름 찾기
  for (let i = 0; i < itemLines.length; i++) {
    const line = itemLines[i];

    // "X * 가격 EA" 패턴 찾기
    const priceInfo = extractPriceFromHeader(line);
    if (!priceInfo) continue;

    const { unitPrice } = priceInfo;

    // ✅ 이 가격 "아래"에서 영어 이름 찾기 (최대 8줄)
    // 전략: 영어가 있는 줄만 후보로 수집
    let name = '';

    for (let j = i + 1; j < itemLines.length && j <= i + 8; j++) {
      const candidateLine = itemLines[j];

      // 다음 가격 헤더가 나오면 중단 (다음 아이템 시작)
      if (extractPriceFromHeader(candidateLine)) {
        break;
      }

      // 잡음이면 스킵
      if (looksLikeNoise(candidateLine)) continue;

      // ✅ 핵심: 영어가 없으면 무조건 스킵!
      if (!hasEnglish(candidateLine)) continue;

      // 영어가 있는 줄만 후보로
      const cleaned = stripLeadingCode(candidateLine);
      if (cleaned.length >= 3 && cleaned.length <= 70) {
        name = cleaned;
        break; // 첫 번째 영어 이름 발견하면 바로 사용
      }
    }

    // 이름을 찾았고 중복이 아니면 추가
    if (name && !seenNames.has(name)) {
      items.push({
        name,
        price: unitPrice,
        price_display: `$${unitPrice.toFixed(2)}`
      });
      seenNames.add(name);
    }
  }

  // ✅ 추가: 가격 헤더가 없는 형식도 처리 (짧은 영수증용)
  // 패턴 1: "NAME    $3.99" (같은 줄)
  // 패턴 2: "NAME\n$3.99" (다음 줄)
  for (let i = 0; i < itemLines.length; i++) {
    const line = itemLines[i];

    // 이미 처리된 라인이면 스킵
    if (extractPriceFromHeader(line)) continue;
    if (looksLikeNoise(line)) continue;

    // 가격만 있는 줄은 스킵 (이미 처리됨)
    if (/^\$?\d+\.\d{2}$/.test(line)) continue;

    // 영어가 1글자라도 있어야 함
    if (!/[A-Za-z]/.test(line)) continue;

    // 패턴 1: 같은 줄에 이름과 가격
    // "Q1) Korean Pancake Mix[1kg]    $3.99"
    let match = line.match(/^(.+?)\s{2,}(\$?\d+\.\d{2})$/);
    if (!match) {
      // $ 기호 있고 공백 1개
      match = line.match(/^(.+?)\s+(\$\d+\.\d{2})$/);
    }

    if (match) {
      const name = stripLeadingCode(match[1].trim());
      const price = Number(match[2].replace('$', ''));

      // 이름에 최소 3글자 연속 영어가 있어야 함
      if (name && name.length >= 3 && name.length <= 70 &&
        /[A-Za-z]{3,}/.test(name) &&
        !seenNames.has(name) && Number.isFinite(price) && price > 0) {
        items.push({
          name,
          price,
          price_display: `$${price.toFixed(2)}`
        });
        seenNames.add(name);
      }
      continue;
    }

    // 패턴 2: 이름 줄이고, 아래 줄에 가격
    // "Pepper Serrano"
    // "$2.99"
    const name = stripLeadingCode(line.trim());

    // 이름 유효성 체크
    if (name.length < 3 || name.length > 70) continue;
    if (!/[A-Za-z]{3,}/.test(name)) continue;
    if (seenNames.has(name)) continue;

    // 다음 1-2줄에서 가격 찾기
    let foundPrice = null;
    for (let j = i + 1; j < itemLines.length && j <= i + 5; j++) {
      const nextLine = itemLines[j];

      // 가격만 있는 줄인지 체크
      const priceMatch = nextLine.match(/^\$?(\d+\.\d{2})$/);
      if (priceMatch) {
        const price = Number(priceMatch[1]);
        if (Number.isFinite(price) && price > 0 && price < 999) {
          foundPrice = price;
          break;
        }
      }

      // 잡음이거나 다른 이름이 나오면 중단
      if (!looksLikeNoise(nextLine) && /[A-Za-z]{3,}/.test(nextLine)) {
        break;
      }
    }

    if (foundPrice) {
      items.push({
        name,
        price: foundPrice,
        price_display: `$${foundPrice.toFixed(2)}`
      });
      seenNames.add(name);
    }
  }

  return items;
}