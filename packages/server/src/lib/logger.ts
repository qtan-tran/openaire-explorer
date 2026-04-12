import pino from "pino";

const isDev =
  process.env["NODE_ENV"] !== "production" &&
  process.env["NODE_ENV"] !== "test";

export const logger = pino(
  {
    level: process.env["LOG_LEVEL"] ?? (isDev ? "debug" : "info"),
    redact: ["req.headers.authorization"],
  },
  isDev
    ? pino.transport({
        target: "pino-pretty",
        options: { colorize: true, translateTime: "HH:MM:ss" },
      })
    : undefined
);
