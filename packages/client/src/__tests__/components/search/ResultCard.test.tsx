import { describe, test, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { ResultCard } from "../../../components/search/ResultCard";
import type { SearchResultItem } from "../../../components/search/ResultCard";
import type { ResearchProduct, Organization, Project } from "@openaire-explorer/shared";

// ─── Wrapper ──────────────────────────────────────────────────────────────────

function Wrapper({ children }: { children: ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return (
    <QueryClientProvider client={qc}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  );
}

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const PRODUCT: ResearchProduct = {
  id: "doi::abc123",
  originalIds: [],
  type: "publication",
  mainTitle: "Climate Change and Biodiversity",
  subTitle: null,
  descriptions: ["A groundbreaking study on climate impacts on ecosystems."],
  authors: [
    { fullName: "Alice Smith", name: "Alice", surname: "Smith", rank: 1, pid: null },
    { fullName: "Bob Jones", name: "Bob", surname: "Jones", rank: 2, pid: null },
    { fullName: "Charlie Brown", name: "Charlie", surname: "Brown", rank: 3, pid: null },
    { fullName: "Diana Prince", name: "Diana", surname: "Prince", rank: 4, pid: null },
  ],
  publicationDate: "2023-06-15",
  publisher: "Nature Journals",
  embargoEndDate: null,
  language: null,
  countries: null,
  subjects: null,
  openAccessColor: "gold",
  publiclyFunded: false,
  isGreen: false,
  isInDiamondJournal: false,
  bestAccessRight: null,
  container: null,
  sources: null,
  formats: null,
  contributors: null,
  coverages: null,
  documentationUrls: null,
  codeRepositoryUrl: null,
  programmingLanguage: null,
  contactPeople: null,
  contactGroups: null,
  tools: null,
  size: null,
  version: null,
  geoLocations: null,
  pids: null,
  dateOfCollection: null,
  lastUpdateTimeStamp: null,
  indicators: null,
  projects: null,
  organizations: null,
  communities: null,
  collectedFrom: [],
  instances: [],
};

const ORG: Organization = {
  id: "openorgs::mit001",
  originalIds: [],
  legalName: "Massachusetts Institute of Technology",
  legalShortName: "MIT",
  alternativeNames: null,
  websiteUrl: "https://mit.edu",
  country: { code: "US", label: "United States" },
  pids: null,
};

const PROJECT: Project = {
  id: "corda::proj001",
  originalIds: [],
  code: "101001",
  acronym: "CLIMATEAI",
  title: "Climate AI Research Project",
  websiteUrl: null,
  startDate: "2022-01-01",
  endDate: "2024-12-31",
  callIdentifier: null,
  keywords: null,
  openAccessMandateForPublications: true,
  openAccessMandateForDataset: false,
  subjects: null,
  summary: "A summary of the climate AI project.",
  fundings: [{ shortName: "EC", name: "European Commission", jurisdiction: "EU", fundingStream: null }],
  granted: null,
  h2020Programmes: null,
};

// ─── Research Product Card ────────────────────────────────────────────────────

describe("ResultCard — publication", () => {
  const item: SearchResultItem = { kind: "product", item: PRODUCT };

  test("renders the product title", () => {
    render(<ResultCard result={item} />, { wrapper: Wrapper });
    expect(screen.getAllByText("Climate Change and Biodiversity").length).toBeGreaterThan(0);
  });

  test("renders author names (truncated to 3 + et al.)", () => {
    render(<ResultCard result={item} />, { wrapper: Wrapper });
    expect(screen.getByText(/Alice Smith, Bob Jones, Charlie Brown et al\./)).toBeTruthy();
  });

  test("renders publication year", () => {
    render(<ResultCard result={item} />, { wrapper: Wrapper });
    expect(screen.getByText("2023")).toBeTruthy();
  });

  test("renders publisher name", () => {
    render(<ResultCard result={item} />, { wrapper: Wrapper });
    expect(screen.getByText("Nature Journals")).toBeTruthy();
  });

  test("renders description snippet", () => {
    render(<ResultCard result={item} />, { wrapper: Wrapper });
    expect(screen.getByText(/A groundbreaking study/)).toBeTruthy();
  });

  test("renders Publication type badge", () => {
    render(<ResultCard result={item} />, { wrapper: Wrapper });
    expect(screen.getByText("Publication")).toBeTruthy();
  });

  test("links to correct product detail URL", () => {
    render(<ResultCard result={item} />, { wrapper: Wrapper });
    const links = screen.getAllByRole("link");
    const hasProductLink = links.some((l) => l.getAttribute("href")?.includes("product"));
    expect(hasProductLink).toBe(true);
  });

  test("handles missing description gracefully", () => {
    const noDesc: SearchResultItem = { kind: "product", item: { ...PRODUCT, descriptions: null } };
    render(<ResultCard result={noDesc} />, { wrapper: Wrapper });
    expect(screen.getAllByText("Climate Change and Biodiversity").length).toBeGreaterThan(0);
  });

  test("handles empty authors array gracefully", () => {
    const noAuthors: SearchResultItem = { kind: "product", item: { ...PRODUCT, authors: [] } };
    render(<ResultCard result={noAuthors} />, { wrapper: Wrapper });
    // Should render without crashing
    expect(screen.getAllByText("Climate Change and Biodiversity").length).toBeGreaterThan(0);
  });

  test("handles null publicationDate gracefully", () => {
    const noDate: SearchResultItem = { kind: "product", item: { ...PRODUCT, publicationDate: null } };
    render(<ResultCard result={noDate} />, { wrapper: Wrapper });
    expect(screen.getAllByText("Climate Change and Biodiversity").length).toBeGreaterThan(0);
  });

  test("renders dataset type badge for dataset products", () => {
    const dataset: SearchResultItem = { kind: "product", item: { ...PRODUCT, type: "dataset" } };
    render(<ResultCard result={dataset} />, { wrapper: Wrapper });
    expect(screen.getByText("Dataset")).toBeTruthy();
  });

  test("renders software type badge for software products", () => {
    const software: SearchResultItem = { kind: "product", item: { ...PRODUCT, type: "software" } };
    render(<ResultCard result={software} />, { wrapper: Wrapper });
    expect(screen.getByText("Software")).toBeTruthy();
  });
});

// ─── Organization Card ────────────────────────────────────────────────────────

describe("ResultCard — organization", () => {
  const item: SearchResultItem = { kind: "org", item: ORG };

  test("renders organization name", () => {
    render(<ResultCard result={item} />, { wrapper: Wrapper });
    expect(screen.getAllByText("Massachusetts Institute of Technology").length).toBeGreaterThan(0);
  });

  test("renders country badge", () => {
    render(<ResultCard result={item} />, { wrapper: Wrapper });
    expect(screen.getByText("United States")).toBeTruthy();
  });

  test("renders short name", () => {
    render(<ResultCard result={item} />, { wrapper: Wrapper });
    expect(screen.getByText("MIT")).toBeTruthy();
  });

  test("renders Organization type badge", () => {
    render(<ResultCard result={item} />, { wrapper: Wrapper });
    expect(screen.getByText("Organization")).toBeTruthy();
  });

  test("links to correct organization detail URL", () => {
    render(<ResultCard result={item} />, { wrapper: Wrapper });
    const links = screen.getAllByRole("link");
    const hasOrgLink = links.some((l) => l.getAttribute("href")?.includes("organization"));
    expect(hasOrgLink).toBe(true);
  });

  test("handles null country gracefully", () => {
    const noCountry: SearchResultItem = { kind: "org", item: { ...ORG, country: null } };
    render(<ResultCard result={noCountry} />, { wrapper: Wrapper });
    expect(screen.getAllByText("Massachusetts Institute of Technology").length).toBeGreaterThan(0);
  });
});

// ─── Project Card ────────────────────────────────────────────────────────────

describe("ResultCard — project", () => {
  const item: SearchResultItem = { kind: "project", item: PROJECT };

  test("renders project title", () => {
    render(<ResultCard result={item} />, { wrapper: Wrapper });
    expect(screen.getAllByText("Climate AI Research Project").length).toBeGreaterThan(0);
  });

  test("renders project acronym", () => {
    render(<ResultCard result={item} />, { wrapper: Wrapper });
    expect(screen.getByText("CLIMATEAI")).toBeTruthy();
  });

  test("renders funder badge", () => {
    render(<ResultCard result={item} />, { wrapper: Wrapper });
    expect(screen.getByText("EC")).toBeTruthy();
  });

  test("renders OA Mandate badge", () => {
    render(<ResultCard result={item} />, { wrapper: Wrapper });
    expect(screen.getByText("OA Mandate")).toBeTruthy();
  });

  test("renders project start year", () => {
    render(<ResultCard result={item} />, { wrapper: Wrapper });
    expect(screen.getByText(/2022/)).toBeTruthy();
  });

  test("links to correct project detail URL", () => {
    render(<ResultCard result={item} />, { wrapper: Wrapper });
    const links = screen.getAllByRole("link");
    const hasProjectLink = links.some((l) => l.getAttribute("href")?.includes("project"));
    expect(hasProjectLink).toBe(true);
  });

  test("handles null summary gracefully", () => {
    const noSummary: SearchResultItem = { kind: "project", item: { ...PROJECT, summary: null } };
    render(<ResultCard result={noSummary} />, { wrapper: Wrapper });
    expect(screen.getAllByText("Climate AI Research Project").length).toBeGreaterThan(0);
  });
});
