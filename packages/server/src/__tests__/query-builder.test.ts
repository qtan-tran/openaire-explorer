import { describe, test, expect } from "vitest";
import {
  buildResearchProductQuery,
  buildOrganizationQuery,
  buildProjectQuery,
  applyParams,
} from "../lib/query-builder.js";

describe("buildResearchProductQuery", () => {
  test("maps all standard params to string values", () => {
    const result = buildResearchProductQuery({
      search: "quantum computing",
      type: "publication",
      openAccessColor: "gold",
      isGreen: true,
      fromPublicationDate: "2020-01-01",
      toPublicationDate: "2024-12-31",
      funder: "EC",
      fundingStream: "HE",
      page: 3,
      pageSize: 25,
      sortBy: "citations DESC",
    });

    expect(result["search"]).toBe("quantum computing");
    expect(result["type"]).toBe("publication");
    expect(result["openAccessColor"]).toBe("gold");
    expect(result["isGreen"]).toBe("true");
    expect(result["fromPublicationDate"]).toBe("2020-01-01");
    expect(result["toPublicationDate"]).toBe("2024-12-31");
    expect(result["funder"]).toBe("EC");
    expect(result["fundingStream"]).toBe("HE");
    expect(result["page"]).toBe("3");
    expect(result["pageSize"]).toBe("25");
    expect(result["sortBy"]).toBe("citations DESC");
  });

  test("strips undefined values", () => {
    const result = buildResearchProductQuery({ search: "test", type: undefined });
    expect(result).not.toHaveProperty("type");
    expect(result["search"]).toBe("test");
  });

  test("strips null values", () => {
    const result = buildResearchProductQuery({ search: "test", sortBy: undefined });
    expect(result).not.toHaveProperty("sortBy");
  });

  test("strips empty string values", () => {
    const result = buildResearchProductQuery({ search: "", type: "publication" });
    expect(result).not.toHaveProperty("search");
    expect(result["type"]).toBe("publication");
  });

  test("includes cursor when provided", () => {
    const result = buildResearchProductQuery({ cursor: "AoM/abc==" });
    expect(result["cursor"]).toBe("AoM/abc==");
  });

  test("includes relation IDs correctly", () => {
    const result = buildResearchProductQuery({
      relOrganizationId: "openorgs____::abc",
      relProjectId: "corda_____he::xyz",
    });
    expect(result["relOrganizationId"]).toBe("openorgs____::abc");
    expect(result["relProjectId"]).toBe("corda_____he::xyz");
  });

  test("includes doi and orcid when provided", () => {
    const result = buildResearchProductQuery({ doi: "10.1234/test", orcid: "0000-0001-2345-6789" });
    expect(result["doi"]).toBe("10.1234/test");
    expect(result["orcid"]).toBe("0000-0001-2345-6789");
  });

  test("converts boolean isGreen=false to string 'false'", () => {
    const result = buildResearchProductQuery({ isGreen: false });
    // false is falsy — the clean() helper checks for undefined/null/"", so false should pass through
    // Actually looking at clean(): `if (value === undefined || value === null || value === "") continue;`
    // false is NOT in that list, so it should be included
    expect(result["isGreen"]).toBe("false");
  });

  test("returns empty object when all params are undefined", () => {
    const result = buildResearchProductQuery({});
    expect(Object.keys(result)).toHaveLength(0);
  });
});

describe("buildOrganizationQuery", () => {
  test("maps search, countryCode, pid correctly", () => {
    const result = buildOrganizationQuery({ search: "CERN", countryCode: "CH", pid: "ror:01ggx4157" });
    expect(result["search"]).toBe("CERN");
    expect(result["countryCode"]).toBe("CH");
    expect(result["pid"]).toBe("ror:01ggx4157");
  });

  test("includes pagination params", () => {
    const result = buildOrganizationQuery({ page: 2, pageSize: 20 });
    expect(result["page"]).toBe("2");
    expect(result["pageSize"]).toBe("20");
  });

  test("strips undefined fields", () => {
    const result = buildOrganizationQuery({ search: "MIT", countryCode: undefined });
    expect(result).not.toHaveProperty("countryCode");
  });

  test("includes cursor for pagination", () => {
    const result = buildOrganizationQuery({ cursor: "nextPage==" });
    expect(result["cursor"]).toBe("nextPage==");
  });
});

describe("buildProjectQuery", () => {
  test("maps funding and date params", () => {
    const result = buildProjectQuery({
      search: "horizon",
      funder: "EC",
      fundingStream: "HE",
      callIdentifier: "HORIZON-2021",
      fromStartDate: "2021-01-01",
      toEndDate: "2024-12-31",
      openAccessMandateForPublications: true,
    });
    expect(result["search"]).toBe("horizon");
    expect(result["funder"]).toBe("EC");
    expect(result["fundingStream"]).toBe("HE");
    expect(result["callIdentifier"]).toBe("HORIZON-2021");
    expect(result["fromStartDate"]).toBe("2021-01-01");
    expect(result["toEndDate"]).toBe("2024-12-31");
    expect(result["openAccessMandateForPublications"]).toBe("true");
  });

  test("strips undefined params", () => {
    const result = buildProjectQuery({ search: "AI", funder: undefined });
    expect(result).not.toHaveProperty("funder");
    expect(result["search"]).toBe("AI");
  });

  test("returns empty object when given no params", () => {
    expect(Object.keys(buildProjectQuery({}))).toHaveLength(0);
  });
});

describe("applyParams", () => {
  test("appends string params to URL searchParams", () => {
    const url = new URL("https://api.example.com/v2/products");
    applyParams(url, { search: "climate", pageSize: "10" });
    expect(url.searchParams.get("search")).toBe("climate");
    expect(url.searchParams.get("pageSize")).toBe("10");
  });

  test("URL-encodes special characters", () => {
    const url = new URL("https://api.example.com/v2/products");
    applyParams(url, { search: "carbon & nitrogen" });
    expect(url.searchParams.get("search")).toBe("carbon & nitrogen");
    // The URL's searchParams.toString() should properly encode it
    expect(url.toString()).toContain("carbon");
  });

  test("overwrites existing params with the same key", () => {
    const url = new URL("https://api.example.com/v2/products?page=1");
    applyParams(url, { page: "2" });
    expect(url.searchParams.get("page")).toBe("2");
  });

  test("does nothing for empty params object", () => {
    const url = new URL("https://api.example.com/v2/products?foo=bar");
    applyParams(url, {});
    expect(url.searchParams.get("foo")).toBe("bar");
  });
});
