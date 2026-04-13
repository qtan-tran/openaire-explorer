import { Router } from "express";
import { config } from "../config.js";
import { getOpenAIREClient } from "../lib/openaire-client.js";
import { logger } from "../lib/logger.js";

export const healthRouter = Router();

healthRouter.get("/", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    env: config.NODE_ENV,
  });
});

healthRouter.get("/ready", async (_req, res) => {
  try {
    const client = getOpenAIREClient();
    // Ping with minimal query — just need a successful response
    await client.searchResearchProducts({ pageSize: 1 });
    res.json({ status: "ready", timestamp: new Date().toISOString() });
  } catch (err) {
    logger.warn({ err }, "Health readiness check failed");
    res.status(503).json({
      status: "degraded",
      timestamp: new Date().toISOString(),
      details: err instanceof Error ? err.message : "Unknown error",
    });
  }
});
