export function extractBestPrice(raw) {
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

  if (filtered.length === 0) return '';

  const scored = filtered.map(({ token, line }) => {
    let score = 0;
    if (token.includes('$')) score += 5;
    if (/\.\d{2}$/.test(token)) score += 4;
    if (line.length <= 20) score += 2;
    return { token, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const best = scored[0].token;
  return best.startsWith('$') ? best : `$${best}`;
}

export function extractNameCandidates(raw, bestPrice) {
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

  const start = Math.max(0, priceIdx >= 0 ? priceIdx - 6 : lines.length - 10);
  const end = Math.min(
    lines.length,
    priceIdx >= 0 ? priceIdx + 2 : lines.length,
  );
  const near = lines.slice(start, end);

  const bad =
    /(nutrition|ingredients|saturated|trans|cholesterol|sodium|recycle|refund|apply|where|consignee|not a significant|daily value|calories|protein|carb|fat|vitamin|keep out|warning)/i;

  const candidates = near
    .filter((l) => !bad.test(l))
    .filter((l) => !/\d/.test(l))
    .filter((l) => !/[{}[\]<>]/.test(l))
    .filter((l) => l.length >= 2 && l.length <= 35)
    .map((l) => l.replace(/\s{2,}/g, ' ').trim());

  const score = (s) => {
    const letters = (s.match(/[A-Za-z]/g) || []).length;
    const upper = (s.match(/[A-Z]/g) || []).length;
    const spaces = (s.match(/\s/g) || []).length;
    return letters * 2 + upper + Math.min(s.length, 20) - spaces * 0.5;
  };

  const uniq = Array.from(new Set(candidates));
  uniq.sort((a, b) => score(b) - score(a));
  return uniq.slice(0, 3);
}
