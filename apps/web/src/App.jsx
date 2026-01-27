import { useEffect, useMemo, useState } from "react";

/** ✅ 가격: 가장 그럴듯한 1개 */
function extractBestPrice(raw) {
  const lines = raw.split("\n").map((l) => l.trim()).filter(Boolean);
  const candidates = [];

  for (const line of lines) {
    const matches = [
      ...line.matchAll(
        /(\$?\s*\d{1,3}(?:[,\s]\d{3})*(?:\.\d{2})|\$?\s*\d+\.\d{2})/g
      ),
    ];
    for (const m of matches) candidates.push({ token: m[1].replace(/\s/g, ""), line });
  }

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

function extractNameCandidates(raw, bestPrice) {
  const lines = raw.split("\n").map((l) => l.trim()).filter(Boolean);

  const priceNeedle = (bestPrice || "").replace(/\s/g, "").replace("$", "");
  let priceIdx = -1;
  if (priceNeedle) {
    priceIdx = lines.findIndex((l) => l.replace(/\s/g, "").replace("$", "").includes(priceNeedle));
  }

  const start = Math.max(0, priceIdx >= 0 ? priceIdx - 6 : lines.length - 10);
  const end = Math.min(lines.length, priceIdx >= 0 ? priceIdx + 2 : lines.length);
  const near = lines.slice(start, end);

  const bad =
    /(nutrition|ingredients|saturated|trans|cholesterol|sodium|recycle|refund|apply|where|consignee|not a significant|daily value|calories|protein|carb|fat|vitamin|keep out|warning)/i;

  const candidates = near
    .filter((l) => !bad.test(l))
    .filter((l) => !/\d/.test(l))
    .filter((l) => !/[{}[\]<>]/.test(l))
    .filter((l) => l.length >= 2 && l.length <= 35)
    .map((l) => l.replace(/\s{2,}/g, " ").trim());

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

export default function App() {
  const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

  const [pickedFile, setPickedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [ocrText, setOcrText] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ stores dropdown용
  const [stores, setStores] = useState([]);
  const [storesLoading, setStoresLoading] = useState(false);

  const [price, setPrice] = useState("");
  const [nameCandidates, setNameCandidates] = useState([]);
  const [selectedName, setSelectedName] = useState("");
  const [manualName, setManualName] = useState("");

  // ✅ 저장용 입력(최소)
  const [storeName, setStoreName] = useState(""); // <- 초기값은 빈값
  const [unit, setUnit] = useState("");
  const [notes, setNotes] = useState("");

  const [saveLoading, setSaveLoading] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  // ✅ mount 시 stores 가져오기
  useEffect(() => {
    (async () => {
      setStoresLoading(true);
      try {
        const r = await fetch(`${API_BASE}/stores`);
        const data = await r.json();
        if (!r.ok) throw new Error(JSON.stringify(data));

        const list = data.stores || [];
        setStores(list);

        if (!list.some((s) => s.name === storeName)) {
          setStoreName(list[0]?.name || "");
        }
      } catch (e) {
        console.error("stores fetch failed:", e);

        const fallback = [
          { id: "hmart", name: "H-mart" },
          { id: "emart", name: "E-mart" },
          { id: "amart", name: "Amart" },
        ];
        setStores(fallback);
        setStoreName((prev) => (fallback.some((s) => s.name === prev) ? prev : fallback[0].name));
      } finally {
        setStoresLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const finalName = manualName.trim() ? manualName.trim() : selectedName;

  const canUpload =
    !!pickedFile &&
    !!price &&
    !!finalName &&
    !!storeName.trim() &&
    !saveLoading;

  const helperText = useMemo(() => {
    return `- OCR: ${API_BASE}/ocr\n- SAVE: ${API_BASE}/report\n- 흐름: 사진 업로드(자동 OCR) → 상품명 선택/수정 → Upload`;
  }, [API_BASE]);

  // ✅ OCR: file을 직접 받아서 실행 (pickedFile state 의존 X)
  const runOcrWithFile = async (file) => {
    if (!file) return;
    setLoading(true);
    setSaveMsg("");

    try {
      const form = new FormData();
      form.append("image", file);

      const r = await fetch(`${API_BASE}/ocr`, { method: "POST", body: form });
      const data = await r.json();
      if (!r.ok) throw new Error(JSON.stringify(data));

      const raw = data.text || "";
      setOcrText(raw);

      const p = extractBestPrice(raw);
      setPrice(p);

      const cands = extractNameCandidates(raw, p);
      setNameCandidates(cands);
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

  // ✅ 사진 선택하면 바로 자동 OCR
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
    setSaveMsg("");

    // ✅ 자동 OCR
    runOcrWithFile(file);

    // 같은 파일 다시 선택할 때 onChange 안뜨는 경우 방지
    e.target.value = "";
  };

  const uploadReport = async () => {
    if (!canUpload) return;
    setSaveLoading(true);
    setSaveMsg("");

    try {
      const form = new FormData();
      form.append("image", pickedFile);

      // ✅ DB에 저장할 값들
      form.append("storeName", storeName.trim());
      form.append("productName", finalName.trim());
      form.append("price", price);
      if (unit.trim()) form.append("unit", unit.trim());
      if (notes.trim()) form.append("notes", notes.trim());

      const r = await fetch(`${API_BASE}/report`, {
        method: "POST",
        body: form,
      });

      const data = await r.json();
      if (!r.ok) throw new Error(JSON.stringify(data));

      setSaveMsg("✅ 업로드 완료! (Storage + DB 저장됨)");
    } catch (e) {
      console.error(e);
      setSaveMsg("❌ 업로드 실패. 백엔드 콘솔/Network 확인해줘.");
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: 16 }}>
      <h2>Damda OCR → Upload (Supabase)</h2>
      <p style={{ whiteSpace: "pre-wrap", color: "#666" }}>{helperText}</p>

      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <input type="file" accept="image/*" capture="environment" onChange={onPick} />
        {/* OCR 버튼 제거: 사진 업로드 시 자동 실행 */}
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
            <b>OCR 상태:</b> {loading ? "OCR 중..." : "(완료/대기)"}
          </div>

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

          <div style={{ marginBottom: 10 }}>
            <b>최종 상품명:</b> {finalName || "(없음)"}
          </div>

          <hr style={{ border: "none", borderTop: "1px solid #e5e5e5", margin: "14px 0" }} />

          {/* ✅ 저장에 필요한 최소 입력 */}
          <div style={{ display: "grid", gap: 10 }}>
            <div>
              <b>Store</b>
              <select
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                disabled={storesLoading || stores.length === 0}
                style={{
                  width: "100%",
                  marginTop: 6,
                  padding: 10,
                  borderRadius: 10,
                  border: "1px solid #ccc",
                  background: "#fff",
                }}
              >
                {storesLoading ? (
                  <option value="">Loading...</option>
                ) : (
                  stores.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <b>Unit (선택)</b>
              <input
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                style={{ width: "100%", marginTop: 6, padding: 10, borderRadius: 10, border: "1px solid #ccc" }}
                placeholder="예: 1kg / 945 mL"
              />
            </div>

            <div>
              <b>Notes (선택)</b>
              <input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                style={{ width: "100%", marginTop: 6, padding: 10, borderRadius: 10, border: "1px solid #ccc" }}
                placeholder="예: on sale, member price..."
              />
            </div>

            <button
              disabled={!canUpload || loading} // OCR 중에는 업로드 막기(추천)
              onClick={uploadReport}
              style={{
                padding: "12px 14px",
                borderRadius: 12,
                border: "1px solid #000",
                background: canUpload && !loading ? "#000" : "#aaa",
                color: "#fff",
                cursor: canUpload && !loading ? "pointer" : "not-allowed",
                fontWeight: 700,
              }}
            >
              {saveLoading ? "업로드 중..." : "Upload (Supabase 저장)"}
            </button>

            {saveMsg && <div style={{ fontWeight: 700 }}>{saveMsg}</div>}
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
