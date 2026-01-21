import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";
import multer from "multer";

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

// ✅ 같은 와이파이 폰 테스트까지 고려: 일단 전체 허용(나중에 도메인 제한 가능)
app.use(cors());

// ✅ JSON도 받을 수 있게는 두되(다른 라우트용), 이번 OCR은 multer가 처리
app.use(express.json({ limit: "10mb" }));

// ✅ 파일 업로드를 메모리에 올림
const upload = multer({ storage: multer.memoryStorage() });

/**
 * 프론트에서 FormData로 "image" 필드에 파일을 보냄
 * => 여기서 req.file 로 받음
 */
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

        // ✅ Vision 에러를 프론트가 보기 쉽게 그대로 내려줌
        if (!response.ok) {
            return res.status(response.status).json({
                error: "Vision API error",
                details: data,
            });
        }

        // ✅ 우리가 원하는 건 "텍스트"만
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

// ✅ 폰에서 접속하려면 0.0.0.0 필수
app.listen(port, "0.0.0.0", () => {
    console.log(`API running on http://localhost:${port}`);
});
