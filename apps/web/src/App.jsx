import { useMemo, useState } from "react";

/** ✅ 가격: 가장 그럴듯한 1개 */
function extractBestPrice(raw) {
  const lines = raw.split("\n").map(l => l.trim()).filter(Boolean);
  const candidates = [];

  // 소수점 2자리 우선
  for (const line of lines) {
    const matches = [...line.matchAll(/(\$?\s*\d{1,3}(?:[,\s]\d{3})*(?:\.\d{2})|\$?\s*\d+\.\d{2})/g)];
    for (const m of matches) candidates.push({ token: m[1].replace(/\s/g, ""), line });
  }

  // fallback: $21 같은 케이스
  if (candidates.length === 0) {
    for (const line of lines) {
      const matches = [...line.matchAll(/(\$\s*\d{1,3}(?:[,\s]\d{3})*|\$\s*\d+)/g)];
      for (const m of matches) candidates.push({ token: m[1].replace(/\s/g, ""), line });
    }
  }

  const filtered = candidates.filter(({ token, line }) => {
    const t = token.replace("$", "");
    const num = Number(t.replace(/,/g, ""));
    if (!Number.isFinite(num) || num <= 0 || num > 9999) return false;
    if (/\b20\d{2}\.\d{2}\.\d{2}\b/.test(line)) return false;
    if (/\b(ml|mL|l|L|g|kg)\b/.test(line)) return false;
    if (/%/.test(line)) return false;
    return true;
  });

  if (filtered.length === 0) return "";

  const scored = filtered.map(({ token, line }) => {
    let score = 0;
    if (token.includes("$")) score += 5;
    if (/\.\d{2}$/.test(token)) score += 4;
    if (line.length <= 20) score += 2;
    return { token, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const best = scored[0].token;
  return best.startsWith("$") ? best : `$${best}`;
}

/**
 * ✅ 상품명 후보 3개
 * - "가격 근처"에서 우선 찾음
 * - 영양성분/설명문/단위/환불/리사이클 같은 잡음 제거
 * - 너무 긴 문장 제거
 */
function extractNameCandidates(raw, bestPrice) {
  const lines = raw.split("\n").map(l => l.trim()).filter(Boolean);

  // 가격 줄 위치 찾기(정확히 일치 안해도 포함되면 OK)
  const priceNeedle = (bestPrice || "").replace(/\s/g, "").replace("$", "");
  let priceIdx = -1;
  if (priceNeedle) {
    priceIdx = lines.findIndex(l =>
      l.replace(/\s/g, "").replace("$", "").includes(priceNeedle)
    );
  }

  // 가격이 있으면 주변, 없으면 마지막 쪽에서 후보 찾기
  const start = Math.max(0, (priceIdx >= 0 ? priceIdx - 6 : lines.length - 10));
  const end = Math.min(lines.length, (priceIdx >= 0 ? priceIdx + 2 : lines.length));
  const near = lines.slice(start, end);

  // 잡음 키워드(필요하면 계속 추가하면 정확도 확 올라감)
  const bad =
    /(nutrition|ingredients|saturated|trans|cholesterol|sodium|recycle|refund|apply|where|consignee|not a significant|daily value|calories|protein|carb|fat|vitamin|keep out|warning)/i;

  // 후보 필터링
  const candidates = near
    .filter(l => !bad.test(l))
    .filter(l => !/\d/.test(l))                 // 숫자 포함 줄 제거
    .filter(l => !/[{}[\]<>]/.test(l))
    .filter(l => l.length >= 2 && l.length <= 35) // 너무 긴 문장 제외
    .map(l => l.replace(/\s{2,}/g, " ").trim());

  // 점수화: 알파벳 비율, 대문자, 길이
  const score = (s) => {
    const letters = (s.match(/[A-Za-z]/g) || []).length;
    const upper = (s.match(/[A-Z]/g) || []).length;
    const spaces = (s.match(/\s/g) || []).length;
    // 상품명은 대체로 "문장"보다는 "짧은 구"라서 공백 많으면 살짝 감점
    return letters * 2 + upper + Math.min(s.length, 20) - spaces * 0.5;
  };

  const uniq = Array.from(new Set(candidates));
  uniq.sort((a, b) => score(b) - score(a));

  // 아래쪽 후보를 조금 더 우선(라벨에서 상품명이 하단에 오는 경우가 많음)
  // 단, 점수 정렬을 유지하되 상위만 반환
  return uniq.slice(0, 3);
}

export default function App() {
  const [pickedFile, setPickedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [ocrText, setOcrText] = useState("");
  const [loading, setLoading] = useState(false);

  const [price, setPrice] = useState("");
  const [nameCandidates, setNameCandidates] = useState([]);
  const [selectedName, setSelectedName] = useState("");
  const [manualName, setManualName] = useState("");

  const canRun = !!pickedFile && !loading;

  const helperText = useMemo(() => {
    const api = import.meta.env.VITE_API_BASE || "http://localhost:4000";
    return `- Google Vision OCR (서버에서 처리)\n- 백엔드: ${api}/ocr\n- 목표: 가격은 자동, 상품명은 후보 3개 중 선택(또는 직접 입력)`;
  }, []);

  const onPick = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPickedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setOcrText("");
    setPrice("");
    setNameCandidates([]);
    setSelectedName("");
    setManualName("");
  };

  const runOcr = async () => {
    if (!pickedFile) return;
    setLoading(true);

    try {
      const form = new FormData();
      form.append("image", pickedFile);

      const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

      const r = await fetch(`${API_BASE}/ocr`, {
        method: "POST",
        body: form,
      });

      const data = await r.json();
      if (!r.ok) throw new Error(JSON.stringify(data));

      const raw = data.text || "";
      setOcrText(raw);

      // ✅ 가격 먼저
      const p = extractBestPrice(raw);
      setPrice(p);

      // ✅ 상품명 후보 3개
      const cands = extractNameCandidates(raw, p);
      setNameCandidates(cands);

      // 기본 선택: 첫 후보
      setSelectedName(cands[0] || "");
    } catch (e) {
      console.error(e);
      setOcrText("OCR 실패. 백엔드 콘솔/네트워크 탭 확인해줘.");
      setPrice("");
      setNameCandidates([]);
      setSelectedName("");
    } finally {
      setLoading(false);
    }
  };

  const finalName = manualName.trim() ? manualName.trim() : selectedName;

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: 16 }}>
      <h2>Damda OCR 테스트 (Vision) - 상품명 후보 선택</h2>

      <p style={{ whiteSpace: "pre-wrap", color: "#666" }}>{helperText}</p>

      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <input type="file" accept="image/*" capture="environment" onChange={onPick} />
        <button disabled={!canRun} onClick={runOcr}>
          {loading ? "OCR 중..." : "OCR 실행"}
        </button>
      </div>

      {previewUrl && (
        <div style={{ marginTop: 16 }}>
          <h3>미리보기</h3>
          <img src={previewUrl} alt="preview" style={{ width: "100%", borderRadius: 12 }} />
        </div>
      )}

      <div style={{ marginTop: 16 }}>
        <h3>추출 결과</h3>
        <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 12, background: "#fafafa" }}>
          <div style={{ marginBottom: 10 }}>
            <b>가격:</b> {price || "(없음)"}
          </div>

          <div style={{ marginBottom: 10 }}>
            <b>상품명 후보(탭해서 선택):</b>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
              {nameCandidates.length === 0 ? (
                <span style={{ color: "#888" }}>(후보 없음)</span>
              ) : (
                nameCandidates.map((c) => (
                  <button
                    key={c}
                    onClick={() => setSelectedName(c)}
                    style={{
                      padding: "8px 10px",
                      borderRadius: 999,
                      border: c === selectedName ? "2px solid #000" : "1px solid #ccc",
                      background: c === selectedName ? "#fff" : "#f6f6f6",
                      cursor: "pointer",
                    }}
                  >
                    {c}
                  </button>
                ))
              )}
            </div>
          </div>

          <div style={{ marginBottom: 10 }}>
            <b>직접 입력(선택사항):</b>
            <input
              value={manualName}
              onChange={(e) => setManualName(e.target.value)}
              placeholder="상품명이 이상하면 여기서 직접 입력"
              style={{
                display: "block",
                width: "100%",
                marginTop: 8,
                padding: 10,
                borderRadius: 10,
                border: "1px solid #ccc",
              }}
            />
          </div>

          <div>
            <b>최종 상품명:</b> {finalName || "(없음)"}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <h3>OCR 원문</h3>
        <textarea
          value={ocrText}
          readOnly
          rows={12}
          style={{
            width: "100%",
            borderRadius: 12,
            border: "1px solid #ddd",
            padding: 12,
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          }}
          placeholder="OCR 결과가 여기 표시돼"
        />
      </div>
    </div>
  );
}
