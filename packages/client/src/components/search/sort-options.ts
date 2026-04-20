import type { SortOption } from "./SortDropdown";

export const RESEARCH_PRODUCT_SORT_OPTIONS: SortOption[] = [
  { value: "", label: "Relevance" },
  { value: "publicationDate DESC", label: "Date (newest)" },
  { value: "publicationDate ASC", label: "Date (oldest)" },
  { value: "popularity DESC", label: "Popularity" },
  { value: "citationCount DESC", label: "Citation count" },
];

export const PROJECT_SORT_OPTIONS: SortOption[] = [
  { value: "", label: "Relevance" },
  { value: "startDate DESC", label: "Start date (newest)" },
  { value: "startDate ASC", label: "Start date (oldest)" },
];

export const ORGANIZATION_SORT_OPTIONS: SortOption[] = [
  { value: "", label: "Relevance" },
];
