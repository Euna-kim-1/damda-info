import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";
import multer from "multer";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ limit: "10mb" }));
// app.use((req, res, next) => {
//     console.log("➡️", req.method, req.url);
//     next();
// });
// app.get("/health", (req, res) => {
//     res.json({ ok: true, time: new Date().toISOString() });
// });

const upload = multer({ storage: multer.memoryStorage() });

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

app.get("/stores", async (req, res) => {
    try {
        const { data, error } = await supabase
            .from("stores")
            .select("id, name")
            .order("name", { ascending: true });

        if (error) throw error;
        return res.json({ ok: true, stores: data });
    } catch (err) {
        console.error("GET /stores error:", err);
        return res.status(500).json({ ok: false, error: String(err?.message || err) });
    }
});


function normalizeName(name = "") {
    return name
        .toLowerCase()
        .trim()
        .replace(/[\u0000-\u001f]/g, "")
        .replace(/[^a-z0-9\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

/** ✅ OCR */
app.post("/ocr", upload.single("image"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No image file uploaded (field name: image)" });
        }
        if (!process.env.GOOGLE_VISION_API_KEY) {
            return res.status(500).json({ error: "Missing GOOGLE_VISION_API_KEY in .env" });
        }

        const imageBase64 = req.file.buffer.toString("base64");

        const response = await fetch(
            `https://vision.googleapis.com/v1/images:annotate?key=${process.env.GOOGLE_VISION_API_KEY}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    requests: [
                        {
                            image: { content: imageBase64 },
                            features: [{ type: "TEXT_DETECTION" }],
                        },
                    ],
                }),
            }
        );

        const data = await response.json();
        if (!response.ok) {
            return res.status(response.status).json({ error: "Vision API error", details: data });
        }

        const rawText =
            data?.responses?.[0]?.fullTextAnnotation?.text ||
            data?.responses?.[0]?.textAnnotations?.[0]?.description ||
            "";

        return res.json({ text: rawText, raw: data });
    } catch (err) {
        console.error("OCR server error:", err);
        return res.status(500).json({ error: "Vision API failed", message: String(err) });
    }
});

/** ✅ Upload(= Storage 업로드 + DB insert) */
app.post("/report", upload.single("image"), async (req, res) => {
    try {
        const bucket = process.env.SUPABASE_BUCKET || "damda-images";

        const { storeName, city, address, productName, price, unit, notes, reportedAt } = req.body;

        if (!req.file) return res.status(400).json({ error: "No image file uploaded (field name: image)" });
        if (!storeName?.trim()) return res.status(400).json({ error: "storeName is required" });
        if (!productName?.trim()) return res.status(400).json({ error: "productName is required" });
        if (!price) return res.status(400).json({ error: "price is required" });

        const normalized = normalizeName(productName);
        if (!normalized) return res.status(400).json({ error: "productName is invalid" });

        const priceNum = Number(String(price).replace("$", "").trim());
        if (!Number.isFinite(priceNum) || priceNum <= 0) {
            return res.status(400).json({ error: "price is invalid" });
        }

        // 1) store upsert (name+city 기준으로 중복 줄이기)
        //    (간단히: name+city가 같으면 같은 store로 가정)
        let storeId = null;
        {
            const q = supabase
                .from("stores")
                .select("id")
                .eq("name", storeName.trim())
                .limit(1);

            const { data: found, error: findErr } = await q;
            if (findErr) throw findErr;

            if (found?.[0]?.id) {
                storeId = found[0].id;
            } else {
                const { data: inserted, error: insErr } = await supabase
                    .from("stores")
                    .insert({
                        name: storeName.trim(),
                        city: city?.trim() || null,
                        address: address?.trim() || null,
                    })
                    .select("id")
                    .single();

                if (insErr) throw insErr;
                storeId = inserted.id;
            }
        }

        // 2) product upsert (normalized_name unique 전제)
        let productId = null;
        {
            const { data: up, error: upErr } = await supabase
                .from("products")
                .upsert(
                    {
                        name: productName.trim(),
                        normalized_name: normalized,
                    },
                    { onConflict: "normalized_name" }
                )
                .select("id")
                .single();

            if (upErr) throw upErr;
            productId = up.id;
        }

        // 3) storage upload
        const ext = (req.file.originalname.split(".").pop() || "jpg").toLowerCase();
        const filePath = `${storeId}/${productId}/${Date.now()}.${ext}`;

        const { error: upFileErr } = await supabase.storage
            .from(bucket)
            .upload(filePath, req.file.buffer, {
                contentType: req.file.mimetype,
                upsert: false,
            });
        if (upFileErr) throw upFileErr;

        // 4) price_reports insert
        const { data: report, error: repErr } = await supabase
            .from("price_reports")
            .insert({
                store_id: storeId,
                product_id: productId,
                price: priceNum,
                unit: unit?.trim() || null,
                notes: notes?.trim() || null,
                photo_path: filePath,
                reported_at: reportedAt ? new Date(reportedAt).toISOString() : new Date().toISOString(),
            })
            .select("*")
            .single();

        if (repErr) throw repErr;

        return res.json({ ok: true, report });
    } catch (err) {
        console.error("REPORT server error:", err);
        return res.status(500).json({ ok: false, error: String(err?.message || err), raw: err });
    }
});

app.listen(port, "0.0.0.0", () => {
    console.log(`API running on http://localhost:${port}`);
});
