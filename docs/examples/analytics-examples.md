# Analytics Examples

The analytics page exposes three modules, each backed by a dedicated API endpoint. All three share the same filter parameters; at least one filter must be provided.

---

## OA Distribution

**Endpoint:** `GET /api/metrics/oa-distribution`

Shows the split of gold / green / hybrid / bronze / closed access across a corpus, both as totals and broken down by year.

### Example 1 — OA profile of an EC funder

```bash
curl "http://localhost:3001/api/metrics/oa-distribution?funderShortName=EC&fromYear=2018&toYear=2023"
```

Interpret `data.distribution` to see what share of EC-funded output is gold vs. green. A high green share with low gold may indicate authors are self-archiving rather than paying APCs.

### Example 2 — Scoped to one organisation, recent years

```bash
curl "http://localhost:3001/api/metrics/oa-distribution?organizationId=openorgs____::b84450f9d6d24c3a9d5e4f54c01b9fd0&fromYear=2020"
```

Use `data.oaRateByYear` to plot whether the institution's OA rate is improving year-on-year.

### Example 3 — Progressive load via SSE

For large corpora, use the streaming endpoint to get live chart updates as pages of data arrive:

```bash
curl -N "http://localhost:3001/api/metrics/oa-distribution/stream?funderShortName=EC&fromYear=2020"
```

Each `data:` event contains a batch of `ResearchProduct` records. The client accumulates them and recomputes the distribution in-browser.

---

## Trend Analysis

**Endpoint:** `GET /api/metrics/trends`

Tracks publication velocity over time — raw counts per period, cumulative totals, 3-period moving averages, and a summary of peak year and average growth.

### Example 1 — Yearly publication trend for a search topic

```bash
curl "http://localhost:3001/api/metrics/trends?search=CRISPR&granularity=year"
```

`data.timeSeries[*].growthRate` shows year-over-year change as a decimal. A value of `0.15` means +15% vs. the previous year.

### Example 2 — Quarterly granularity for a specific project

```bash
curl "http://localhost:3001/api/metrics/trends?projectId=corda__h2020::abc123&granularity=quarter"
```

Quarter labels are formatted as `"2022-Q3"`. Useful for spotting submission spikes around grant reporting deadlines.

### Example 3 — Long-term trend for an organisation (15 years)

```bash
curl "http://localhost:3001/api/metrics/trends?organizationId=openorgs____::aaa111&fromYear=2008&toYear=2023&granularity=year"
```

Compare `data.summary.peakYear` and `data.summary.avgYearlyGrowth` to characterise the institution's research trajectory.

---

## Research Network

**Endpoint:** `GET /api/metrics/network`

Builds a co-authorship graph: nodes are authors, edges represent shared publications, edge weight is the number of co-authored papers.

### Example 1 — Co-authorship network for a research topic

```bash
curl "http://localhost:3001/api/metrics/network?search=single+cell+RNA+sequencing&maxNodes=80"
```

`data.metrics.density` near 0 indicates a sparse community; near 1 indicates a tightly connected group. `data.metrics.components` > 1 means there are disconnected sub-communities.

### Example 2 — Network for a specific funder

```bash
curl "http://localhost:3001/api/metrics/network?funderShortName=EC&fromYear=2021&maxNodes=100"
```

Use `data.metrics.topNodes` to identify the most-connected researchers (highest degree centrality) in the EC-funded network since 2021.

### Example 3 — Small network for fast exploration

```bash
curl "http://localhost:3001/api/metrics/network?organizationId=openorgs____::aaa111&maxNodes=30"
```

Setting `maxNodes=30` trims to the 30 highest-degree nodes before returning. Useful for rendering manageable graphs in the browser.

---

## Tips

- All metrics endpoints cache results for **5 minutes**. If you change filters, results refresh after the TTL expires.
- The network endpoint caps the product fetch at **500** (regardless of `maxResults`) to keep graph construction fast.
- Combine `organizationId` + `fromYear`/`toYear` for the most focused analytics — scoping avoids timeouts on very broad queries.
