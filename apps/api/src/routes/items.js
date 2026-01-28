import express from "express";
import { supabase } from "../lib/supabase.js";

const router = express.Router();

/**
 * PATCH /items/:itemId  { device_id, checked?, name?, note? }
 */
router.patch("/:itemId", async (req, res) => {
    try {
        const { itemId } = req.params;
        const { device_id, ...patch } = req.body || {};
        if (!device_id) return res.status(400).json({ error: "device_id is required" });

        // 허용 필드만 업데이트
        const update = {};
        if (typeof patch.checked === "boolean") update.checked = patch.checked;
        if (typeof patch.name === "string") update.name = patch.name.trim();
        if (typeof patch.note === "string") update.note = patch.note.trim();
        update.updated_at = new Date().toISOString();

        const { data, error } = await supabase
            .from("shopping_list_items")
            .update(update)
            .eq("id", itemId)
            .eq("device_id", device_id)
            .select("id, list_id, device_id, name, checked, note, created_at, updated_at")
            .single();

        if (error) throw error;
        res.json({ ok: true, item: data });
    } catch (err) {
        console.error("PATCH /items/:itemId error:", err);
        res.status(500).json({ ok: false, error: String(err?.message || err) });
    }
});

export default router;
