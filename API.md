# API Reference

Base URL (development): `http://localhost:3001`

All endpoints return JSON. Errors follow a consistent shape (see [Error Responses](#error-responses)).

---

## Search Endpoints

### Search Research Products

```
GET /api/search/research-products
```

**Query Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `search` | `string` | No | Full-text search query |
| `type` | `"publication" \| "dataset" \| "software" \| "other"` | No | Filter by product type |
| `fromYear` | `number` | No | Publication date lower bound (year) |
| `toYear` | `number` | No | Publication date upper bound (year) |
| `oaStatus` | `string` | No | `bestOpenAccessRightLabel` filter |
| `openAccessColor` | `"gold" \| "green" \| "hybrid" \| "bronze"` | No | OA colour filter |
| `organizationId` | `string` | No | Filter by related organisation ID |
| `projectId` | `string` | No | Filter by related project ID |
| `funderShortName` | `string` | No | Filter by funder short name (e.g. `"EC"`) |
| `page` | `number` | No | Page number, default `1` |
| `pageSize` | `number` | No | Results per page, default `10` |
| `sortBy` | `string` | No | Sort field passed to OpenAIRE |

**Response**

```json
{
  "data": [
    {
      "id": "doi_dedup__::abc123",
      "mainTitle": "Climate change impacts on biodiversity",
      "type": "publication",
      "publicationDate": "2023-05-01",
      "bestOpenAccessRightLabel": "Open Access",
      "openAccessColor": "gold",
      "authors": [{ "fullName": "Jane Smith", "rank": 1 }],
      "projects": [{ "id": "corda__h2020::xyz", "title": "BiodivNet" }],
      "organizations": [{ "id": "openorgs____::aaa", "legalName": "CNRS" }],
      "citationCount": 42
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 10,
    "totalResults": 1283,
    "totalPages": 129
  }
}
```

**Example**

```bash
curl "http://localhost:3001/api/search/research-products?search=climate+change&type=publication&fromYear=2020&openAccessColor=gold&page=1&pageSize=5"
```

---

### Search Organisations

```
GET /api/search/organizations
```

**Query Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `search` | `string` | No | Full-text search query |
| `countryCode` | `string` | No | ISO 3166-1 alpha-2 country code (e.g. `"DE"`) |
| `page` | `number` | No | Page number, default `1` |
| `pageSize` | `number` | No | Results per page, default `10` |

**Response**

```json
{
  "data": [
    {
      "id": "openorgs____::aaa111",
      "legalName": "Max Planck Society",
      "alternativeNames": ["MPG"],
      "country": { "code": "DE", "label": "Germany" },
      "websiteUrl": "https://www.mpg.de"
    }
  ],
  "meta": { "page": 1, "pageSize": 10, "totalResults": 3, "totalPages": 1 }
}
```

**Example**

```bash
curl "http://localhost:3001/api/search/organizations?search=max+planck&countryCode=DE"
```

---

### Search Projects

```
GET /api/search/projects
```

**Query Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `search` | `string` | No | Full-text search query |
| `funderShortName` | `string` | No | Funder short name (e.g. `"EC"`, `"NSF"`) |
| `fromStartDate` | `string` | No | Project start date lower bound (`YYYY-MM-DD`) |
| `toStartDate` | `string` | No | Project start date upper bound (`YYYY-MM-DD`) |
| `page` | `number` | No | Page number, default `1` |
| `pageSize` | `number` | No | Results per page, default `10` |
| `sortBy` | `string` | No | Sort field passed to OpenAIRE |

**Response**

```json
{
  "data": [
    {
      "id": "corda__h2020::abc",
      "title": "BiodivNet — Biodiversity Network",
      "acronym": "BiodivNet",
      "startDate": "2020-01-01",
      "endDate": "2024-12-31",
      "funders": [{ "shortName": "EC", "name": "European Commission" }],
      "oaMandateForPublications": true
    }
  ],
  "meta": { "page": 1, "pageSize": 10, "totalResults": 57, "totalPages": 6 }
}
```

**Example**

```bash
curl "http://localhost:3001/api/search/projects?search=biodiversity&funderShortName=EC&fromStartDate=2019-01-01"
```

---

## Detail Endpoints

### Get Research Product

```
GET /api/search/research-products/:id
```

Returns the full record for a single research product.

```bash
curl "http://localhost:3001/api/search/research-products/doi_dedup__::abc123"
```

**Response**: `{ "data": { ...ResearchProduct } }`

---

### Get Related Research Products

```
GET /api/search/research-products/:id/related
```

**Query Parameters**: `page` (default `1`), `pageSize` (default `6`, max `20`)

Returns products related via the same project or organisation as the given product.

```bash
curl "http://localhost:3001/api/search/research-products/doi_dedup__::abc123/related?pageSize=6"
```

---

### Get Organisation

```
GET /api/search/organizations/:id
```

```bash
curl "http://localhost:3001/api/search/organizations/openorgs____::aaa111"
```

**Response**: `{ "data": { ...Organization } }`

---

### Get Organisation's Products

```
GET /api/search/organizations/:id/products
```

**Query Parameters**: `page` (default `1`), `pageSize` (default `10`, max `50`)

```bash
curl "http://localhost:3001/api/search/organizations/openorgs____::aaa111/products?pageSize=20"
```

---

### Get Project

```
GET /api/search/projects/:id
```

```bash
curl "http://localhost:3001/api/search/projects/corda__h2020::abc"
```

**Response**: `{ "data": { ...Project } }`

---

### Get Project's Products

```
GET /api/search/projects/:id/products
```

**Query Parameters**: `page` (default `1`), `pageSize` (default `10`, max `50`)

```bash
curl "http://localhost:3001/api/search/projects/corda__h2020::abc/products"
```

---

## Compare Endpoint

### Compare Entities

```
POST /api/compare
Content-Type: application/json
```

Compares 1–5 entities of any type. For organisations and projects the server fetches up to 500 related research products via cursor pagination to compute metrics.

**Request Body**

```json
{
  "entities": [
    { "id": "openorgs____::aaa111", "type": "organization" },
    { "id": "openorgs____::bbb222", "type": "organization" }
  ],
  "filters": {
    "fromYear": 2018,
    "toYear": 2023
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `entities` | `Array<{id: string, type: "research-product"\|"organization"\|"project"}>` | Yes | 1–5 entities to compare |
| `filters.fromYear` | `number` | No | Lower year bound for product collection |
| `filters.toYear` | `number` | No | Upper year bound for product collection |

**Response**

```json
{
  "entities": [
    { "id": "openorgs____::aaa111", "type": "organization", "name": "Max Planck Society" },
    { "id": "openorgs____::bbb222", "type": "organization", "name": "Helmholtz Association" }
  ],
  "metrics": [
    {
      "entityId": "openorgs____::aaa111",
      "totalProducts": 487,
      "oaRate": 0.73,
      "oaByColor": { "gold": 201, "green": 154, "hybrid": 0, "bronze": 0, "closed": 132 },
      "outputByType": { "publication": 450, "dataset": 30, "software": 7 },
      "yearlyDistribution": [{ "year": 2020, "count": 98 }]
    }
  ],
  "computedAt": "2026-04-20T10:00:00.000Z"
}
```

**Example**

```bash
curl -X POST http://localhost:3001/api/compare \
  -H "Content-Type: application/json" \
  -d '{"entities":[{"id":"openorgs____::aaa111","type":"organization"},{"id":"openorgs____::bbb222","type":"organization"}],"filters":{"fromYear":2020}}'
```

---

## Metrics Endpoints

All metrics endpoints share the same base filter parameters:

| Parameter | Type | Description |
|-----------|------|-------------|
| `search` | `string` | Full-text filter |
| `organizationId` | `string` | Scope to an organisation |
| `projectId` | `string` | Scope to a project |
| `funderShortName` | `string` | Scope to a funder |
| `fromYear` | `number` | Lower year bound |
| `toYear` | `number` | Upper year bound |

At least one filter must be provided; an empty request returns zeroed-out data rather than scanning the entire OpenAIRE dataset.

---

### OA Distribution

```
GET /api/metrics/oa-distribution
```

Returns gold/green/hybrid/bronze/closed counts and percentages, broken down by year, plus an overall OA rate.

**Response**

```json
{
  "data": {
    "total": 1200,
    "distribution": {
      "gold":   { "count": 480, "percentage": 40 },
      "green":  { "count": 360, "percentage": 30 },
      "hybrid": { "count": 120, "percentage": 10 },
      "bronze": { "count": 60,  "percentage": 5 },
      "closed": { "count": 180, "percentage": 15 },
      "unknown":{ "count": 0,   "percentage": 0 }
    },
    "byYear": [
      { "year": 2022, "gold": 120, "green": 90, "hybrid": 30, "bronze": 15, "closed": 45 }
    ],
    "oaRate": 0.85,
    "oaRateByYear": [{ "year": 2022, "rate": 0.87 }]
  }
}
```

**Example**

```bash
curl "http://localhost:3001/api/metrics/oa-distribution?organizationId=openorgs____::aaa111&fromYear=2018"
```

---

### Trends

```
GET /api/metrics/trends
```

**Additional Parameters**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `granularity` | `"year" \| "quarter"` | `"year"` | Time series resolution |

**Response**

```json
{
  "data": {
    "timeSeries": [{ "period": "2022", "count": 143, "growthRate": 0.12 }],
    "cumulativeOutputs": [{ "period": "2022", "cumulative": 890 }],
    "movingAverages": [{ "period": "2022", "avg": 128 }],
    "summary": {
      "totalOutputs": 1200,
      "avgYearlyGrowth": 0.09,
      "peakYear": "2023",
      "peakCount": 165
    }
  }
}
```

**Example**

```bash
curl "http://localhost:3001/api/metrics/trends?funderShortName=EC&granularity=year&fromYear=2015"
```

---

### Network Graph

```
GET /api/metrics/network
```

**Additional Parameters**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `maxNodes` | `number` (10–300) | `100` | Maximum nodes in returned graph |

**Response**

```json
{
  "data": {
    "nodes": [{ "id": "Jane Smith", "label": "Jane Smith", "degree": 14 }],
    "edges": [{ "source": "Jane Smith", "target": "Bob Jones", "weight": 3 }],
    "metrics": {
      "nodeCount": 87,
      "edgeCount": 203,
      "density": 0.054,
      "avgDegree": 4.6,
      "components": 2,
      "topNodes": [{ "id": "Jane Smith", "degree": 14 }]
    }
  }
}
```

**Example**

```bash
curl "http://localhost:3001/api/metrics/network?search=machine+learning&maxNodes=50&fromYear=2020"
```

---

### OA Distribution Stream (SSE)

```
GET /api/metrics/oa-distribution/stream
```

Server-Sent Events stream. Accepts the same filter parameters as `/oa-distribution`. The server emits one `data:` event per page of results, allowing the client to render a progressively-filling chart.

**Event format**

```
data: {"products":[...ResearchProduct[]],"page":1,"done":false}

data: {"products":[...ResearchProduct[]],"page":2,"done":true}
```

**Example**

```bash
curl -N "http://localhost:3001/api/metrics/oa-distribution/stream?organizationId=openorgs____::aaa111"
```

---

## Health Endpoints

### Liveness

```
GET /api/health
```

Always returns 200 if the process is running.

```json
{ "status": "ok", "timestamp": "2026-04-20T10:00:00.000Z", "env": "production" }
```

### Readiness

```
GET /api/health/ready
```

Performs a minimal probe against the OpenAIRE Graph API. Returns 503 if the upstream is unreachable.

```json
{ "status": "ready", "timestamp": "2026-04-20T10:00:00.000Z" }
```

```json
{ "status": "degraded", "timestamp": "...", "details": "connect ECONNREFUSED" }
```

---

## Error Responses

All errors return a JSON body with at least an `error` field:

```json
{
  "error": "Invalid query params",
  "details": {
    "fieldErrors": { "fromYear": ["Expected number, received string"] },
    "formErrors": []
  }
}
```

| Status | Meaning |
|--------|---------|
| `400` | Validation failure — check `details` for field-level errors |
| `404` | Entity not found in OpenAIRE |
| `429` | Rate limit exceeded (120 req / 60 s per IP) |
| `503` | OpenAIRE upstream unavailable |
| `500` | Unexpected server error |
