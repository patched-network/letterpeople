// src/attachments/eye.ts

const svgNS = "http://www.w3.org/2000/svg";

/**
 * Options for customizing the appearance of an eye attachment.
 */
export interface EyeOptions {
  /** Overall diameter of the eye's white part (sclera). Defaults to 10. */
  size?: number;
  /** Fill color of the sclera. Defaults to 'white'. */
  fillColor?: string;
  /** Fill color of the pupil. Defaults to 'black'. */
  pupilColor?: string;
  /** Ratio of pupil diameter to eye diameter (e.g., 0.4 means pupil is 40% of eye size). Defaults to 0.4. */
  pupilSizeRatio?: number;
  /** Optional outline color for the sclera. Defaults to 'grey'. Set to 'none' for no outline. */
  strokeColor?: string;
  /** Optional outline width for the sclera. Defaults to 0.5. */
  strokeWidth?: number;
}

// --- Default values ---
const DEFAULT_EYE_SIZE = 10;
const DEFAULT_FILL_COLOR = "white";
const DEFAULT_PUPIL_COLOR = "black";
const DEFAULT_PUPIL_RATIO = 0.4;
const DEFAULT_STROKE_COLOR = "grey";
const DEFAULT_STROKE_WIDTH = 0.5;

/**
 * Creates SVG elements representing a simple eye.
 *
 * @param x - The desired center X coordinate for the eye.
 * @param y - The desired center Y coordinate for the eye.
 * @param options - Optional configuration for the eye's appearance.
 * @returns An SVGGElement containing the eye's parts (sclera and pupil).
 */
export function createEye(
  x: number,
  y: number,
  options?: EyeOptions,
): SVGGElement {
  // Process options with defaults
  const size = options?.size ?? DEFAULT_EYE_SIZE;
  const fillColor = options?.fillColor ?? DEFAULT_FILL_COLOR;
  const pupilColor = options?.pupilColor ?? DEFAULT_PUPIL_COLOR;
  const pupilRatio = options?.pupilSizeRatio ?? DEFAULT_PUPIL_RATIO;
  const strokeColor = options?.strokeColor ?? DEFAULT_STROKE_COLOR;
  const strokeWidth = options?.strokeWidth ?? DEFAULT_STROKE_WIDTH;

  // Calculate dimensions
  const radius = size / 2;
  const pupilRadius = radius * pupilRatio;

  // Create a group element to hold the eye parts
  const group = document.createElementNS(svgNS, "g");
  group.setAttribute("class", "letter-attachment letter-eye"); // Add classes for potential styling

  // Create the sclera (white part)
  const sclera = document.createElementNS(svgNS, "circle");
  sclera.setAttribute("cx", String(x));
  sclera.setAttribute("cy", String(y));
  sclera.setAttribute("r", String(radius));
  sclera.setAttribute("fill", fillColor);
  if (strokeColor !== "none" && strokeWidth > 0) {
    sclera.setAttribute("stroke", strokeColor);
    sclera.setAttribute("stroke-width", String(strokeWidth));
  }

  // Create the pupil
  const pupil = document.createElementNS(svgNS, "circle");
  // Center the pupil within the sclera
  pupil.setAttribute("cx", String(x));
  pupil.setAttribute("cy", String(y));
  pupil.setAttribute("r", String(pupilRadius));
  pupil.setAttribute("fill", pupilColor);

  // Add parts to the group
  group.appendChild(sclera);
  group.appendChild(pupil);

  return group;
}
