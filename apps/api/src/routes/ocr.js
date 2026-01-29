import express from "express";
import fetch from "node-fetch";
import multer from "multer";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/", upload.single("image"), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "No image file uploaded (field name: image)" });
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
                    requests: [{ image: { content: imageBase64 }, features: [{ type: "TEXT_DETECTION" }] }],
                }),
            }
        );

        const data = await response.json();
        if (!response.ok) return res.status(response.status).json({ error: "Vision API error", details: data });

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

export default router;
