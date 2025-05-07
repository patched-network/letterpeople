// letterpeople/src/letters/W-uppercase.ts
import type {
  LetterOptions,
  InternalLetterRenderResult,
  AttachmentList,
} from "../types";

// Define constants for our coordinate space
const VIEWBOX_WIDTH = 100; // 'W' is typically wider than 'M'
const VIEWBOX_HEIGHT = 100;
const DEFAULT_LIMB_THICKNESS = 20;
const DEFAULT_OUTLINE_WIDTH = 2;
const DEFAULT_PEAK_Y_FACTOR = 0.25; // Determines how far down the middle peak goes (0.0 to 1.0)
const DEFAULT_VALLEY_Y_FACTOR = 0.6; // Determines how far down the valleys go (0.0 to 1.0)

/**
 * @internal
 * Renders the base shape and calculates attachment points for the uppercase letter 'W'.
 *
 * @param options - Configuration options for the letter's appearance.
 * @returns An object containing the base SVG element and attachment coordinates.
 */
function renderW_uppercase(
  options?: LetterOptions,
): InternalLetterRenderResult {
  // --- SVG Setup ---
  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("viewBox", `0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`);
  svg.setAttribute("class", "letter-base letter-W-uppercase");

  // --- Options Processing ---
  const limbT = options?.lineWidth ?? DEFAULT_LIMB_THICKNESS;
  const fillColor = options?.color ?? "currentColor";
  const outlineColor = options?.borderColor ?? "black";
  const outlineW = options?.borderWidth ?? DEFAULT_OUTLINE_WIDTH;

  // --- Path Definition ---
  const pathEl = document.createElementNS(svgNS, "path");
  const W = VIEWBOX_WIDTH; // Width
  const H = VIEWBOX_HEIGHT; // Height
  const T = limbT; // Thickness

  // Calculate key points for the W shape
  // Key points from left to right:
  const peakY = H * DEFAULT_PEAK_Y_FACTOR; // How far down the middle peak goes
  const valleyY = H - 2 * T; // How far down the valleys go
  const quarter = W / 4; // Horizontal quarter-points

  // Outer points (clockwise from top-left)
  const p1 = { x: 0, y: 0 }; // Top-left
  const p2 = { x: T, y: 0 }; // Top-left, inner
  const p3 = { x: quarter, y: valleyY }; // First valley point, left side
  const p4 = { x: W / 2, y: peakY }; // Middle peak, top
  const p5 = { x: 3 * quarter, y: valleyY }; // Second valley point, right side
  const p6 = { x: W - T, y: 0 }; // Top-right, inner
  const p7 = { x: W, y: 0 }; // Top-right
  const p8 = { x: W - T * 0.5, y: H }; // Bottom-right
  const p9 = { x: 3 * quarter, y: valleyY + T }; // Second valley point, bottom edge
  const p10 = { x: W / 2, y: peakY + T }; // Middle peak, bottom
  const p11 = { x: quarter, y: valleyY + T }; // First valley point, bottom edge
  const p12 = { x: T * 0.5, y: H }; // Bottom-left

  // Path for the 'W' shape, clockwise around the perimeter
  const d = [
    `M ${p1.x} ${p1.y}`, // Start at top-left
    `H ${p2.x}`, // Across to inner edge of left stem
    `L ${p3.x} ${p3.y}`, // Down-right to first valley point
    `L ${p4.x - T / 2} ${p4.y}`, // Up-right to middle peak bezel
    `L ${p4.x + T / 2} ${p4.y}`, // across middle peak bezel
    `L ${p5.x} ${p5.y}`, // Down-right to second valley point
    `L ${p6.x} ${p6.y}`, // Up-right to inner edge of right stem
    `H ${p7.x}`, // Across to top-right corner
    `L ${p8.x} ${p8.y}`, // Down-left to bottom-right
    `L ${p8.x - T * 0.75} ${p8.y}`, // Across for flattened bottom

    `L ${p10.x} ${p10.y}`, // Up-left to bottom of middle peak

    `L ${p12.x + T * 0.75} ${p12.y}`, // Down-left to bottom-right of first valley

    `L ${p12.x} ${p12.y}`, // Across to bottom-left of first valley
    `Z`, // Close path
  ].join(" ");

  pathEl.setAttribute("d", d);
  pathEl.setAttribute("fill", fillColor);
  pathEl.setAttribute("stroke", outlineColor);
  pathEl.setAttribute("stroke-width", String(outlineW));
  pathEl.setAttribute("stroke-linejoin", "miter"); // For sharp corners

  svg.appendChild(pathEl);

  // --- Attachment Points Calculation ---
  const attachments: AttachmentList = {
    // Eyes at the top of the first and second diagonal
    leftEye: { x: quarter - T * 0.7, y: (2 * T) / 3 },
    rightEye: { x: 3 * quarter + T * 0.7, y: (2 * T) / 3 },

    // Mouth at the middle peak
    mouth: { x: W / 2, y: peakY + T * 0.5 },

    // Standard attachment points
    hat: { x: W / 2, y: outlineW / 2 }, // Centered on top
    leftArm: { x: outlineW / 2, y: H * 0.4 }, // On left edge
    rightArm: { x: W - outlineW / 2, y: H * 0.4 }, // On right edge
    leftLeg: { x: T * 0.5, y: H - outlineW / 2 }, // Bottom-left
    rightLeg: { x: W - T * 0.5, y: H - outlineW / 2 }, // Bottom-right
  };

  return {
    svg: svg,
    attachments: attachments,
  };
}

export default renderW_uppercase;
