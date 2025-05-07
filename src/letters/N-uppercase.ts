// letterpeople/src/letters/N-uppercase.ts
import type {
  LetterOptions,
  InternalLetterRenderResult,
  AttachmentList,
} from "../types";

// Define constants for our coordinate space
const VIEWBOX_WIDTH = 80; // 'N' is typically not as wide as 'M'
const VIEWBOX_HEIGHT = 100;
const DEFAULT_LIMB_THICKNESS = 20;
const DEFAULT_OUTLINE_WIDTH = 2;

/**
 * @internal
 * Renders the base shape and calculates attachment points for the uppercase letter 'N'.
 *
 * @param options - Configuration options for the letter's appearance.
 * @returns An object containing the base SVG element and attachment coordinates.
 */
function renderN_uppercase(
  options?: LetterOptions,
): InternalLetterRenderResult {
  // --- SVG Setup ---
  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("viewBox", `0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`);
  svg.setAttribute("class", "letter-base letter-N-uppercase");

  // --- Options Processing ---
  const limbT = options?.lineWidth ?? DEFAULT_LIMB_THICKNESS;
  const fillColor = options?.color ?? "currentColor";
  const outlineColor = options?.borderColor ?? "black";
  const outlineW = options?.borderWidth ?? DEFAULT_OUTLINE_WIDTH;

  // --- Path Definition ---
  const pathEl = document.createElementNS(svgNS, "path");
  const W = VIEWBOX_WIDTH;
  const H = VIEWBOX_HEIGHT;

  const jointWidth = limbT * 1.75;

  // The letter N is composed of two vertical stems and one diagonal
  // We'll define the path by moving clockwise around the outline
  const path = [
    // Start at top-left corner
    `M 0 0`,
    // Top edge of left stem
    `H ${limbT}`,
    // Diagonal from top-right of left stem to bottom-left of right stem
    `L ${W - limbT} ${H - jointWidth}`,
    // Up the right edge of right stem
    `V 0`,
    // Along the top edge of right stem
    `H ${W}`,
    // Down the right edge
    `V ${H}`,
    // Along the bottom edge
    `H ${W - limbT}`,
    // Diagonal from bottom-left of right stem to top-right of left stem (in opposite direction)
    `L ${limbT} ${jointWidth}`,
    // Down the inner edge of left stem
    `V ${H}`,
    // Along the bottom edge of left stem
    "H 0",
    // Close the path
    `Z`,
  ].join(" ");

  pathEl.setAttribute("d", path);
  pathEl.setAttribute("fill", fillColor);
  pathEl.setAttribute("stroke", outlineColor);
  pathEl.setAttribute("stroke-width", String(outlineW));
  pathEl.setAttribute("stroke-linejoin", "miter"); // for sharp corners

  svg.appendChild(pathEl);

  // --- Attachment Points Calculation ---
  // Find a good spot for attachments along the diagonal
  const diagMidX = W / 2;
  const diagMidY = H / 2;

  const attachments: AttachmentList = {
    // Eyes along the diagonal
    leftEye: { x: limbT * 0.55, y: limbT * 0.7 },
    rightEye: { x: W - limbT * 0.5, y: limbT * 0.7 },
    // Mouth centered below the eyes
    mouth: { x: W - limbT * 0.7, y: H - jointWidth / 2 },

    // Standard attachment points
    hat: { x: W / 2, y: outlineW / 2 }, // Centered on top
    leftArm: { x: outlineW / 2, y: H * 0.5 }, // Mid-height on left edge
    rightArm: { x: W - outlineW / 2, y: H * 0.5 }, // Mid-height on right edge
    leftLeg: { x: limbT / 2, y: H - outlineW / 2 }, // Bottom of left stem
    rightLeg: { x: W - limbT / 2, y: H - outlineW / 2 }, // Bottom of right stem
  };

  return {
    svg: svg,
    attachments: attachments,
  };
}

export default renderN_uppercase;
