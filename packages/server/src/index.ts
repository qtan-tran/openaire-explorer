import express from "express";
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import { config } from "./config.js";
import { logger } from "./lib/logger.js";
import { getOpenAIREClient } from "./lib/openaire-client.js";
import { searchRouter } from "./routes/search.routes.js";
import { healthRouter } from "./routes/health.routes.js";
import { compareRouter } from "./routes/compare.routes.js";
import { errorHandler } from "./middleware/error-handler.js";

// ─── Initialise shared client ─────────────────────────────────────────────────

getOpenAIREClient({
  baseUrl: config.OPENAIRE_BASE_URL,
  cacheTtl: config.CACHE_TTL,
});

export const app = express();

// ─── Security & parsing ───────────────────────────────────────────────────────

app.use(helmet());
app.use(
  cors({
    origin:
      config.NODE_ENV === "production"
        ? ["https://openaire-explorer.example.com"]
        : ["http://localhost:5173", "http://localhost:3000"],
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);
app.use(express.json({ limit: "1mb" }));

// ─── Request logging ──────────────────────────────────────────────────────────

app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    logger.info(
      {
        method: req.method,
        url: req.url,
        status: res.statusCode,
        duration: Date.now() - start,
      },
      "request"
    );
  });
  next();
});

// ─── Rate limiting ────────────────────────────────────────────────────────────

app.use(
  "/api/",
  rateLimit({
    windowMs: 60_000,
    max: 120,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests, please slow down." },
  })
);

// ─── Routes ───────────────────────────────────────────────────────────────────

app.use("/api/health", healthRouter);
app.use("/api/search", searchRouter);
app.use("/api/compare", compareRouter);

// ─── 404 ──────────────────────────────────────────────────────────────────────

app.use((_req, res) => {
  res.status(404).json({ error: "Not found", code: "NOT_FOUND" });
});

// ─── Global error handler ─────────────────────────────────────────────────────

app.use(errorHandler);

// ─── Start ────────────────────────────────────────────────────────────────────

if (process.env["VITEST"] === undefined) {
  app.listen(config.PORT, () => {
    logger.info(`Server listening on http://localhost:${config.PORT}`);
  });
}
