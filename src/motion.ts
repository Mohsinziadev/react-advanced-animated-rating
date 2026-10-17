import { prefersReducedMotion } from "./utils";

export type AnimationPreset = "none" | "subtle" | "spring" | "playful";

interface PresetMotion {
  pop: Keyframe[];
  popDuration: number;
  /** Keyframes for the other filled icons (a ripple leading up to the selection). */
  wave: Keyframe[] | null;
  waveDuration: number;
  stagger: number;
  easing: string;
  particles: number;
}

const SPRING = "cubic-bezier(0.34, 1.56, 0.64, 1)";

export const PRESETS: Record<Exclude<AnimationPreset, "none">, PresetMotion> = {
  subtle: {
    pop: [{ transform: "scale(1)" }, { transform: "scale(1.12)" }, { transform: "scale(1)" }],
    popDuration: 220,
    wave: null,
    waveDuration: 0,
    stagger: 0,
    easing: "ease-out",
    particles: 8,
  },
  spring: {
    pop: [
      { transform: "scale(1)" },
      { transform: "scale(1.32)", offset: 0.3 },
      { transform: "scale(0.92)", offset: 0.6 },
      { transform: "scale(1.04)", offset: 0.82 },
      { transform: "scale(1)" },
    ],
    popDuration: 520,
    wave: [{ transform: "scale(1)" }, { transform: "scale(1.12)" }, { transform: "scale(1)" }],
    waveDuration: 280,
    stagger: 35,
    easing: "ease-out",
    particles: 12,
  },
  playful: {
    pop: [
      { transform: "scale(1) rotate(0deg)" },
      { transform: "scale(1.5) rotate(-14deg)", offset: 0.3 },
      { transform: "scale(0.88) rotate(8deg)", offset: 0.58 },
      { transform: "scale(1.08) rotate(-3deg)", offset: 0.8 },
      { transform: "scale(1) rotate(0deg)" },
    ],
    popDuration: 680,
    wave: [
      { transform: "translateY(0) scale(1)" },
      { transform: "translateY(-18%) scale(1.16)" },
      { transform: "translateY(0) scale(1)" },
    ],
    waveDuration: 360,
    stagger: 45,
    easing: SPRING,
    particles: 16,
  },
};

function canAnimate(el: Element | null): el is HTMLElement {
  return !!el && typeof (el as HTMLElement).animate === "function" && !prefersReducedMotion();
}

/**
 * Plays the "commit" animation: a ripple across the filled icons and a pop on the
 * selected one. Runs on DOM nodes directly so it never causes React re-renders.
 */
export function playCommit(
  control: HTMLElement | null,
  selectedIndex: number,
  preset: AnimationPreset,
  highlight: "range" | "single",
): void {
  if (preset === "none" || !control || selectedIndex < 0) return;
  const motion = PRESETS[preset];
  const items = control.querySelectorAll<HTMLElement>("[data-rar-item] > .rar-motion");
  const selected = items[selectedIndex];
  if (!canAnimate(selected)) return;

  if (motion.wave && highlight === "range") {
    for (let i = 0; i < selectedIndex; i++) {
      items[i].animate(motion.wave, {
        duration: motion.waveDuration,
        delay: i * motion.stagger,
        easing: motion.easing,
      });
    }
  }
  selected.animate(motion.pop, {
    duration: motion.popDuration,
    delay: highlight === "range" ? selectedIndex * motion.stagger : 0,
    easing: "ease-out",
  });
}

/** A short "nudge" used when a keyboard step hits a boundary or a read-only control is pressed. */
export function playNudge(el: HTMLElement | null): void {
  if (!canAnimate(el)) return;
  el.animate(
    [
      { transform: "translateX(0)" },
      { transform: "translateX(-3px)" },
      { transform: "translateX(3px)" },
      { transform: "translateX(0)" },
    ],
    { duration: 240, easing: "ease-in-out" },
  );
}

/**
 * Bursts particles out of `anchor` (an icon). Particles are plain absolutely-positioned
 * spans animated with the Web Animations API and removed when they finish.
 */
export function burst(anchor: HTMLElement | null, preset: AnimationPreset, color?: string): void {
  if (preset === "none" || !canAnimate(anchor) || typeof document === "undefined") return;
  const motion = PRESETS[preset];
  const tint = color || getComputedStyle(anchor).getPropertyValue("--rar-active-color").trim() || "#f5a524";

  anchor.querySelector(":scope > .rar-burst")?.remove();
  const layer = document.createElement("span");
  layer.className = "rar-burst";
  layer.setAttribute("aria-hidden", "true");
  anchor.appendChild(layer);

  const size = anchor.getBoundingClientRect().width || 28;
  const count = motion.particles;
  const animations: Animation[] = [];

  // Expanding ring
  const ring = document.createElement("span");
  ring.className = "rar-burst-ring";
  ring.style.borderColor = tint;
  layer.appendChild(ring);
  animations.push(
    ring.animate(
      [
        { transform: "translate(-50%, -50%) scale(0.4)", opacity: 0.7 },
        { transform: "translate(-50%, -50%) scale(2.1)", opacity: 0 },
      ],
      { duration: 520, easing: "cubic-bezier(0.2, 0.7, 0.3, 1)", fill: "forwards" },
    ),
  );

  for (let i = 0; i < count; i++) {
    const p = document.createElement("span");
    const sparkle = i % 3 === 0;
    p.className = sparkle ? "rar-particle rar-particle--sparkle" : "rar-particle";
    p.style.background = tint;
    const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
    const distance = size * (0.75 + Math.random() * 0.55);
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance;
    const scale = sparkle ? 1.1 : 0.6 + Math.random() * 0.5;
    layer.appendChild(p);
    animations.push(
      p.animate(
        [
          { transform: "translate(-50%, -50%) scale(0) rotate(0deg)", opacity: 1 },
          {
            transform: `translate(calc(-50% + ${dx * 0.7}px), calc(-50% + ${dy * 0.7}px)) scale(${scale}) rotate(90deg)`,
            opacity: 1,
            offset: 0.45,
          },
          {
            transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy + size * 0.15}px)) scale(0) rotate(180deg)`,
            opacity: 0,
          },
        ],
        {
          duration: 620 + Math.random() * 260,
          delay: Math.random() * 60,
          easing: "cubic-bezier(0.15, 0.6, 0.35, 1)",
          fill: "forwards",
        },
      ),
    );
  }

  Promise.all(animations.map((a) => a.finished))
    .catch(() => undefined)
    .then(() => layer.remove());
}
