import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("API root is working");
});

app.get("/health", (req, res) => {
    res.json({ ok: true });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`API listening on http://localhost:${PORT}`);
});
