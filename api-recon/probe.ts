/**
 * OpenAIRE Graph API Reconnaissance Probe
 * Run with: npx tsx api-recon/probe.ts
 */
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const BASE = "https://api.openaire.eu/graph";
const SAMPLES_DIR = join(import.meta.dirname ?? "api-recon", "samples");

mkdirSync(SAMPLES_DIR, { recursive: true });

async function fetchAndSave(
  label: string,
  url: string,
  filename: string
): Promise<unknown> {
  console.log(`\nFetching [${label}]`);
  console.log(`  GET ${url}`);

  const res = await fetch(url);

  console.log(`  Status: ${res.status}`);
  console.log(`  x-ratelimit-limit : ${res.headers.get("x-ratelimit-limit")}`);
  console.log(`  x-ratelimit-used  : ${res.headers.get("x-ratelimit-used")}`);
  console.log(`  content-type      : ${res.headers.get("content-type")}`);

  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);

  const json = await res.json();
  const outPath = join(SAMPLES_DIR, filename);
  writeFileSync(outPath, JSON.stringify(json, null, 2));
  console.log(`  Saved → ${outPath}`);

  const header = (json as Record<string, unknown>).header as
    | Record<string, unknown>
    | undefined;
  if (header) {
    console.log(`  numFound  : ${header.numFound}`);
    console.log(`  queryTime : ${header.queryTime}ms`);
    console.log(`  nextCursor: ${header.nextCursor ?? "(none — offset mode)"}`);
  }

  return json;
}

const probes: Array<[string, string, string]> = [
  [
    "ResearchProducts – climate",
    `${BASE}/v2/researchProducts?search=climate&pageSize=2`,
    "climate.json",
  ],
  [
    "Organizations – CERN",
    `${BASE}/v1/organizations?search=CERN&pageSize=2`,
    "cern-organizations.json",
  ],
  [
    "Projects – horizon",
    `${BASE}/v1/projects?search=horizon&pageSize=2`,
    "horizon-projects.json",
  ],
  [
    "ResearchProducts – covid/gold OA",
    `${BASE}/v2/researchProducts?search=covid&openAccessColor=gold&pageSize=2`,
    "covid-gold.json",
  ],
];

for (const [label, url, file] of probes) {
  await fetchAndSave(label, url, file);
}

// Demonstrate cursor pagination
console.log("\n--- Cursor Pagination Demo ---");
const cursorUrl = `${BASE}/v2/researchProducts?search=climate&pageSize=2&cursor=*`;
const cursorRes = await fetch(cursorUrl);
const cursorData = (await cursorRes.json()) as {
  header: Record<string, unknown>;
};
console.log("cursor=* header:", JSON.stringify(cursorData.header, null, 2));

console.log("\nDone. All samples saved to api-recon/samples/");
