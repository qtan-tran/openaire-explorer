# Comparison Examples

The compare endpoint (`POST /api/compare`) accepts 1–5 entities of any type and returns normalised metrics for side-by-side analysis.

---

## Scenario 1 — Two research organisations (2018–2023)

Compare open-access output between two European research institutions over five years.

```bash
curl -X POST http://localhost:3001/api/compare \
  -H "Content-Type: application/json" \
  -d '{
    "entities": [
      { "id": "openorgs____::b84450f9d6d24c3a9d5e4f54c01b9fd0", "type": "organization" },
      { "id": "openorgs____::d1c3182f08a562bb22633c5b5b6c1f8b", "type": "organization" }
    ],
    "filters": { "fromYear": 2018, "toYear": 2023 }
  }'
```

**What to look for in the response:**
- `metrics[*].oaRate` — which institution publishes more openly
- `metrics[*].oaByColor` — breakdown of gold vs. green vs. closed
- `metrics[*].yearlyDistribution` — publication velocity over time
- `metrics[*].totalProducts` — overall output volume

---

## Scenario 2 — Three Horizon 2020 projects

Compare research output across three EC-funded projects to assess relative productivity and OA compliance.

```bash
# Step 1 — find project IDs
curl "http://localhost:3001/api/search/projects?funderShortName=EC&search=biodiversity&pageSize=5"

# Step 2 — compare three projects from the results
curl -X POST http://localhost:3001/api/compare \
  -H "Content-Type: application/json" \
  -d '{
    "entities": [
      { "id": "corda__h2020::project_a", "type": "project" },
      { "id": "corda__h2020::project_b", "type": "project" },
      { "id": "corda__h2020::project_c", "type": "project" }
    ]
  }'
```

**What to look for:**
- `metrics[*].outputByType` — do projects produce datasets and software, or only publications?
- `metrics[*].oaRate` — are projects meeting their funder OA mandate?
- `entities[*].name` — verify you have the right projects before drawing conclusions

---

## Scenario 3 — Mixed entity types (organisation vs. project)

Measure a university's overall output against one of its flagship projects.

```bash
curl -X POST http://localhost:3001/api/compare \
  -H "Content-Type: application/json" \
  -d '{
    "entities": [
      { "id": "openorgs____::university_id", "type": "organization" },
      { "id": "corda__h2020::flagship_project_id", "type": "project" }
    ],
    "filters": { "fromYear": 2020, "toYear": 2024 }
  }'
```

**What to look for:**
- What fraction of the institution's total output is attributable to this single project?
- Does the project skew the institution's OA rate up or down?
- `computedAt` — note the timestamp; the result is cached for 10 minutes

---

## Notes

- The server fetches up to **500 products** per entity via cursor pagination. Very large organisations may be underrepresented — use year filters to scope the analysis.
- Entity order in the request does not affect caching — IDs are sorted internally.
- For `research-product` entities, no product lookup is performed; the single record is used directly.
