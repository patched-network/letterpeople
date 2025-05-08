// letterpeople/src/letters/Y-uppercase.ts
import type {
  LetterOptions,
  InternalLetterRenderResult,
  AttachmentList,
  Point,
} from "../types";

// Define constants for our coordinate space
const VIEWBOX_WIDTH = 80;
const VIEWBOX_HEIGHT = 100;
const DEFAULT_LIMB_THICKNESS = 20;
const DEFAULT_OUTLINE_WIDTH = 2;
const DEFAULT_FORK_Y_POSITION = 0.5; // Position where the fork splits (0.0=top, 1.0=bottom)

/**
 * @internal
 * Renders the base shape and calculates attachment points for the uppercase letter 'Y'.
 *
 * @param options - Configuration options for the letter's appearance.
 * @returns An object containing the base SVG element and attachment coordinates.
 */
function renderY_uppercase(
  options?: LetterOptions,
): InternalLetterRenderResult {
  // --- SVG Setup ---
  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("viewBox", `0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`);
  svg.setAttribute("class", "letter-base letter-Y-uppercase");

  // --- Options Processing ---
  const limbT = options?.lineWidth ?? DEFAULT_LIMB_THICKNESS;
  const fillColor = options?.color ?? "currentColor";
  const outlineColor = options?.borderColor ?? "black";
  const outlineW = options?.borderWidth ?? DEFAULT_OUTLINE_WIDTH;

  // --- Path Definition ---
  const pathEl = document.createElementNS(svgNS, "path");
  const W = VIEWBOX_WIDTH;
  const H = VIEWBOX_HEIGHT;

  // Calculate the fork position
  const forkY = H * DEFAULT_FORK_Y_POSITION;
  const centerX = W / 2;

  // Key points for the Y shape
  // Top points
  const p1: Point = { x: 0, y: 0 }; // Top-left
  const p2: Point = { x: limbT, y: 0 }; // Top-left inner
  const p3: Point = { x: centerX, y: forkY - limbT / 2 }; // Top of center stem
  const p4: Point = { x: W - limbT, y: 0 }; // Top-right inner
  const p5: Point = { x: W, y: 0 }; // Top-right

  // Bottom points
  const p6: Point = { x: centerX + limbT / 2, y: forkY }; // Bottom of right diagonal
  const p7: Point = { x: centerX + limbT / 2, y: forkY }; // Right side of center stem, top
  const p8: Point = { x: centerX + limbT / 2, y: H }; // Right side of center stem, bottom
  const p9: Point = { x: centerX - limbT / 2, y: H }; // Left side of center stem, bottom
  const p10: Point = { x: centerX - limbT / 2, y: forkY }; // Left side of center stem, top
  const p11: Point = { x: centerX - limbT / 2, y: forkY }; // Bottom of left diagonal

  // Path for the 'Y' shape
  const d = [
    `M ${p1.x} ${p1.y}`, // Start at top-left
    `L ${p2.x} ${p2.y}`, // To top-left inner
    `L ${p3.x} ${p3.y}`, // To fork point
    `L ${p4.x} ${p4.y}`, // To top-right inner
    `L ${p5.x} ${p5.y}`, // To top-right
    `L ${p6.x} ${p6.y}`, // To bottom of right diagonal
    `L ${p7.x} ${p7.y}`, // To right side of center stem, top
    `L ${p8.x} ${p8.y}`, // To right side of center stem, bottom
    `L ${p9.x} ${p9.y}`, // To left side of center stem, bottom
    `L ${p10.x} ${p10.y}`, // To left side of center stem, top
    `L ${p11.x} ${p11.y}`, // To bottom of left diagonal
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
    // Eyes on the upper diagonals
    leftEye: { x: limbT * 0.85, y: limbT * 0.6 },
    rightEye: { x: W - limbT * 0.85, y: limbT * 0.6 },

    // Mouth on the upper part of the center stem
    mouth: { x: centerX, y: forkY + limbT * 0.7 },

    // Standard attachment points
    hat: { x: W / 2, y: outlineW / 2 }, // Centered on top
    leftArm: { x: outlineW / 2, y: forkY / 2 }, // Mid-height of left diagonal
    rightArm: { x: W - outlineW / 2, y: forkY / 2 }, // Mid-height of right diagonal
    leftLeg: { x: centerX - limbT * 0.4, y: H - outlineW / 2 }, // Left side of bottom stem
    rightLeg: { x: centerX + limbT * 0.4, y: H - outlineW / 2 }, // Right side of bottom stem
  };

  return {
    svg: svg,
    attachments: attachments,
  };
}

export default renderY_uppercase;
