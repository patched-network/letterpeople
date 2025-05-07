// letterpeople/src/letters/H-uppercase.ts
import type {
  LetterOptions,
  InternalLetterRenderResult,
  AttachmentList,
} from "../types";

// Define constants for our coordinate space
const VIEWBOX_WIDTH = 80; // 'H' is generally wider
const VIEWBOX_HEIGHT = 100;
const DEFAULT_LIMB_THICKNESS = 20; // Thickness of vertical/horizontal parts
const DEFAULT_OUTLINE_WIDTH = 2; // Default width for the border/stroke

/**
 * @internal
 * Renders the base shape and calculates attachment points for the uppercase letter 'H'.
 * This function does NOT add attachments like eyes/mouth; that happens in the main createLetter function.
 *
 * @param options - Configuration options for the letter's appearance.
 * @returns An object containing the base SVG element and attachment coordinates.
 */
function renderH_uppercase(
  options?: LetterOptions,
): InternalLetterRenderResult {
  // --- SVG Setup ---
  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("viewBox", `0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`);
  svg.setAttribute("class", "letter-base letter-H-uppercase");

  // --- Options Processing ---
  const limbThickness = options?.lineWidth ?? DEFAULT_LIMB_THICKNESS;
  const fillColor = options?.color ?? "currentColor";
  const outlineColor = options?.borderColor ?? "black";
  const outlineWidth = options?.borderWidth ?? DEFAULT_OUTLINE_WIDTH;

  // --- Path Definition (Filled Shape Outline) ---
  const path = document.createElementNS(svgNS, "path");
  const T = limbThickness; // Alias for limbThickness
  const W = VIEWBOX_WIDTH;
  const H = VIEWBOX_HEIGHT;
  const H_half = H / 2; // Midpoint vertically
  const T_half = T / 2; // Half of limb thickness

  // Define key X and Y coordinates for clarity
  const x0 = 0; // Outer left edge
  const x1 = T; // Inner left edge / Left edge of crossbar
  const x2 = W - T; // Inner right edge / Right edge of crossbar
  const x3 = W; // Outer right edge

  const y0 = 0; // Top edge
  const y1 = H_half - T_half; // Top edge of crossbar
  const y2 = H_half + T_half; // Bottom edge of crossbar
  const y3 = H; // Bottom edge

  // Path for the 'H' shape, moving clockwise around the perimeter
  const d = [
    `M ${x0} ${y0}`, // Start at P1: Top-left outer corner (0,0)
    `H ${x1}`, // To P2: Top-left inner corner (T,0)
    `V ${y1}`, // To P3: Top-left of crossbar connection (T, H_half - T_half)
    `H ${x2}`, // To P4: Top-right of crossbar connection (W-T, H_half - T_half)
    `V ${y0}`, // To P5: Top-right inner corner (W-T, 0)
    `H ${x3}`, // To P6: Top-right outer corner (W,0)
    `V ${y3}`, // To P7: Bottom-right outer corner (W,H)
    `H ${x2}`, // To P8: Bottom-right inner corner (W-T, H)
    `V ${y2}`, // To P9: Bottom-right of crossbar connection (W-T, H_half + T_half)
    `H ${x1}`, // To P10: Bottom-left of crossbar connection (T, H_half + T_half)
    `V ${y3}`, // To P11: Bottom-left inner corner (T,H)
    `H ${x0}`, // To P12: Bottom-left outer corner (0,H)
    `Z`, // Close path (back to P1 at 0,0)
  ].join(" ");

  path.setAttribute("d", d);
  path.setAttribute("fill", fillColor);
  path.setAttribute("stroke", outlineColor);
  path.setAttribute("stroke-width", String(outlineWidth));
  path.setAttribute("stroke-linejoin", "miter"); // Keep sharp corners

  svg.appendChild(path);

  // --- Attachment Points Calculation (Relative to 0,0 of the viewBox) ---
  // (These remain unchanged as they seemed correct)
  const attachments: AttachmentList = {
    leftEye: { x: T / 2, y: T * 0.8 },
    rightEye: { x: W - T / 2, y: T * 0.8 },
    mouth: { x: W / 2, y: H_half },
    hat: { x: W / 2, y: outlineWidth / 2 },
    leftArm: { x: outlineWidth / 2, y: H * 0.55 },
    rightArm: { x: W - outlineWidth / 2, y: H * 0.55 },
    leftLeg: { x: T / 2, y: H - outlineWidth / 2 },
    rightLeg: { x: W - T / 2, y: H - outlineWidth / 2 },
  };

  return {
    svg: svg,
    attachments: attachments,
  };
}

export default renderH_uppercase;
