# Search Examples

All examples target the local dev server at `http://localhost:3001`. Replace the base URL with your production API for deployed environments.

---

## 1. Basic full-text search for publications

Find publications mentioning "machine learning":

```bash
curl "http://localhost:3001/api/search/research-products?search=machine+learning&type=publication"
```

Expected: paginated list of publications with `type: "publication"`, sorted by relevance.

---

## 2. Gold open-access climate publications since 2020

```bash
curl "http://localhost:3001/api/search/research-products?search=climate+change&openAccessColor=gold&fromYear=2020&pageSize=10"
```

Expected: only records where `openAccessColor === "gold"` and `publicationDate >= 2020-01-01`.

---

## 3. Datasets from a specific organisation

```bash
curl "http://localhost:3001/api/search/research-products?type=dataset&organizationId=openorgs____::b84450f9d6d24c3a9d5e4f54c01b9fd0"
```

Expected: datasets linked to CERN. Swap the ID for any organisation returned by `/api/search/organizations`.

---

## 4. EC-funded projects from 2019 onwards

```bash
curl "http://localhost:3001/api/search/projects?funderShortName=EC&fromStartDate=2019-01-01&pageSize=20"
```

Expected: Horizon 2020 and Horizon Europe projects starting from January 2019.

---

## 5. Search organisations by country

Find research institutions in the Netherlands:

```bash
curl "http://localhost:3001/api/search/organizations?countryCode=NL&pageSize=20"
```

Expected: organisations with `country.code === "NL"`.

---

## 6. Software outputs linked to a project

```bash
curl "http://localhost:3001/api/search/research-products?type=software&projectId=corda__h2020::abc123"
```

Expected: software records associated with the given Horizon 2020 project.

---

## 7. Related products for a known publication

```bash
# Step 1 — find a product ID
curl "http://localhost:3001/api/search/research-products?search=FAIR+data+principles&pageSize=1"

# Step 2 — fetch related products using the ID from step 1
curl "http://localhost:3001/api/search/research-products/doi_dedup__::abc123/related?pageSize=6"
```

Expected: up to 6 products sharing a project or organisation with the source record, excluding the source itself.

---

## 8. Paginating through large result sets

```bash
# Page 1
curl "http://localhost:3001/api/search/research-products?search=COVID-19&page=1&pageSize=20"

# Page 2
curl "http://localhost:3001/api/search/research-products?search=COVID-19&page=2&pageSize=20"
```

Use `meta.totalPages` from the first response to determine how many pages are available.

---

## 9. Narrowing by year range

Publications between 2015 and 2018 on quantum computing:

```bash
curl "http://localhost:3001/api/search/research-products?search=quantum+computing&fromYear=2015&toYear=2018"
```

---

## 10. Products from an organisation's detail page

```bash
# Fetch the organisation
curl "http://localhost:3001/api/search/organizations/openorgs____::b84450f9d6d24c3a9d5e4f54c01b9fd0"

# Fetch its research products (paginated)
curl "http://localhost:3001/api/search/organizations/openorgs____::b84450f9d6d24c3a9d5e4f54c01b9fd0/products?page=1&pageSize=10"
```
