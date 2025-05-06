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
   * 0.5: Neutral horizontal line (when openness is 0).
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
const DEFAULT_MAX_MOOD_RATIO = 0.6; // How much mood affects curvature at openness=0

/**
 * Creates SVG elements representing a morphable mouth shape.
 * The shape transitions between a curve (smile/frown) and a circle based on parameters.
 *
 * @param x - The desired center X coordinate for the mouth.
 * @param y - The desired center Y coordinate for the mouth.
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

  const rx = width / 2; // Horizontal radius is fixed by width

  // Minimum vertical radius (to prevent degenerate arcs when openness is 0)
  // Make it at least half the stroke width if stroke is visible, or a small value otherwise
  const min_ry =
    strokeColor !== "none" && strokeWidth > 0 ? strokeWidth / 2 : 0.5;

  // Base vertical radius: interpolates from min_ry to rx based on openness
  // Ensure base_ry is always positive
  const base_ry = Math.max(min_ry, lerp(min_ry, rx, openness));

  // Mood influence: interpolates from -1 (frown) to +1 (smile)
  const moodFactor = lerp(-1, 1, mood);

  // Calculate the vertical offset caused by mood.
  // This offset is strongest when openness is 0 and fades to 0 as openness reaches 1.
  // The maximum offset is determined by maxMoodRatio * rx.
  const moodRyOffset = moodFactor * (rx * maxMoodRatio) * (1 - openness);

  // Calculate final vertical radii for the top and bottom arcs
  // Ensure they don't collapse below min_ry
  const ry_bottom = Math.max(min_ry, base_ry + moodRyOffset);
  const ry_top = Math.max(min_ry, base_ry - moodRyOffset);

  // --- Define the Path ---
  // We use two elliptical arc commands (A) to form the shape.
  // Format: A rx ry x-axis-rotation large-arc-flag sweep-flag x y

  const startX = x - rx;
  const startY = y;
  const endX = x + rx;
  const endY = y;

  const d = [
    `M ${startX} ${startY}`, // Move to the leftmost point on the baseline
    `A ${rx} ${ry_bottom} 0 0 1 ${endX} ${endY}`, // Bottom arc (sweep 1 curves "downward" relative to direction)
    `A ${rx} ${ry_top} 0 0 0 ${startX} ${startY}`, // Top arc (sweep 0 curves "upward" relative to direction, back to start)
    // 'Z' // Close path - optional but good practice for filled shapes
  ].join(" ");

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
    path.setAttribute("stroke-linejoin", "round"); // Optional: smoother corners
    path.setAttribute("stroke-linecap", "round"); // Optional: smoother line ends if stroke is thick
  }

  group.appendChild(path);

  // Set transform-origin for scaling/rotation animations centered correctly
  group.style.transformOrigin = `${x}px ${y}px`;

  return group;
}

// --- Export the interfaces and the function ---
// (Interfaces are implicitly exported by being declared with 'export')
