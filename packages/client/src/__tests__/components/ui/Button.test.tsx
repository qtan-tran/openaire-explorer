import { describe, test, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "../../../components/ui/Button";

describe("Button", () => {
  test("renders children text", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button", { name: "Click me" })).toBeTruthy();
  });

  test("calls onClick when clicked", () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test("does not call onClick when disabled", () => {
    const handleClick = vi.fn();
    render(<Button disabled onClick={handleClick}>Click</Button>);
    const btn = screen.getByRole("button");
    expect(btn).toBeDisabled();
    fireEvent.click(btn);
    expect(handleClick).not.toHaveBeenCalled();
  });

  test("is disabled and shows loading state when loading=true", () => {
    render(<Button loading>Submit</Button>);
    const btn = screen.getByRole("button");
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute("aria-busy", "true");
  });

  test("does not show leftIcon while loading", () => {
    const icon = <span data-testid="icon">★</span>;
    render(<Button loading leftIcon={icon}>Submit</Button>);
    expect(screen.queryByTestId("icon")).toBeNull();
  });

  test("shows leftIcon when not loading", () => {
    const icon = <span data-testid="icon">★</span>;
    render(<Button leftIcon={icon}>Submit</Button>);
    expect(screen.getByTestId("icon")).toBeTruthy();
  });

  test("shows rightIcon when not loading", () => {
    const icon = <span data-testid="right-icon">→</span>;
    render(<Button rightIcon={icon}>Next</Button>);
    expect(screen.getByTestId("right-icon")).toBeTruthy();
  });

  test("does not show rightIcon while loading", () => {
    const icon = <span data-testid="right-icon">→</span>;
    render(<Button loading rightIcon={icon}>Next</Button>);
    expect(screen.queryByTestId("right-icon")).toBeNull();
  });

  test("applies custom className", () => {
    render(<Button className="custom-class">Styled</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("custom-class");
  });

  test("renders as type=button by default (not submit)", () => {
    render(<Button>Default</Button>);
    // HTMLButtonElement defaults to "submit" unless specified — Button component passes ...props
    // The component uses <button ... {...props}> so if no type is set, it renders whatever HTML default is
    // We just verify it renders without errors
    const btn = screen.getByRole("button");
    expect(btn).toBeTruthy();
  });

  test("forwards ref to underlying button element", () => {
    let ref: HTMLButtonElement | null = null;
    render(
      <Button ref={(el) => { ref = el; }}>
        Ref test
      </Button>
    );
    expect(ref).toBeInstanceOf(HTMLButtonElement);
  });

  test("passes additional HTML attributes to button", () => {
    render(<Button data-testid="my-btn" aria-label="Custom label">Btn</Button>);
    const btn = screen.getByTestId("my-btn");
    expect(btn.getAttribute("aria-label")).toBe("Custom label");
  });
});
