# OpenAIRE Graph API — Reconnaissance Findings

Probed: 2026-04-12  
Endpoints tested: v1 (orgs, projects, dataSources) and v2 (researchProducts)  
Samples: `api-recon/samples/`

---

## 1. Pagination — Two Distinct Modes

The API supports **offset pagination** and **cursor pagination**. They produce different header shapes:

### Offset mode (default)
```json
{ "numFound": 1825741, "maxScore": 4.88, "queryTime": 112, "page": 1, "pageSize": 2 }
```
Parameters: `page` (1-based) + `pageSize` (1–100). Max retrievable records: **10,000**.

### Cursor mode (`cursor=*`)
```json
{ "numFound": 1825742, "maxScore": 4.88, "queryTime": 124, "pageSize": 2,
  "nextCursor": "AoM/Dz..." }
```
- Pass `cursor=*` to start, then feed the returned `nextCursor` value into the next request.
- `page` field is **absent** in cursor responses.
- `nextCursor` is a **base64-encoded** opaque string (contains binary data; do not parse).
- Use cursor mode to page beyond 10,000 records.

---

## 2. Rate Limiting

- Headers observed on every response:
  - `x-ratelimit-limit: 7199`
  - `x-ratelimit-used: <n>` (increments per request)
- No `Retry-After` header seen.
- Limit appears to be **7,199 requests per rolling window** (likely per hour; window duration not confirmed by headers).
- No authentication was used; higher limits may be available with an API key.

---

## 3. Open Access Fields on ResearchProduct

Three distinct OA-related fields exist:

| Field | Type | Where | Observed values |
|---|---|---|---|
| `openAccessColor` | `string \| null` | top-level | `"gold"`, `null` (not seen: `"green"`, `"bronze"`, `"hybrid"` — but documented) |
| `isGreen` | `boolean` | top-level | `true`, `false` — always present, never null |
| `isInDiamondJournal` | `boolean` | top-level | `true`, `false` — always present, never null |
| `bestAccessRight` | `object \| null` | top-level | `{ code, label, scheme }` — null in some records |
| `instances[].accessRight.openAccessRoute` | `string \| null` | per-instance | `"gold"`, `null` |

`openAccessColor` at the top level is the API-filtered field (used in the `openAccessColor=gold` query param). It can be `null` even when `bestAccessRight.label` is `"OPEN"`.

---

## 4. `bestAccessRight` Uses COAR Vocabulary

```json
{
  "code": "c_abf2",
  "label": "OPEN",
  "scheme": "http://vocabularies.coar-repositories.org/documentation/access_rights/"
}
```
- `label` is a human-readable string, not a controlled enum.
- `scheme` is the COAR access rights vocabulary URI.

---

## 5. `instances` Array — Most Detailed OA Data

Each `Instance` represents one copy/version of the product in a repository:
- `accessRight.openAccessRoute`: the gold/green/hybrid/bronze route for that specific copy.
- `refereed`: `"peerReviewed"` | `"nonPeerReviewed"` | absent.
- `license`: free-text, e.g. `"CC BY"` — **not** a SPDX identifier.
- `alternateIdentifiers`: appears instead of `pids` in some instances (schema is inconsistent across instances in the same record).
- A single ResearchProduct can have multiple instances from different sources (Crossref, BASE, UnpayWall, repository OAI-PMH).

---

## 6. ID Prefixes Encode the Source

The `id` field uses a structured prefix pattern:

| Prefix | Source |
|---|---|
| `doi_________::` | DOI-based deduplication |
| `doi_dedup___::` | DOI deduplication (merged) |
| `openorgs____::` | Verified OpenAIRE organization |
| `pending_org_::` | Organization not yet fully curated |
| `corda_____he::` | European Commission / Horizon Europe CORDIS |
| `ukri________::` | UK Research and Innovation |
| `opendoar____::` | OpenDOAR registry (data sources) |
| `dris___01177::` | DRIS (institutional CRIS system) |

---

## 7. Organizations — Two Quality Tiers

- `openorgs____::` prefix: full PIDs array (ROR, GRID, ISNI, FundRef, OrgRef, Wikidata, PIC, mag_id…).
- `pending_org_::` prefix: `pids: null`, minimal metadata.

When organizations appear **embedded inside ResearchProduct**, they only carry:
`legalName`, `acronym`, `id`, `pids[]` — not the full Organization object.

---

## 8. Subjects — Heterogeneous Schemes

`subjects` is an array of `{ subject: { scheme, value }, provenance }`:
- `scheme` values observed: `"SDG"`, `"FOS"` (Fields of Science), `"keyword"`.
- `value` for SDG: `"3. Good health"`, `"13. Climate action"` (full goal text).
- `value` for FOS: e.g. `"01 natural sciences"`, `"03 medical and health sciences"`.
- `provenance` is usually `null` in the samples.

---

## 9. Frequently Null / Missing Fields

The following fields were `null` in the majority of observed records:

- `ResearchProduct`: `countries`, `subTitle`, `publisher`, `embargoEndDate`, `sources`, `formats`, `contributors`, `coverages`, `documentationUrls`, `codeRepositoryUrl`, `programmingLanguage`, `contactPeople`, `contactGroups`, `tools`, `size`, `version`, `geoLocations`, `dateOfCollection`, `lastUpdateTimeStamp`, `projects`
- `Organization`: `pids` (pending orgs), `alternativeNames`, `websiteUrl`
- `Project`: `acronym`, `callIdentifier`, `keywords`, `h2020Programmes`
- `DataSource`: `subjects`, `languages`, `contentTypes`, `releaseStartDate`, `releaseEndDate`, `missionStatementUrl`, `accessRights`, `uploadRights`, `databaseAccessRestriction`, `dataUploadRestriction`, `pidSystems`, `certificates`, `policies`, `journal`

**Design implication**: treat virtually every optional field as potentially null; do not assume presence.

---

## 10. Citation Impact Classes

`indicators.citationImpact` contains both raw metrics and binned classes:
```json
{
  "citationCount": 5.0,
  "influence": 2.83e-9,
  "popularity": 5.98e-9,
  "impulse": 5.0,
  "citationClass": "C5",
  "influenceClass": "C5",
  "impulseClass": "C4",
  "popularityClass": "C4"
}
```
- Classes range `C1`–`C5` (C1 = top, C5 = bottom percentile).
- Raw values (`influence`, `popularity`) are very small floats — likely normalized percentile scores.
- `indicators` itself can be `null` (not seen in samples but documented as optional).

---

## 11. Projects — Fundings vs. Single Funder

- `fundings` is an **array**, not a single `funder` object.
- Each funding entry has its own `jurisdiction` (country code or `"EU"`).
- `granted.totalCost` can be `0.0` even when `fundedAmount` is nonzero (UK Horizon Guarantee example).
- `openAccessMandateForPublications` / `openAccessMandateForDataset` are always booleans.

---

## 12. `collectedFrom` vs `sources`

Two provenance mechanisms exist on ResearchProduct:
- `collectedFrom`: structured array of `{ key, value }` pointing to harvester/aggregator.
- `sources`: unstructured string array (e.g. `["Crossref"]`) — present in some records, null in others.

Use `collectedFrom` for reliable provenance; `sources` is inconsistent.

---

## 13. DataSource `openaireCompatibility` is a Free String

```
"Not yet registered"
"OpenAIRE Data (funded, referenced datasets)"
```
Not an enum — treat as an informational label, not a reliable filter key.

---

## 14. v1 vs v2 Endpoints

- `researchProducts` is at **v2**; organizations, projects, dataSources are at **v1**.
- Response envelope shape (`header` + `results`) is consistent across all versions.
- A v3 OpenAPI spec (`/graph/v3/api-docs`) exists — the Swagger UI may not yet reflect all v3 changes.

---

## 15. No Relation/Link Fields in Standard Responses

- ResearchProduct embeds `organizations[]` and `projects[]` (lightweight refs), but there is no top-level `relations` or `links` array in the standard endpoints.
- A separate **Scholix endpoint** (`/v1/researchProducts/links`) exists for literature↔dataset relationships.
- Community membership is surfaced as `communities[]` on ResearchProduct (code + label).
