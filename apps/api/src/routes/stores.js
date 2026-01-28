import express from "express";
import { supabase } from "../lib/supabase.js";

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const { data, error } = await supabase
            .from("stores")
            .select("id, name, city, address, lat, lng, phone, operation_time, note, is_active")
            .eq("is_active", true)
            .order("name", { ascending: true });

        if (error) throw error;
        return res.json({ ok: true, stores: data });
    } catch (err) {
        console.error("GET /stores error:", err);
        return res.status(500).json({ ok: false, error: String(err?.message || err) });
    }
});

export default router;
