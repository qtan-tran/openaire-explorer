import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { SearchBar } from "../../../components/search/SearchBar";

describe("SearchBar", () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  test("renders the search input", () => {
    render(<SearchBar onSearch={vi.fn()} />);
    expect(screen.getByRole("searchbox")).toBeTruthy();
  });

  test("shows the provided defaultValue", () => {
    render(<SearchBar defaultValue="climate" onSearch={vi.fn()} />);
    const input = screen.getByRole("searchbox") as HTMLInputElement;
    expect(input.value).toBe("climate");
  });

  test("renders with correct placeholder text", () => {
    render(<SearchBar onSearch={vi.fn()} placeholder="Search here…" />);
    expect(screen.getByPlaceholderText("Search here…")).toBeTruthy();
  });

  test("calls onSearch after 300ms debounce when user types", async () => {
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);
    const input = screen.getByRole("searchbox");

    fireEvent.change(input, { target: { value: "quantum" } });

    // Not called yet
    expect(onSearch).not.toHaveBeenCalled();

    // Advance past debounce
    await act(async () => { vi.advanceTimersByTime(300); });

    expect(onSearch).toHaveBeenCalledTimes(1);
    expect(onSearch).toHaveBeenCalledWith("quantum");
  });

  test("does not call onSearch before debounce window", () => {
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);
    const input = screen.getByRole("searchbox");

    fireEvent.change(input, { target: { value: "test" } });
    vi.advanceTimersByTime(200);

    expect(onSearch).not.toHaveBeenCalled();
  });

  test("debounces rapid typing: only calls onSearch once with final value", async () => {
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);
    const input = screen.getByRole("searchbox");

    fireEvent.change(input, { target: { value: "q" } });
    vi.advanceTimersByTime(100);
    fireEvent.change(input, { target: { value: "qu" } });
    vi.advanceTimersByTime(100);
    fireEvent.change(input, { target: { value: "quantum" } });

    await act(async () => { vi.advanceTimersByTime(300); });

    expect(onSearch).toHaveBeenCalledTimes(1);
    expect(onSearch).toHaveBeenCalledWith("quantum");
  });

  test("shows clear button when input has a value", () => {
    render(<SearchBar defaultValue="climate" onSearch={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Clear search" })).toBeTruthy();
  });

  test("does not show clear button when input is empty", () => {
    render(<SearchBar onSearch={vi.fn()} />);
    expect(screen.queryByRole("button", { name: "Clear search" })).toBeNull();
  });

  test("clears input when clear button is clicked", async () => {
    const onSearch = vi.fn();
    render(<SearchBar defaultValue="climate" onSearch={onSearch} />);
    const clearBtn = screen.getByRole("button", { name: "Clear search" });
    fireEvent.click(clearBtn);

    const input = screen.getByRole("searchbox") as HTMLInputElement;
    expect(input.value).toBe("");
  });

  test("calls onSearch with empty string after clear", async () => {
    const onSearch = vi.fn();
    render(<SearchBar defaultValue="climate" onSearch={onSearch} />);
    fireEvent.click(screen.getByRole("button", { name: "Clear search" }));

    await act(async () => { vi.advanceTimersByTime(300); });

    expect(onSearch).toHaveBeenLastCalledWith("");
  });
});
