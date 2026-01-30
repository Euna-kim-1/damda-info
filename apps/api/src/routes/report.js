import express from "express";
import multer from "multer";
import { supabase } from "../lib/supabase.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

function normalizeName(name = "") {
    return name
        .toLowerCase()
        .trim()
        .replace(/[\u0000-\u001f]/g, "")
        .replace(/[^a-z0-9\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

router.get("/", async (req, res) => {
    try {
        const bucket = process.env.SUPABASE_BUCKET || "damda-images";
        const limit = Math.min(Number(req.query.limit || 10), 50);

        // price_reports + join (products, stores)
        const { data, error } = await supabase
            .from("price_reports")
            .select(`
          id,
          price,
          unit,
          notes,
          photo_path,
          reported_at,
          products:product_id ( id, name ),
          stores:store_id ( id, name )
        `)
            .order("reported_at", { ascending: false })
            .limit(limit);

        if (error) throw error;

        // photo_path -> public URL로 변환
        const reports = (data || []).map((r) => {
            const { data: pub } = supabase.storage.from(bucket).getPublicUrl(r.photo_path);

            return {
                id: r.id,
                price: r.price,
                unit: r.unit,
                notes: r.notes,
                reported_at: r.reported_at,
                product_name: r.products?.name ?? null,
                store_name: r.stores?.name ?? null,
                image_url: pub?.publicUrl ?? null,
            };
        });

        return res.json({ ok: true, reports });
    } catch (err) {
        console.error("REPORT GET error:", err);
        return res.status(500).json({ ok: false, error: String(err?.message || err) });
    }
});


router.post("/", upload.single("image"), async (req, res) => {
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

        // 1) store upsert (name 기준)
        let storeId = null;
        {
            const { data: found, error: findErr } = await supabase
                .from("stores")
                .select("id")
                .eq("name", storeName.trim())
                .limit(1);

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

        // 2) product upsert
        let productId = null;
        {
            const { data: up, error: upErr } = await supabase
                .from("products")
                .upsert(
                    { name: productName.trim(), normalized_name: normalized },
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

export default router;
