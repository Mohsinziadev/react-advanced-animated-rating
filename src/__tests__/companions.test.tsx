import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { act } from "react";
import { describe, expect, it, vi } from "vitest";
import {
  ExperienceRating,
  Rating,
  RatingSummary,
  ThumbsRating,
  computeRatingStats,
  moodForValue,
  useRating,
} from "../index";
import { ceilToStep, decimalsOf, pickColor, roundToStep, sanitizeValue } from "../utils";

describe("utils", () => {
  it("rounds without float noise", () => {
    expect(roundToStep(0.1 + 0.2, 0.1)).toBe(0.3);
    expect(roundToStep(2.26, 0.25)).toBe(2.25);
    expect(ceilToStep(0.51, 0.5)).toBe(1);
    expect(ceilToStep(0.5, 0.5)).toBe(0.5);
    expect(decimalsOf(0.25)).toBe(2);
    expect(decimalsOf(1e-7)).toBe(7);
  });

  it("sanitises values", () => {
    expect(sanitizeValue("3", 5)).toBe(3);
    expect(sanitizeValue(undefined, 5)).toBe(0);
    expect(sanitizeValue(7, 5)).toBe(5);
  });

  it("spreads palettes over the scale", () => {
    const palette = ["a", "b", "c", "d", "e"];
    expect([1, 2, 3, 4, 5].map((v) => pickColor(palette, v, 5))).toEqual(palette);
    expect(pickColor(["x", "y"], 3, 10)).toBe("x");
    expect(pickColor(["x", "y"], 10, 10)).toBe("y");
  });
});

describe("computeRatingStats", () => {
  it("computes average, totals and percentages that sum to 100", () => {
    const stats = computeRatingStats({ 5: 120, 4: 40, 3: 10, 2: 4, 1: 6 });
    expect(stats.total).toBe(180);
    expect(stats.average).toBe(4.47); // 804 / 180
    expect(stats.percentages.reduce((a, b) => a + b, 0)).toBe(100);
    expect(stats.counts).toEqual([6, 4, 10, 40, 120]);
  });

  it("accepts arrays and handles empty or bad input", () => {
    expect(computeRatingStats([1, 1, 1]).percentages.reduce((a, b) => a + b)).toBe(100);
    expect(computeRatingStats([], 5)).toEqual({ average: 0, total: 0, counts: [0, 0, 0, 0, 0], percentages: [0, 0, 0, 0, 0] });
    expect(computeRatingStats({ 5: -3, 4: Number.NaN, 3: 2 }).total).toBe(2);
  });
});

describe("RatingSummary", () => {
  it("renders the average, total and accessible rows", () => {
    render(<RatingSummary distribution={{ 5: 3, 4: 1 }} />);
    expect(screen.getByRole("img")).toHaveAccessibleName("Rated 4.75 out of 5");
    expect(screen.getByText("4 reviews")).toBeInTheDocument();
    expect(screen.getByText("5 stars: 3 reviews, 75%")).toBeInTheDocument();
  });

  it("acts as a filter when onSelect is given", async () => {
    const onSelect = vi.fn();
    const { rerender } = render(<RatingSummary distribution={{ 5: 3, 4: 1 }} onSelect={onSelect} />);
    await userEvent.click(screen.getByRole("button", { name: /^5 stars/ }));
    expect(onSelect).toHaveBeenLastCalledWith(5);
    expect(screen.getByRole("button", { name: /^1 star:/ })).toBeDisabled();
    rerender(<RatingSummary distribution={{ 5: 3, 4: 1 }} onSelect={onSelect} selected={5} />);
    const five = screen.getByRole("button", { name: /^5 stars/ });
    expect(five).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(five);
    expect(onSelect).toHaveBeenLastCalledWith(null);
  });
});

describe("ThumbsRating", () => {
  it("toggles between up, down and null", async () => {
    const onChange = vi.fn();
    render(<ThumbsRating aria-label="Was this helpful?" onChange={onChange} counts={{ up: 12 }} />);
    expect(screen.getByRole("group")).toHaveAccessibleName("Was this helpful?");
    const up = screen.getByRole("button", { name: "Helpful (12)" });
    const down = screen.getByRole("button", { name: "Not helpful" });
    await userEvent.click(up);
    expect(up).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(down);
    expect(up).toHaveAttribute("aria-pressed", "false");
    expect(down).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(down);
    expect(down).toHaveAttribute("aria-pressed", "false");
    expect(onChange.mock.calls.map((c) => c[0])).toEqual(["up", "down", null]);
  });

  it("does not change when read-only", async () => {
    const onChange = vi.fn();
    render(<ThumbsRating readOnly defaultValue="up" onChange={onChange} />);
    await userEvent.click(screen.getByRole("button", { name: "Not helpful" }));
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe("ExperienceRating", () => {
  it("labels the stars with the title and follows the value with the mascot", async () => {
    const onChange = vi.fn();
    const { container } = render(<ExperienceRating onChange={onChange} />);
    const slider = screen.getByRole("slider", { name: "Rate your experience" });
    const mascot = container.querySelector(".rar-xp-mascot");
    expect(mascot).toHaveAttribute("data-mood", "0");
    expect(mascot).toHaveAttribute("aria-hidden", "true");
    await userEvent.click(container.querySelectorAll("[data-rar-item]")[3]);
    expect(onChange).toHaveBeenLastCalledWith(4);
    expect(slider).toHaveAttribute("aria-valuetext", "4 out of 5, Good");
    expect(mascot).toHaveAttribute("data-mood", "4");
    expect(screen.getByText("(Good)")).toBeInTheDocument();
  });

  it("renders a close button only when onClose is given", async () => {
    const onClose = vi.fn();
    const { rerender } = render(<ExperienceRating defaultValue={2} />);
    expect(screen.queryByRole("button", { name: "Close" })).toBeNull();
    rerender(<ExperienceRating defaultValue={2} onClose={onClose} closeLabel="Dismiss" />);
    await userEvent.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("maps any scale to the five moods", () => {
    expect([0, 1, 2, 3, 4, 5].map((v) => moodForValue(v))).toEqual([0, 1, 2, 3, 4, 5]);
    expect(moodForValue(0.5)).toBe(1);
    expect(moodForValue(10, 10)).toBe(5);
    expect(moodForValue(5, 10)).toBe(3);
  });
});

describe("useRating (headless)", () => {
  function PillScale() {
    const rating = useRating({ max: 3, defaultValue: 1, labels: ["Low", "Mid", "High"] });
    return (
      <div {...rating.getControlProps()} aria-label="Priority">
        {rating.items.map((i) => (
          <span key={i} {...rating.getItemProps(i)} data-on={rating.getItemState(i).isFilled}>
            ●
          </span>
        ))}
        <output>{rating.label}</output>
      </div>
    );
  }

  it("powers fully custom markup", async () => {
    const { container } = render(<PillScale />);
    const el = screen.getByRole("slider", { name: "Priority" });
    expect(el).toHaveAttribute("aria-valuetext", "1 out of 3, Low");
    await userEvent.click(container.querySelectorAll("[data-rar-item]")[2]);
    expect(el).toHaveAttribute("aria-valuenow", "3");
    expect(screen.getByText("High")).toBeInTheDocument();
  });
});

describe("SSR", () => {
  it("renders on the server and hydrates without mismatches", async () => {
    const app = (
      <div>
        <Rating defaultValue={3.5} precision={0.5} label="Score" showLabel name="score" />
        <Rating readOnly value={4.2} />
        <ThumbsRating defaultValue="up" />
        <RatingSummary distribution={[1, 2, 3, 4, 5]} />
        <ExperienceRating defaultValue={3} onClose={() => undefined} />
      </div>
    );
    const html = renderToString(app);
    expect(html).toContain('role="slider"');
    expect(html).toContain('aria-valuenow="3.5"');

    const container = document.createElement("div");
    container.innerHTML = html;
    document.body.appendChild(container);
    const errors = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const recoverable = vi.fn();
    await act(async () => {
      hydrateRoot(container, app, { onRecoverableError: recoverable });
    });
    expect(recoverable).not.toHaveBeenCalled();
    expect(errors).not.toHaveBeenCalled();
    errors.mockRestore();
    container.remove();
  });
});
