import express from "express";
import { supabase } from "../lib/supabase.js";

const router = express.Router();

/**
 * GET /lists?device_id=...
 */
router.get("/", async (req, res) => {
    try {
        const deviceId = req.query.device_id;
        if (!deviceId) return res.status(400).json({ error: "device_id is required" });

        const { data, error } = await supabase
            .from("shopping_lists")
            .select("id, title, created_at, updated_at")
            .eq("device_id", deviceId)
            .order("created_at", { ascending: false });

        if (error) throw error;
        res.json({ ok: true, lists: data });
    } catch (err) {
        console.error("GET /lists error:", err);
        res.status(500).json({ ok: false, error: String(err?.message || err) });
    }
});

/**
 * POST /lists  { device_id, title }
 */
router.post("/", async (req, res) => {
    try {
        const { device_id, title } = req.body || {};
        if (!device_id) return res.status(400).json({ error: "device_id is required" });
        if (!title?.trim()) return res.status(400).json({ error: "title is required" });

        const { data, error } = await supabase
            .from("shopping_lists")
            .insert({
                device_id,
                title: title.trim(),
                updated_at: new Date().toISOString(),
            })
            .select("id, title, created_at, updated_at")
            .single();

        if (error) throw error;
        res.status(201).json({ ok: true, list: data });
    } catch (err) {
        console.error("POST /lists error:", err);
        res.status(500).json({ ok: false, error: String(err?.message || err) });
    }
});

/**
 * GET /lists/:listId/items?device_id=...
 */
router.get("/:listId/items", async (req, res) => {
    try {
        const { listId } = req.params;
        const deviceId = req.query.device_id;
        if (!deviceId) return res.status(400).json({ error: "device_id is required" });

        const { data, error } = await supabase
            .from("shopping_list_items")
            .select("id, list_id, name, checked, note, created_at, updated_at")
            .eq("list_id", listId)
            .eq("device_id", deviceId)
            .order("created_at", { ascending: true });

        if (error) throw error;
        res.json({ ok: true, items: data });
    } catch (err) {
        console.error("GET /lists/:listId/items error:", err);
        res.status(500).json({ ok: false, error: String(err?.message || err) });
    }
});

/**
 * POST /lists/:listId/items  { device_id, name, note? }
 */
router.post("/:listId/items", async (req, res) => {
    try {
        const { listId } = req.params;
        const { device_id, name, note } = req.body || {};
        if (!device_id) return res.status(400).json({ error: "device_id is required" });
        if (!name?.trim()) return res.status(400).json({ error: "name is required" });

        const { data, error } = await supabase
            .from("shopping_list_items")
            .insert({
                list_id: listId,
                device_id,
                name: name.trim(),
                note: note?.trim() || null,
                checked: false,
                updated_at: new Date().toISOString(),
            })
            .select("id, list_id, device_id, name, checked, note, created_at, updated_at")
            .single();

        if (error) throw error;
        res.status(201).json({ ok: true, item: data });
    } catch (err) {
        console.error("POST /lists/:listId/items error:", err);
        res.status(500).json({ ok: false, error: String(err?.message || err) });
    }
});

export default router;
