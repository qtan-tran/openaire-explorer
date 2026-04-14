import { describe, test, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Pagination } from "../../../components/search/Pagination";

describe("Pagination", () => {
  test("returns null when totalPages <= 1", () => {
    const { container } = render(
      <Pagination page={1} totalPages={1} onPageChange={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  test("returns null when totalPages is 0", () => {
    const { container } = render(
      <Pagination page={1} totalPages={0} onPageChange={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  test("renders a nav element with aria-label Pagination", () => {
    render(<Pagination page={1} totalPages={5} onPageChange={vi.fn()} />);
    expect(screen.getByRole("navigation", { name: "Pagination" })).toBeTruthy();
  });

  test("renders prev and next buttons", () => {
    render(<Pagination page={3} totalPages={5} onPageChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Previous page" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Next page" })).toBeTruthy();
  });

  test("prev button is disabled on first page", () => {
    render(<Pagination page={1} totalPages={5} onPageChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Previous page" })).toBeDisabled();
  });

  test("next button is disabled on last page", () => {
    render(<Pagination page={5} totalPages={5} onPageChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Next page" })).toBeDisabled();
  });

  test("calls onPageChange with page-1 when prev is clicked", () => {
    const onPageChange = vi.fn();
    render(<Pagination page={3} totalPages={5} onPageChange={onPageChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Previous page" }));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  test("calls onPageChange with page+1 when next is clicked", () => {
    const onPageChange = vi.fn();
    render(<Pagination page={3} totalPages={5} onPageChange={onPageChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Next page" }));
    expect(onPageChange).toHaveBeenCalledWith(4);
  });

  test("calls onPageChange with correct page when a page number is clicked", () => {
    const onPageChange = vi.fn();
    render(<Pagination page={1} totalPages={5} onPageChange={onPageChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Page 3" }));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  test("renders all page numbers when totalPages <= 7", () => {
    render(<Pagination page={1} totalPages={5} onPageChange={vi.fn()} />);
    for (let i = 1; i <= 5; i++) {
      expect(screen.getByRole("button", { name: `Page ${i}` })).toBeTruthy();
    }
  });

  test("renders ellipsis for large page counts", () => {
    render(<Pagination page={5} totalPages={20} onPageChange={vi.fn()} />);
    const ellipses = screen.getAllByText("…");
    expect(ellipses.length).toBeGreaterThan(0);
  });

  test("current page button has aria-current=page", () => {
    render(<Pagination page={3} totalPages={5} onPageChange={vi.fn()} />);
    const currentBtn = screen.getByRole("button", { name: "Page 3" });
    expect(currentBtn.getAttribute("aria-current")).toBe("page");
  });

  test("non-current page buttons do not have aria-current", () => {
    render(<Pagination page={3} totalPages={5} onPageChange={vi.fn()} />);
    const page1Btn = screen.getByRole("button", { name: "Page 1" });
    expect(page1Btn.getAttribute("aria-current")).toBeNull();
  });
});
