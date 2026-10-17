import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { Rating } from "../Rating";

const slider = () => screen.getByRole("slider");
const items = (container: HTMLElement) => Array.from(container.querySelectorAll<HTMLElement>("[data-rar-item]"));
const fills = (container: HTMLElement) => items(container).map((el) => Number(el.style.getPropertyValue("--rar-fill")));

/** Gives every item a real-looking layout: 30px wide, starting at x = index * 34. */
function mockLayout() {
  return vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
    const index = this.dataset.rarItem;
    if (index === undefined) return new DOMRect(0, 0, 0, 0);
    return new DOMRect(Number(index) * 34, 0, 30, 30);
  });
}

describe("Rating — rendering & semantics", () => {
  it("renders `max` items and exposes slider semantics", () => {
    const { container } = render(<Rating max={7} defaultValue={3} aria-label="Quality" />);
    expect(items(container)).toHaveLength(7);
    const el = slider();
    expect(el).toHaveAttribute("aria-valuemin", "0");
    expect(el).toHaveAttribute("aria-valuemax", "7");
    expect(el).toHaveAttribute("aria-valuenow", "3");
    expect(el).toHaveAttribute("aria-valuetext", "3 out of 7");
    expect(el).toHaveAccessibleName("Quality");
    expect(el).toHaveAttribute("tabindex", "0");
  });

  it("uses a visible label as the accessible name", () => {
    render(<Rating label="Rate your stay" />);
    expect(slider()).toHaveAccessibleName("Rate your stay");
  });

  it("announces labels in aria-valuetext", () => {
    render(<Rating defaultValue={4} labels={["Awful", "Poor", "OK", "Good", "Excellent"]} />);
    expect(slider()).toHaveAttribute("aria-valuetext", "4 out of 5, Good");
  });

  it("supports custom getLabelText for i18n", () => {
    render(<Rating defaultValue={2} getLabelText={(v, { max }) => `${v} de ${max} estrellas`} />);
    expect(slider()).toHaveAttribute("aria-valuetext", "2 de 5 estrellas");
  });

  it("renders read-only ratings as an image with the value in its name", () => {
    render(<Rating readOnly value={4.3} label="Average" />);
    const img = screen.getByRole("img");
    expect(img).toHaveAccessibleName("Average, Rated 4.3 out of 5");
    expect(screen.queryByRole("slider")).toBeNull();
  });

  it("shows exact fractional fills when read-only and no precision is given", () => {
    const { container } = render(<Rating readOnly value={3.7} />);
    expect(fills(container).map((f) => Number(f.toFixed(2)))).toEqual([1, 1, 1, 0.7, 0]);
  });

  it("snaps read-only values when a precision is given", () => {
    const { container } = render(<Rating readOnly value={3.7} precision={0.5} />);
    expect(fills(container)).toEqual([1, 1, 1, 0.5, 0]);
  });

  it("links helper text and error messages via aria-describedby", () => {
    const { rerender } = render(<Rating helperText="Tap a star" />);
    expect(slider()).toHaveAccessibleDescription("Tap a star");
    expect(slider()).not.toHaveAttribute("aria-invalid");
    rerender(<Rating helperText="Tap a star" error="A rating is required" />);
    expect(slider()).toHaveAccessibleDescription("A rating is required");
    expect(slider()).toHaveAttribute("aria-invalid", "true");
  });

  it("marks items as presentational", () => {
    const { container } = render(<Rating />);
    items(container).forEach((el) => expect(el).toHaveAttribute("aria-hidden", "true"));
  });
});

describe("Rating — pointer interaction", () => {
  it("selects a value on click (uncontrolled) and calls onChange", async () => {
    const onChange = vi.fn();
    const { container } = render(<Rating onChange={onChange} />);
    await userEvent.click(items(container)[3]);
    expect(onChange).toHaveBeenCalledWith(4);
    expect(slider()).toHaveAttribute("aria-valuenow", "4");
  });

  it("clears when clicking the current value (allowClear)", async () => {
    const onChange = vi.fn();
    const { container } = render(<Rating defaultValue={3} onChange={onChange} />);
    await userEvent.click(items(container)[2]);
    expect(onChange).toHaveBeenLastCalledWith(0);
    expect(slider()).toHaveAttribute("aria-valuenow", "0");
  });

  it("does not clear when allowClear is false", async () => {
    const onChange = vi.fn();
    const { container } = render(<Rating defaultValue={3} allowClear={false} onChange={onChange} />);
    await userEvent.click(items(container)[2]);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("previews on hover without changing the value", async () => {
    const onHoverChange = vi.fn();
    const { container } = render(<Rating defaultValue={1} onHoverChange={onHoverChange} />);
    await userEvent.hover(items(container)[4]);
    expect(onHoverChange).toHaveBeenLastCalledWith(5);
    expect(fills(container)).toEqual([1, 1, 1, 1, 1]);
    expect(slider()).toHaveAttribute("aria-valuenow", "1");
    await userEvent.unhover(slider());
    expect(onHoverChange).toHaveBeenLastCalledWith(null);
    expect(fills(container)).toEqual([1, 0, 0, 0, 0]);
  });

  it("resolves half values from the pointer position", () => {
    const spy = mockLayout();
    const onChange = vi.fn();
    const { container } = render(<Rating precision={0.5} onChange={onChange} />);
    const third = items(container)[2]; // spans x = 68..98
    fireEvent.click(third, { clientX: 72 });
    expect(onChange).toHaveBeenLastCalledWith(2.5);
    fireEvent.click(third, { clientX: 95 });
    expect(onChange).toHaveBeenLastCalledWith(3);
    spy.mockRestore();
  });

  it("supports arbitrary precision such as tenths", () => {
    const spy = mockLayout();
    const onChange = vi.fn();
    const { container } = render(<Rating precision={0.1} onChange={onChange} />);
    fireEvent.click(items(container)[1], { clientX: 34 + 30 * 0.42 });
    expect(onChange).toHaveBeenLastCalledWith(1.5);
    spy.mockRestore();
  });

  it("mirrors pointer math in RTL", () => {
    const spy = mockLayout();
    const onChange = vi.fn();
    const { container } = render(<Rating dir="rtl" precision={0.5} onChange={onChange} />);
    // In RTL the fill starts at the right edge, so the right half of an item is the first half.
    fireEvent.click(items(container)[0], { clientX: 26 });
    expect(onChange).toHaveBeenLastCalledWith(0.5);
    spy.mockRestore();
  });

  it("ignores interaction when read-only or disabled", async () => {
    const onChange = vi.fn();
    const { container, rerender } = render(<Rating readOnly value={2} onChange={onChange} />);
    await userEvent.click(items(container)[4]);
    rerender(<Rating disabled value={2} onChange={onChange} />);
    expect(slider()).toHaveAttribute("aria-disabled", "true");
    expect(slider()).toHaveAttribute("tabindex", "-1");
    await userEvent.click(items(container)[4]);
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe("Rating — controlled mode", () => {
  it("does not change unless the parent updates `value`", async () => {
    const onChange = vi.fn();
    const { container } = render(<Rating value={2} onChange={onChange} />);
    await userEvent.click(items(container)[4]);
    expect(onChange).toHaveBeenCalledWith(5);
    expect(slider()).toHaveAttribute("aria-valuenow", "2");
  });

  it("follows the parent's state", async () => {
    function Controlled() {
      const [v, setV] = React.useState(1);
      return (
        <>
          <Rating value={v} onChange={setV} />
          <button onClick={() => setV(0)}>reset</button>
        </>
      );
    }
    const { container } = render(<Controlled />);
    await userEvent.click(items(container)[3]);
    expect(slider()).toHaveAttribute("aria-valuenow", "4");
    await userEvent.click(screen.getByText("reset"));
    expect(slider()).toHaveAttribute("aria-valuenow", "0");
  });
});

describe("Rating — keyboard", () => {
  it("implements the slider keyboard pattern", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Rating defaultValue={2} onChange={onChange} />);
    await user.tab();
    expect(slider()).toHaveFocus();

    await user.keyboard("{ArrowRight}");
    expect(slider()).toHaveAttribute("aria-valuenow", "3");
    await user.keyboard("{ArrowUp}");
    expect(slider()).toHaveAttribute("aria-valuenow", "4");
    await user.keyboard("{ArrowLeft}{ArrowDown}");
    expect(slider()).toHaveAttribute("aria-valuenow", "2");
    await user.keyboard("{End}");
    expect(slider()).toHaveAttribute("aria-valuenow", "5");
    await user.keyboard("{Home}");
    expect(slider()).toHaveAttribute("aria-valuenow", "0");
    await user.keyboard("4");
    expect(slider()).toHaveAttribute("aria-valuenow", "4");
    await user.keyboard("{Backspace}");
    expect(slider()).toHaveAttribute("aria-valuenow", "0");
    expect(onChange.mock.calls.map((c) => c[0])).toEqual([3, 4, 3, 2, 5, 0, 4, 0]);
  });

  it("steps by precision and stays within bounds", async () => {
    const user = userEvent.setup();
    render(<Rating defaultValue={4.5} precision={0.5} />);
    slider().focus();
    await user.keyboard("{ArrowRight}{ArrowRight}{ArrowRight}");
    expect(slider()).toHaveAttribute("aria-valuenow", "5");
    await user.keyboard("{PageDown}");
    expect(slider()).toHaveAttribute("aria-valuenow", "4");
    await user.keyboard("{ArrowLeft}");
    expect(slider()).toHaveAttribute("aria-valuenow", "3.5");
  });

  it("does not go below one step when clearing is disabled", async () => {
    const user = userEvent.setup();
    render(<Rating defaultValue={1} allowClear={false} />);
    slider().focus();
    await user.keyboard("{ArrowLeft}{Home}{Delete}0");
    expect(slider()).toHaveAttribute("aria-valuenow", "1");
  });

  it("ignores digits above max", async () => {
    const user = userEvent.setup();
    render(<Rating max={3} defaultValue={1} />);
    slider().focus();
    await user.keyboard("7");
    expect(slider()).toHaveAttribute("aria-valuenow", "1");
  });

  it("flips horizontal arrows in RTL", async () => {
    const user = userEvent.setup();
    render(<Rating dir="rtl" defaultValue={2} />);
    slider().focus();
    await user.keyboard("{ArrowLeft}");
    expect(slider()).toHaveAttribute("aria-valuenow", "3");
  });
});

describe("Rating — values & edge cases", () => {
  it.each([
    [Number.NaN, "0"],
    [-3, "0"],
    [99, "5"],
    [Infinity, "0"],
    [2.26, "2"],
  ])("sanitises value %s → %s", (input, expected) => {
    render(<Rating value={input} />);
    expect(slider()).toHaveAttribute("aria-valuenow", expected);
  });

  it("falls back to safe defaults for invalid max/precision", () => {
    const { container } = render(<Rating max={-2} precision={7} defaultValue={2.5} />);
    expect(items(container)).toHaveLength(5);
    expect(slider()).toHaveAttribute("aria-valuenow", "3");
  });

  it("highlights only the selected item in single mode", () => {
    const { container } = render(<Rating highlight="single" defaultValue={3} />);
    expect(fills(container)).toEqual([0, 0, 1, 0, 0]);
  });

  it("uses single highlight by default for smileys", () => {
    const { container } = render(<Rating icon="smiley" defaultValue={2} />);
    expect(fills(container)).toEqual([0, 1, 0, 0, 0]);
  });

  it("picks colours from a colour scale based on the value", () => {
    const { container, rerender } = render(<Rating value={1} color={["red", "yellow", "green"]} />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.getPropertyValue("--rar-active-color")).toBe("red");
    rerender(<Rating value={5} color={["red", "yellow", "green"]} />);
    expect(root.style.getPropertyValue("--rar-active-color")).toBe("green");
    rerender(<Rating value={3} color={(v) => (v > 2 ? "blue" : "gray")} />);
    expect(root.style.getPropertyValue("--rar-active-color")).toBe("blue");
  });

  it("renders custom icons, emoji and render functions", () => {
    const { container, rerender } = render(<Rating icon={<svg data-testid="custom" />} max={2} />);
    expect(screen.getAllByTestId("custom")).toHaveLength(4); // empty + fill layer per item
    rerender(<Rating icon="🔥" max={1} />);
    expect(container.querySelectorAll(".rar-glyph")[0]).toHaveTextContent("🔥");
    rerender(<Rating icon={({ value, filled }) => <b>{filled ? `F${value}` : `E${value}`}</b>} max={2} />);
    expect(container.textContent).toContain("F2");
    expect(container.textContent).toContain("E1");
  });

  it("forwards refs and rest props to the root element", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<Rating ref={ref} data-testid="root" className="mine" />);
    expect(ref.current).toBe(screen.getByTestId("root"));
    expect(ref.current).toHaveClass("rar", "mine");
  });

  it("shows a visible label and tooltip while hovering", async () => {
    const { container } = render(<Rating showLabel tooltip labels={["1", "2", "Good", "4", "5"]} />);
    await userEvent.hover(items(container)[2]);
    expect(container.querySelector(".rar-tooltip")).toHaveTextContent("Good");
    expect(container.querySelector(".rar-value")).toHaveTextContent("Good");
  });
});

describe("Rating — forms", () => {
  it("submits its value through a hidden input", async () => {
    const { container } = render(
      <form>
        <Rating name="score" defaultValue={3} />
      </form>,
    );
    const input = container.querySelector<HTMLInputElement>('input[name="score"]')!;
    expect(input.value).toBe("3");
    await userEvent.click(items(container)[0]);
    expect(input.value).toBe("1");
  });

  it("resets with the form when uncontrolled", async () => {
    const { container } = render(
      <form>
        <Rating name="score" defaultValue={2} />
        <button type="reset">Reset</button>
      </form>,
    );
    await userEvent.click(items(container)[4]);
    expect(slider()).toHaveAttribute("aria-valuenow", "5");
    await userEvent.click(screen.getByText("Reset"));
    expect(slider()).toHaveAttribute("aria-valuenow", "2");
  });

  it("blocks submission when required and empty, then shows a message and focuses the control", async () => {
    const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());
    const { container } = render(
      <form onSubmit={onSubmit}>
        <Rating name="score" required requiredMessage="Pick a score" />
        <button type="submit">Send</button>
      </form>,
    );
    await userEvent.click(screen.getByText("Send"));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(slider()).toHaveFocus();
    expect(slider()).toHaveAttribute("aria-invalid", "true");
    expect(slider()).toHaveAccessibleDescription("Pick a score");

    await userEvent.click(items(container)[3]);
    expect(slider()).not.toHaveAttribute("aria-invalid");
    await userEvent.click(screen.getByText("Send"));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});

describe("Rating — 2.x compatibility", () => {
  it("treats `rating` without `editable` as read-only", () => {
    render(<Rating rating={4} />);
    expect(screen.getByRole("img")).toHaveAccessibleName("Rated 4 out of 5");
  });

  it("supports editable/starColor/backgroundClass/onChange", async () => {
    const onChange = vi.fn();
    const { container } = render(
      <Rating rating={2} editable starColor="#FFDF00" backgroundClass="legacy-bg" onChange={onChange} />,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.getPropertyValue("--rar-active-color")).toBe("#FFDF00");
    expect(items(container)[0]).toHaveClass("legacy-bg");
    await userEvent.click(items(container)[4]);
    expect(onChange).toHaveBeenCalledWith(5);
    // 2.x updated locally even if the parent ignored onChange
    expect(slider()).toHaveAttribute("aria-valuenow", "5");
  });

  it("re-syncs when the `rating` prop changes", () => {
    const { rerender } = render(<Rating rating={2} editable />);
    rerender(<Rating rating={4} editable />);
    expect(slider()).toHaveAttribute("aria-valuenow", "4");
  });

  it("maps enableAnimation={false} to the none preset", () => {
    const { container } = render(<Rating rating={2} enableAnimation={false} />);
    expect(container.firstElementChild).toHaveAttribute("data-animation", "none");
  });
});

describe("Rating — animation hooks", () => {
  it("plays commit animations through the Web Animations API when available", async () => {
    // `finished` never settles so the particle layer stays mounted for the assertion.
    const animate = vi.fn(() => ({ finished: new Promise(() => undefined) }) as unknown as Animation);
    // jsdom has no WAAPI; provide a stub to observe calls.
    Object.defineProperty(HTMLElement.prototype, "animate", { value: animate, configurable: true });
    const { container } = render(<Rating animation="spring" celebrate />);
    await userEvent.click(items(container)[2]);
    expect(animate).toHaveBeenCalled();
    // celebrate adds a particle layer to the selected item
    expect(items(container)[2].querySelector(".rar-burst")).not.toBeNull();
    await act(async () => {});
    delete (HTMLElement.prototype as { animate?: unknown }).animate;
  });

  it("does not animate when animation is none", async () => {
    const animate = vi.fn();
    Object.defineProperty(HTMLElement.prototype, "animate", { value: animate, configurable: true });
    const { container } = render(<Rating animation="none" celebrate />);
    await userEvent.click(items(container)[2]);
    expect(animate).not.toHaveBeenCalled();
    delete (HTMLElement.prototype as { animate?: unknown }).animate;
  });
});

describe("Rating — developer experience", () => {
  it("warns once in development when the stylesheet is missing", () => {
    const env = process!.env;
    const previous = env.NODE_ENV;
    env.NODE_ENV = "development";
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    render(<Rating />);
    render(<Rating />);
    env.NODE_ENV = previous;
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toContain('import "react-advanced-rating/styles.css"');
    warn.mockRestore();
  });

  it("does not pop or celebrate when the value changes programmatically", () => {
    const animate = vi.fn();
    Object.defineProperty(HTMLElement.prototype, "animate", { value: animate, configurable: true });
    const { rerender } = render(<Rating value={1} celebrate />);
    rerender(<Rating value={5} celebrate />);
    expect(animate).not.toHaveBeenCalled();
    delete (HTMLElement.prototype as { animate?: unknown }).animate;
  });

  it("marks the fill cascade direction after a value change", () => {
    const { rerender } = render(<Rating value={1} />);
    rerender(<Rating value={4} />);
    expect(slider()).toHaveAttribute("data-cascade", "up");
    expect(slider().style.getPropertyValue("--rar-from")).toBe("1");
    rerender(<Rating value={2} />);
    expect(slider()).toHaveAttribute("data-cascade", "down");
  });
});

