import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import storesRouter from "./routes/stores.js";
import ocrRouter from "./routes/ocr.js";
import reportRouter from "./routes/report.js";
import listsRouter from "./routes/lists.js";
import itemsRouter from "./routes/items.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.use("/stores", storesRouter);
app.use("/ocr", ocrRouter);
app.use("/report", reportRouter);
app.use("/lists", listsRouter);
app.use("/items", itemsRouter);

app.listen(port, "0.0.0.0", () => {
    console.log(`API running on http://localhost:${port}`);
});
