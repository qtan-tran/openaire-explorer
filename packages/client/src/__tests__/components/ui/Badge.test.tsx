import { describe, test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Badge } from "../../../components/ui/Badge";

describe("Badge", () => {
  test("renders children text", () => {
    render(<Badge>Gold</Badge>);
    expect(screen.getByText("Gold")).toBeTruthy();
  });

  test("renders as a span element", () => {
    const { container } = render(<Badge>Test</Badge>);
    expect(container.querySelector("span")).toBeTruthy();
  });

  test("applies default variant class when no variant is given", () => {
    const { container } = render(<Badge>Default</Badge>);
    const span = container.querySelector("span")!;
    expect(span.className).toContain("bg-bg-secondary");
  });

  test("applies oa-gold variant classes", () => {
    const { container } = render(<Badge variant="oa-gold">Gold OA</Badge>);
    const span = container.querySelector("span")!;
    expect(span.className).toContain("oa-gold");
  });

  test("applies oa-green variant classes", () => {
    const { container } = render(<Badge variant="oa-green">Green OA</Badge>);
    const span = container.querySelector("span")!;
    expect(span.className).toContain("oa-green");
  });

  test("applies oa-hybrid variant classes", () => {
    const { container } = render(<Badge variant="oa-hybrid">Hybrid OA</Badge>);
    const span = container.querySelector("span")!;
    expect(span.className).toContain("oa-hybrid");
  });

  test("applies oa-bronze variant classes", () => {
    const { container } = render(<Badge variant="oa-bronze">Bronze OA</Badge>);
    const span = container.querySelector("span")!;
    expect(span.className).toContain("oa-bronze");
  });

  test("applies oa-closed variant classes", () => {
    const { container } = render(<Badge variant="oa-closed">Closed</Badge>);
    const span = container.querySelector("span")!;
    expect(span.className).toContain("oa-closed");
  });

  test("applies success variant classes", () => {
    const { container } = render(<Badge variant="success">Success</Badge>);
    const span = container.querySelector("span")!;
    expect(span.className).toContain("success");
  });

  test("applies error variant classes", () => {
    const { container } = render(<Badge variant="error">Error</Badge>);
    const span = container.querySelector("span")!;
    expect(span.className).toContain("error");
  });

  test("merges custom className with variant classes", () => {
    const { container } = render(<Badge className="my-custom">Label</Badge>);
    const span = container.querySelector("span")!;
    expect(span.className).toContain("my-custom");
  });

  test("passes additional HTML attributes", () => {
    render(<Badge data-testid="badge-test" aria-label="Open Access Gold">Gold</Badge>);
    const badge = screen.getByTestId("badge-test");
    expect(badge.getAttribute("aria-label")).toBe("Open Access Gold");
  });

  test("renders multiple children correctly", () => {
    render(
      <Badge>
        <span data-testid="icon">★</span>
        Gold
      </Badge>
    );
    expect(screen.getByTestId("icon")).toBeTruthy();
    expect(screen.getByText("Gold")).toBeTruthy();
  });
});
