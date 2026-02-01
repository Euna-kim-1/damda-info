
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
  if (/\b20\d{2}[./-]\d{1,2}[./-]\d{1,2}\b/.test(s)) return true; // 2025.07.18
  if (/\b\d{8,}\b/.test(s)) return true; // long numeric (barcode)
  if (/\b(lot|expiry|exp|best before|bb)\b/i.test(s)) return true;
  return false;
};

const badText =
  /(nutrition|ingredients|saturated|trans|cholesterol|sodium|recycle|refund|apply|where|consignee|not a significant|daily value|calories|protein|carb|fat|vitamin|keep out|warning|may contain|contains)/i;

const sloganText =
  /(for your|since \d{4}|made in|product of|best choice|premium|quality|fresh)/i;

const productKeywords =
  /(seasoning|mix|powder|salt|soup|base|broth|flavor|flavoured|paste|sauce|ramen|noodle|tea|snack|curry|dashida|ssamjang|soy|kimchi)/i;

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

  if (candidates.length === 0) {
    for (const line of lines) {
      const matches = [
        ...line.matchAll(/(\$\s*\d{1,3}(?:[,\s]\d{3})*|\$\s*\d+)/g),
      ];
      for (const m of matches)
        candidates.push({ token: m[1].replace(/\s/g, ''), line });
    }
  }

  const filtered = candidates.filter(({ token, line }) => {
    const t = token.replace('$', '');
    const num = Number(t.replace(/,/g, ''));
    if (!Number.isFinite(num) || num <= 0 || num > 9999) return false;
    if (/\b20\d{2}\.\d{2}\.\d{2}\b/.test(line)) return false;
    if (/\b(ml|mL|l|L|g|kg)\b/.test(line)) return false;
    if (/%/.test(line)) return false;
    return true;
  });

  if (filtered.length === 0) return [];

  const scored = filtered.map(({ token, line }) => {
    let score = 0;
    if (token.includes('$')) score += 5;
    if (/\.\d{2}$/.test(token)) score += 4;
    if (line.length <= 20) score += 2;
    return { token, score };
  });

  scored.sort((a, b) => b.score - a.score);

  const uniq = [];
  const seen = new Set();

  for (const s of scored) {
    const t = s.token.replace(/\s/g, '');
    const withDollar = t.startsWith('$') ? t : `$${t}`;
    const key = withDollar.replace(/,/g, '');
    if (seen.has(key)) continue;
    seen.add(key);
    uniq.push(withDollar);
    if (uniq.length >= limit) break;
  }

  return uniq;
}

export function extractBestPrice(raw) {
  const list = extractPriceCandidates(raw, 1);
  return list[0] || '';
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
    .filter((l) => {
      const letters = (l.match(/[A-Za-z]/g) || []).length;
      return letters >= 2 && l.length >= 4 && l.length <= 45;
    });

  const uniq = Array.from(new Set(cleaned));
  uniq.sort((a, b) => scoreName(b) - scoreName(a));
  return uniq.slice(0, limit);
}

export function extractNameCandidates(raw, bestPrice, limit = 3) {
  const lines = raw
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  const priceNeedle = (bestPrice || '').replace(/\s/g, '').replace('$', '');
  let priceIdx = -1;

  if (priceNeedle) {
    priceIdx = lines.findIndex((l) =>
      l.replace(/\s/g, '').replace('$', '').includes(priceNeedle),
    );
  }

  const start = Math.max(0, priceIdx >= 0 ? priceIdx - 6 : 0);
  const end = Math.min(lines.length, priceIdx >= 0 ? priceIdx + 6 : lines.length);
  const near = lines.slice(start, end);

  const nearPick = pickNameCandidatesFrom(near, limit);
  if (nearPick.length > 0) return nearPick;

  return pickNameCandidatesFrom(lines, limit);
}
