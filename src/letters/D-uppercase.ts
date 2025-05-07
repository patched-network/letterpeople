// letterpeople/src/letters/D-uppercase.ts
import type {
  LetterOptions,
  InternalLetterRenderResult,
  AttachmentList,
} from "../types";

// Define constants for our coordinate space
const VIEWBOX_WIDTH = 80;
const VIEWBOX_HEIGHT = 100;
const DEFAULT_LIMB_THICKNESS = 20;
const DEFAULT_OUTLINE_WIDTH = 2;
const DEFAULT_CURVE_WIDTH = 70; // Width of the curved part

/**
 * @internal
 * Renders the base shape and calculates attachment points for the uppercase letter 'D'.
 *
 * @param options - Configuration options for the letter's appearance.
 * @returns An object containing the base SVG element and attachment coordinates.
 */
function renderD_uppercase(
  options?: LetterOptions,
): InternalLetterRenderResult {
  // --- SVG Setup ---
  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("viewBox", `0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`);
  svg.setAttribute("class", "letter-base letter-D-uppercase");

  // --- Options Processing ---
  const limbT = options?.lineWidth ?? DEFAULT_LIMB_THICKNESS;
  const fillColor = options?.color ?? "currentColor";
  const outlineColor = options?.borderColor ?? "black";
  const outlineW = options?.borderWidth ?? DEFAULT_OUTLINE_WIDTH;
  const curveWidth = DEFAULT_CURVE_WIDTH;

  // --- Path Definition ---
  const pathEl = document.createElementNS(svgNS, "path");
  const W = VIEWBOX_WIDTH;
  const H = VIEWBOX_HEIGHT;

  // Define key points
  const x0 = 0; // Left edge of stem
  const x1 = limbT; // Right edge of stem
  const x2 = 1.25 * limbT; // beginning of curve
  const x3 = 1.45 * limbT; // end of curve - give more 'bottom' to sit on
  const x4 = curveWidth; // Right edge of curve
  const y0 = 0; // Top edge
  const y2 = H; // Bottom edge
  const middleY = H / 2; // Middle of the letter height

  // Path for the 'D' shape - clockwise from top left
  const path = [
    // Start at top-left corner
    `M ${x0} ${y0}`,

    // Top horizontal of stem to start of curve
    `H ${x2}`,

    // Outer curve going down (right side)
    `C ${x1 + (x4 - x1) * 0.5} ${y0}, ${x4} ${y0 + H * 0.3}, ${x4} ${middleY}`,

    // Lower curve coming back to the stem
    `C ${x4} ${y0 + H * 0.7}, ${x1 + (x4 - x1) * 0.5} ${y2}, ${x3} ${y2}`,

    // Left side of stem back up
    `H ${x0}`,

    // Close the path
    `Z`,

    // Inner hole path (counter-clockwise)
    `M ${limbT} ${limbT}`, // upper-left starting point inside
    `V ${H - limbT}`, // down the inside of the stem

    // Curve back towards the left inside
    `C ${limbT + (x4 - limbT) * 0.3} ${H - limbT}, ${x4 - limbT} ${H * 0.7}, ${x4 - limbT} ${middleY}`,

    // Curve up to complete the hole
    `C ${x4 - limbT} ${H * 0.3}, ${limbT + (x4 - limbT) * 0.3} ${limbT}, ${limbT} ${limbT}`,

    `Z`,
  ].join(" ");

  pathEl.setAttribute("d", path);
  pathEl.setAttribute("fill", fillColor);
  pathEl.setAttribute("stroke", outlineColor);
  pathEl.setAttribute("stroke-width", String(outlineW));
  pathEl.setAttribute("stroke-linejoin", "miter"); // for sharp corners
  pathEl.setAttribute("stroke-linecap", "butt");

  svg.appendChild(pathEl);

  // --- Attachment Points Calculation ---
  const curveCenterX = (x1 + x4 - limbT) / 2;
  const curveCenterY = middleY;

  const attachments: AttachmentList = {
    // Eyes in the curved part
    leftEye: { x: limbT * 0.5, y: limbT * 0.5 },
    rightEye: { x: x2, y: limbT * 0.5 },
    // Mouth in the curve, below the eyes
    mouth: { x: limbT, y: H - limbT * 0.5 },

    // Standard attachment points
    hat: { x: W / 4, y: outlineW / 2 }, // Centered on top of the left half
    leftArm: { x: outlineW / 2, y: H * 0.5 }, // On the stem
    rightArm: { x: W - outlineW / 2, y: H * 0.5 }, // On the right side of the curve
    leftLeg: { x: limbT / 2, y: H - outlineW / 2 }, // Bottom of stem
    rightLeg: { x: W - limbT, y: H - outlineW / 2 }, // Bottom right of the curve
  };

  return {
    svg: svg,
    attachments: attachments,
  };
}

export default renderD_uppercase;
