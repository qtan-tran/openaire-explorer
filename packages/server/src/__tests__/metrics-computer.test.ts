import { describe, test, expect } from "vitest";
import type { ResearchProduct } from "@openaire-explorer/shared";
import {
  classifyOAStatus,
  computeOADistribution,
  computeTimeSeries,
  computeGrowthRates,
  computeMovingAverages,
} from "../lib/metrics-computer.js";
import { sampleProducts } from "./fixtures/sample-products.js";

// ─── Helper ───────────────────────────────────────────────────────────────────

function makeProduct(overrides: Partial<ResearchProduct>): ResearchProduct {
  return {
    id: "test::1",
    originalIds: [],
    type: "publication",
    mainTitle: "Test Product",
    subTitle: null,
    descriptions: null,
    authors: [],
    publicationDate: null,
    publisher: null,
    embargoEndDate: null,
    language: null,
    countries: null,
    subjects: null,
    openAccessColor: null,
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
    ...overrides,
  };
}

// ─── classifyOAStatus ─────────────────────────────────────────────────────────

describe("classifyOAStatus", () => {
  test("returns openAccessColor when it is gold", () => {
    expect(classifyOAStatus(makeProduct({ openAccessColor: "gold" }))).toBe("gold");
  });

  test("returns openAccessColor when it is hybrid", () => {
    expect(classifyOAStatus(makeProduct({ openAccessColor: "hybrid" }))).toBe("hybrid");
  });

  test("returns openAccessColor when it is bronze", () => {
    expect(classifyOAStatus(makeProduct({ openAccessColor: "bronze" }))).toBe("bronze");
  });

  test("returns green when openAccessColor is green (special path)", () => {
    // openAccessColor "green" falls through first guard (=== 'green') → handled by second branch
    const p = makeProduct({ openAccessColor: "green" as "gold", isGreen: false });
    expect(classifyOAStatus(p)).toBe("green");
  });

  test("returns green when isGreen is true and no openAccessColor", () => {
    expect(classifyOAStatus(makeProduct({ openAccessColor: null, isGreen: true }))).toBe("green");
  });

  test("openAccessColor gold takes priority over isGreen", () => {
    expect(classifyOAStatus(makeProduct({ openAccessColor: "gold", isGreen: true }))).toBe("gold");
  });

  test("returns gold for bestAccessRight.label OPEN (case-insensitive)", () => {
    const p = makeProduct({ bestAccessRight: { code: "c_abf2", label: "OPEN", scheme: "coar", openAccessRoute: null } });
    expect(classifyOAStatus(p)).toBe("gold");
  });

  test("returns gold for bestAccessRight.label OPEN SOURCE", () => {
    const p = makeProduct({ bestAccessRight: { code: "c_abf2", label: "Open Source", scheme: "coar", openAccessRoute: null } });
    expect(classifyOAStatus(p)).toBe("gold");
  });

  test("returns closed for bestAccessRight.label CLOSED", () => {
    const p = makeProduct({ bestAccessRight: { code: "c_14cb", label: "CLOSED", scheme: "coar", openAccessRoute: null } });
    expect(classifyOAStatus(p)).toBe("closed");
  });

  test("returns closed for bestAccessRight.label CLOSEDACCESS", () => {
    const p = makeProduct({ bestAccessRight: { code: "c_14cb", label: "CLOSEDACCESS", scheme: "coar", openAccessRoute: null } });
    expect(classifyOAStatus(p)).toBe("closed");
  });

  test("returns unknown when no OA information is available", () => {
    expect(classifyOAStatus(makeProduct({}))).toBe("unknown");
  });

  test("returns unknown for unrecognised bestAccessRight label", () => {
    const p = makeProduct({ bestAccessRight: { code: "x", label: "RESTRICTED", scheme: "coar", openAccessRoute: null } });
    expect(classifyOAStatus(p)).toBe("unknown");
  });
});

// ─── computeOADistribution ────────────────────────────────────────────────────

describe("computeOADistribution", () => {
  test("returns zero distribution for empty product list", () => {
    const result = computeOADistribution([]);
    expect(result.total).toBe(0);
    expect(result.oaRate).toBe(0);
    expect(result.byYear).toEqual([]);
    for (const entry of Object.values(result.distribution)) {
      expect(entry.count).toBe(0);
      expect(entry.percentage).toBe(0);
    }
  });

  test("counts total correctly", () => {
    const result = computeOADistribution(sampleProducts);
    // 20 products total; p020 has no publicationDate but is still counted in distribution
    expect(result.total).toBe(20);
  });

  test("counts gold correctly using sample fixtures", () => {
    const result = computeOADistribution(sampleProducts);
    // p001-p005 are gold (5 products)
    expect(result.distribution.gold.count).toBe(5);
  });

  test("counts green correctly", () => {
    const result = computeOADistribution(sampleProducts);
    // p006 (isGreen=true), p007 (openAccessColor="green"), p008 (isGreen), p009 (isGreen) = 4
    expect(result.distribution.green.count).toBe(4);
  });

  test("counts hybrid correctly", () => {
    const result = computeOADistribution(sampleProducts);
    expect(result.distribution.hybrid.count).toBe(3); // p010, p011, p012
  });

  test("counts bronze correctly", () => {
    const result = computeOADistribution(sampleProducts);
    expect(result.distribution.bronze.count).toBe(2); // p013, p014
  });

  test("counts closed correctly", () => {
    const result = computeOADistribution(sampleProducts);
    expect(result.distribution.closed.count).toBe(3); // p015, p016, p017
  });

  test("counts unknown correctly", () => {
    const result = computeOADistribution(sampleProducts);
    // p018, p019, p020 = 3
    expect(result.distribution.unknown.count).toBe(3);
  });

  test("percentages sum to ~100 for non-empty input", () => {
    const result = computeOADistribution(sampleProducts);
    const total = Object.values(result.distribution).reduce((s, e) => s + e.percentage, 0);
    expect(Math.round(total)).toBe(100);
  });

  test("oaRate equals (gold+green+hybrid)/total", () => {
    const result = computeOADistribution(sampleProducts);
    const expected = (5 + 4 + 3) / 20;
    expect(result.oaRate).toBeCloseTo(expected, 5);
  });

  test("byYear is sorted ascending by year", () => {
    const result = computeOADistribution(sampleProducts);
    for (let i = 1; i < result.byYear.length; i++) {
      expect(result.byYear[i]!.year).toBeGreaterThanOrEqual(result.byYear[i - 1]!.year);
    }
  });

  test("byYear excludes products without publicationDate", () => {
    const result = computeOADistribution(sampleProducts);
    // p020 has no publicationDate, so total in byYear = 19
    const byYearTotal = result.byYear.reduce(
      (s, r) => s + r.gold + r.green + r.hybrid + r.bronze + r.closed + r.unknown,
      0
    );
    expect(byYearTotal).toBe(19);
  });

  test("handles single product", () => {
    const result = computeOADistribution([makeProduct({ openAccessColor: "gold", publicationDate: "2023-01-01" })]);
    expect(result.total).toBe(1);
    expect(result.distribution.gold.count).toBe(1);
    expect(result.distribution.gold.percentage).toBe(100);
    expect(result.oaRate).toBe(1);
  });
});

// ─── computeTimeSeries ────────────────────────────────────────────────────────

describe("computeTimeSeries", () => {
  const yearlyProducts: ResearchProduct[] = [
    makeProduct({ publicationDate: "2020-01-01", type: "publication", openAccessColor: "gold" }),
    makeProduct({ publicationDate: "2020-06-15", type: "dataset", openAccessColor: null }),
    makeProduct({ publicationDate: "2021-03-10", type: "publication", isGreen: true }),
    makeProduct({ publicationDate: "2021-09-01", type: "software", openAccessColor: "hybrid" }),
    makeProduct({ publicationDate: "2021-11-20", type: "publication", openAccessColor: null }),
    makeProduct({ publicationDate: "2022-02-01", type: "publication", openAccessColor: "bronze" }),
  ];

  test("groups products correctly by year", () => {
    const series = computeTimeSeries(yearlyProducts, "year");
    expect(series).toHaveLength(3); // 2020, 2021, 2022
    expect(series[0]!.period).toBe("2020");
    expect(series[0]!.totalOutputs).toBe(2);
    expect(series[1]!.period).toBe("2021");
    expect(series[1]!.totalOutputs).toBe(3);
    expect(series[2]!.period).toBe("2022");
    expect(series[2]!.totalOutputs).toBe(1);
  });

  test("counts publications, datasets, software, other per period", () => {
    const series = computeTimeSeries(yearlyProducts, "year");
    expect(series[0]!.publications).toBe(1); // 2020
    expect(series[0]!.datasets).toBe(1);
    expect(series[1]!.publications).toBe(2); // 2021
    expect(series[1]!.software).toBe(1);
  });

  test("computes oaRate per period correctly", () => {
    const series = computeTimeSeries(yearlyProducts, "year");
    // 2020: gold + none → 1 open / 2 total = 0.5
    expect(series[0]!.oaRate).toBeCloseTo(0.5);
    // 2021: green + hybrid + unknown → 2 open / 3 total ≈ 0.667
    expect(series[1]!.oaRate).toBeCloseTo(2 / 3, 5);
    // 2022: bronze → 0 open / 1 total = 0
    expect(series[2]!.oaRate).toBe(0);
  });

  test("first period always has growthRate null", () => {
    const series = computeTimeSeries(yearlyProducts, "year");
    expect(series[0]!.growthRate).toBeNull();
  });

  test("computes growthRate for subsequent periods", () => {
    const series = computeTimeSeries(yearlyProducts, "year");
    // 2021: (3-2)/2 = 0.5
    expect(series[1]!.growthRate).toBeCloseTo(0.5);
    // 2022: (1-3)/3 = -0.667
    expect(series[2]!.growthRate).toBeCloseTo(-2 / 3, 5);
  });

  test("skips products with null publicationDate", () => {
    const withNull = [...yearlyProducts, makeProduct({ publicationDate: null })];
    const series = computeTimeSeries(withNull, "year");
    // Same result — null date is ignored
    expect(series).toHaveLength(3);
    expect(series[1]!.totalOutputs).toBe(3);
  });

  test("groups by quarter correctly", () => {
    const products = [
      makeProduct({ publicationDate: "2021-01-15" }), // 2021-Q1
      makeProduct({ publicationDate: "2021-04-10" }), // 2021-Q2
      makeProduct({ publicationDate: "2021-04-20" }), // 2021-Q2
    ];
    const series = computeTimeSeries(products, "quarter");
    expect(series).toHaveLength(2);
    expect(series[0]!.period).toBe("2021-Q1");
    expect(series[1]!.period).toBe("2021-Q2");
    expect(series[1]!.totalOutputs).toBe(2);
  });

  test("returns empty array for empty product list", () => {
    expect(computeTimeSeries([], "year")).toEqual([]);
  });
});

// ─── computeGrowthRates ───────────────────────────────────────────────────────

describe("computeGrowthRates", () => {
  function makeSeries(outputs: number[]) {
    return outputs.map((totalOutputs, i) => ({
      period: String(2020 + i),
      totalOutputs,
      publications: totalOutputs,
      datasets: 0,
      software: 0,
      other: 0,
      oaRate: 0,
      growthRate: null as number | null,
    }));
  }

  test("first entry always has null growthRate", () => {
    const result = computeGrowthRates(makeSeries([10, 20]));
    expect(result[0]!.growthRate).toBeNull();
  });

  test("calculates positive growth correctly", () => {
    const result = computeGrowthRates(makeSeries([10, 15]));
    expect(result[1]!.growthRate).toBeCloseTo(0.5);
  });

  test("calculates negative growth correctly", () => {
    const result = computeGrowthRates(makeSeries([20, 10]));
    expect(result[1]!.growthRate).toBeCloseTo(-0.5);
  });

  test("returns null growthRate when previous period was zero", () => {
    const result = computeGrowthRates(makeSeries([0, 5]));
    expect(result[1]!.growthRate).toBeNull();
  });

  test("handles flat growth (no change)", () => {
    const result = computeGrowthRates(makeSeries([10, 10]));
    expect(result[1]!.growthRate).toBe(0);
  });

  test("returns empty array for empty input", () => {
    expect(computeGrowthRates([])).toEqual([]);
  });

  test("returns single-element array unchanged (null growthRate)", () => {
    const result = computeGrowthRates(makeSeries([42]));
    expect(result).toHaveLength(1);
    expect(result[0]!.growthRate).toBeNull();
  });

  test("does not mutate the original series", () => {
    const series = makeSeries([10, 20, 30]);
    const original = series.map((e) => ({ ...e }));
    computeGrowthRates(series);
    expect(series[0]!.growthRate).toBe(original[0]!.growthRate);
  });
});

// ─── computeMovingAverages ────────────────────────────────────────────────────

describe("computeMovingAverages", () => {
  function makeSeries(outputs: number[]) {
    return outputs.map((totalOutputs, i) => ({
      period: String(2020 + i),
      totalOutputs,
      publications: totalOutputs,
      datasets: 0,
      software: 0,
      other: 0,
      oaRate: 0,
      growthRate: null as number | null,
    }));
  }

  test("ma3 is null for first two entries", () => {
    const result = computeMovingAverages(makeSeries([10, 20, 30, 40, 50]));
    expect(result[0]!.ma3).toBeNull();
    expect(result[1]!.ma3).toBeNull();
  });

  test("ma3 is computed correctly from index 2 onwards", () => {
    // [10, 20, 30] → avg = 20
    const result = computeMovingAverages(makeSeries([10, 20, 30, 40, 50]));
    expect(result[2]!.ma3).toBe(20);
    // [20, 30, 40] → avg = 30
    expect(result[3]!.ma3).toBe(30);
    // [30, 40, 50] → avg = 40
    expect(result[4]!.ma3).toBe(40);
  });

  test("ma5 is null for first four entries", () => {
    const result = computeMovingAverages(makeSeries([10, 20, 30, 40, 50]));
    expect(result[0]!.ma5).toBeNull();
    expect(result[1]!.ma5).toBeNull();
    expect(result[2]!.ma5).toBeNull();
    expect(result[3]!.ma5).toBeNull();
  });

  test("ma5 is computed correctly from index 4 onwards", () => {
    // [10, 20, 30, 40, 50] → avg = 30
    const result = computeMovingAverages(makeSeries([10, 20, 30, 40, 50]));
    expect(result[4]!.ma5).toBe(30);
  });

  test("ma5 is computed for a 6-element series", () => {
    // [20, 30, 40, 50, 60] → avg = 40
    const result = computeMovingAverages(makeSeries([10, 20, 30, 40, 50, 60]));
    expect(result[5]!.ma5).toBe(40);
  });

  test("preserves period labels", () => {
    const result = computeMovingAverages(makeSeries([5, 5, 5]));
    expect(result[0]!.period).toBe("2020");
    expect(result[2]!.period).toBe("2022");
  });

  test("returns empty array for empty input", () => {
    expect(computeMovingAverages([])).toEqual([]);
  });

  test("single element has both ma3 and ma5 as null", () => {
    const result = computeMovingAverages(makeSeries([100]));
    expect(result[0]!.ma3).toBeNull();
    expect(result[0]!.ma5).toBeNull();
  });
});
