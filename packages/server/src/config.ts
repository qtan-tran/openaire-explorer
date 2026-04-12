import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  PORT: z
    .string()
    .default("3001")
    .transform((v) => parseInt(v, 10))
    .pipe(z.number().min(1).max(65535)),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  OPENAIRE_BASE_URL: z
    .string()
    .url()
    .default("https://api.openaire.eu/graph"),
  /** Cache TTL in seconds */
  CACHE_TTL: z
    .string()
    .default("300")
    .transform((v) => parseInt(v, 10))
    .pipe(z.number().min(0)),
});

function parseEnv() {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error("Invalid environment variables:");
    console.error(result.error.flatten().fieldErrors);
    process.exit(1);
  }
  return result.data;
}

export const config = parseEnv();
export type Config = typeof config;
