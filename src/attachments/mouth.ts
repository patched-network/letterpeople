// src/attachments/mouth.ts

const svgNS = "http://www.w3.org/2000/svg";

// Helper function for linear interpolation
function lerp(a: number, b: number, t: number): number {
  return a * (1 - t) + b * t;
}

// Clamp a value between min and max
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(value, max));
}

/**
 * Parameters controlling the dynamic shape of the morphing mouth.
 */
export interface MouthParameters {
  /**
   * Controls the transition from a curve to a circle.
   * 0: Collapsed to a curve (mood determines smile/frown).
   * 1: Full circle.
   * Values between 0 and 1 create intermediate elliptical shapes.
   * Clamped between 0 and 1.
   */
  openness: number; // 0-1

  /**
   * Controls the curvature from frown to smile, most prominent when openness is low.
   * 0: Maximum frown.
   * 0.5: Neutral horizontal line/ellipse.
   * 1: Maximum smile.
   * Clamped between 0 and 1.
   */
  mood: number; // 0-1
}

/**
 * Static options for customizing the appearance of the morphing mouth.
 */
export interface MouthAppearanceOptions {
  /** The maximum horizontal width of the mouth. Defaults to 20. */
  width?: number;
  /** Fill color for the mouth shape. Defaults to 'black'. Use 'none' for no fill. */
  fillColor?: string;
  /** Stroke color for the mouth outline. Defaults to 'none'. */
  strokeColor?: string;
  /** Stroke width for the mouth outline. Defaults to 1. Only visible if strokeColor is not 'none'. */
  strokeWidth?: number;
  /** Maximum curvature influence for mood (as ratio of width/2). Defaults to 0.6. */
  maxMoodInfluenceRatio?: number;
}

// --- Default values ---
const DEFAULT_MOUTH_WIDTH = 20;
const DEFAULT_FILL_COLOR = "black";
const DEFAULT_STROKE_COLOR = "none";
const DEFAULT_STROKE_WIDTH = 1;
const DEFAULT_MAX_MOOD_RATIO = 0.6;

/**
 * Creates SVG elements representing a morphable mouth shape.
 * The shape transitions between a curve (smile/frown) and a circle based on parameters.
 *
 * @param x - The desired center X coordinate for the mouth.
 * @param y - The desired center Y coordinate for the mouth baseline.
 * @param params - Dynamic parameters controlling the mouth shape (openness, mood).
 * @param options - Optional static configuration for the mouth's appearance.
 * @returns An SVGGElement containing the mouth path.
 */
export function createMorphingMouth(
  x: number,
  y: number,
  params: MouthParameters,
  options?: MouthAppearanceOptions,
): SVGGElement {
  // Process options with defaults
  const width = options?.width ?? DEFAULT_MOUTH_WIDTH;
  const fillColor = options?.fillColor ?? DEFAULT_FILL_COLOR;
  const strokeColor = options?.strokeColor ?? DEFAULT_STROKE_COLOR;
  const strokeWidth = options?.strokeWidth ?? DEFAULT_STROKE_WIDTH;
  const maxMoodRatio = options?.maxMoodInfluenceRatio ?? DEFAULT_MAX_MOOD_RATIO;

  // Clamp parameters for safety
  const openness = clamp(params.openness, 0, 1);
  const mood = clamp(params.mood, 0, 1);

  // --- Calculate Path Parameters ---
  const rx = Math.max(0.1, width / 2); // Ensure rx is slightly positive

  // Minimum vertical radius (increased slightly to avoid potential zero/degenerate cases)
  const min_ry = Math.max(
    0.1,
    strokeColor !== "none" && strokeWidth > 0 ? strokeWidth / 2 : 0.5,
  );

  // Base vertical radius
  const base_ry = Math.max(min_ry, lerp(min_ry, rx, openness));

  // Mood influence
  const moodFactor = lerp(-1, 1, mood); // -1 (frown) to +1 (smile)

  // Vertical offset caused by mood
  const moodRyOffset = moodFactor * (rx * maxMoodRatio) * (1 - openness);

  // Final vertical radii for top and bottom arcs
  const ry_bottom = Math.max(min_ry, base_ry + moodRyOffset);
  const ry_top = Math.max(min_ry, base_ry - moodRyOffset);

  // --- Define the Path ---
  const startX = x - rx;
  const startY = y;
  const endX = x + rx;
  const endY = y;

  // Using flags: Bottom (Small=0, CW=0), Top (Small=0, CCW=1)
  // Added explicit Z close
  const d = [
    `M ${startX} ${startY}`,
    `A ${rx.toFixed(3)} ${ry_bottom.toFixed(3)} 0 0 0 ${endX.toFixed(3)} ${endY.toFixed(3)}`, // Bottom arc
    `A ${rx.toFixed(3)} ${ry_top.toFixed(3)} 0 0 1 ${startX.toFixed(3)} ${startY.toFixed(3)}`, // Top arc
    `Z`, // Explicitly close path
  ].join(" ");

  // --- Debug Logging ---
  if (Math.abs(mood - 0.5) < 0.01 || openness < 0.01 || openness > 0.99) {
    console.log(
      `Params: open=${openness.toFixed(2)} mood=${mood.toFixed(2)} | Calc: rx=${rx.toFixed(2)} base_ry=${base_ry.toFixed(2)} moodOffset=${moodRyOffset.toFixed(2)} | Final: ry_bot=${ry_bottom.toFixed(2)} ry_top=${ry_top.toFixed(2)}`,
    );
    console.log("Path d:", d);
  }
  // --- End Debug ---

  // --- Create SVG Elements ---
  const group = document.createElementNS(svgNS, "g");
  group.setAttribute(
    "class",
    "letter-attachment letter-mouth letter-mouth-morphing",
  );

  const path = document.createElementNS(svgNS, "path");
  path.setAttribute("d", d);
  path.setAttribute("fill", fillColor);

  if (strokeColor !== "none" && strokeWidth > 0) {
    path.setAttribute("stroke", strokeColor);
    path.setAttribute("stroke-width", String(strokeWidth));
    path.setAttribute("stroke-linejoin", "round");
    path.setAttribute("stroke-linecap", "round");
  } else {
    // Ensure no stroke is applied if color is 'none'
    path.removeAttribute("stroke");
    path.removeAttribute("stroke-width");
  }

  group.appendChild(path);
  group.style.transformOrigin = `${x}px ${y}px`;

  return group;
}
