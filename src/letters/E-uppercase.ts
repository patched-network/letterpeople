// letterpeople/src/letters/E-uppercase.ts
import type {
  LetterOptions,
  InternalLetterRenderResult,
  AttachmentList,
} from "../types";

// Define constants for our coordinate space
const VIEWBOX_WIDTH = 80; // Similar width to 'H'
const VIEWBOX_HEIGHT = 100;
const DEFAULT_LIMB_THICKNESS = 20; // Thickness of vertical/horizontal parts
const DEFAULT_OUTLINE_WIDTH = 2; // Default width for the border/stroke

/**
 * @internal
 * Renders the base shape and calculates attachment points for the uppercase letter 'E'.
 * This function does NOT add attachments like eyes/mouth; that happens in the main createLetter function.
 *
 * @param options - Configuration options for the letter's appearance.
 * @returns An object containing the base SVG element and attachment coordinates.
 */
function renderE_uppercase(
  options?: LetterOptions,
): InternalLetterRenderResult {
  // --- SVG Setup ---
  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("viewBox", `0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`);
  svg.setAttribute("class", "letter-base letter-E-uppercase");

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
  const H_half = H / 2; // Midpoint vertically for the middle arm
  const T_half = T / 2; // Half of limb thickness

  // Define key X and Y coordinates for clarity
  const x0 = 0; // Outer left edge of the spine
  const x1 = T; // Inner right edge of the spine / Start of arms' inner part
  const x2 = W; // Outer right edge of the top / bottom arms
  const x3 = 0.9 * W; // Outer right edge of middle arm

  const y_top_arm_top = 0;
  const y_top_arm_bottom = T;

  const y_middle_arm_top = H_half - T_half;
  const y_middle_arm_bottom = H_half + T_half;

  const y_bottom_arm_top = H - T;
  const y_bottom_arm_bottom = H;

  // Path for the 'E' shape, moving clockwise around the perimeter
  const d = [
    `M ${x0} ${y_top_arm_top}`, // P1: Top-left of spine (0,0)
    `H ${x2}`, // P2: Top-right of top arm (W,0)
    `V ${y_top_arm_bottom}`, // P3: Bottom-right of top arm (W,T)
    `H ${x1}`, // P4: Inner-right of top arm, meets spine (T,T)
    `V ${y_middle_arm_top}`, // P5: Spine, at top of middle arm notch (T, H_half - T_half)
    `H ${x3}`, // P6: Top-right of middle arm (0.9*W, H_half - T_half)
    `V ${y_middle_arm_bottom}`, // P7: Bottom-right of middle arm (W, H_half + T_half)
    `H ${x1}`, // P8: Spine, at bottom of middle arm notch (T, H_half + T_half)
    `V ${y_bottom_arm_top}`, // P9: Spine, at top of bottom arm notch (T, H - T)
    `H ${x2}`, // P10: Top-right of bottom arm (W, H - T)
    `V ${y_bottom_arm_bottom}`, // P11: Bottom-right of bottom arm (W,H)
    `H ${x0}`, // P12: Bottom-left of spine (0,H)
    `Z`, // Close path (back to P1)
  ].join(" ");

  path.setAttribute("d", d);
  path.setAttribute("fill", fillColor);
  path.setAttribute("stroke", outlineColor);
  path.setAttribute("stroke-width", String(outlineWidth));
  path.setAttribute("stroke-linejoin", "miter"); // Keep sharp corners

  svg.appendChild(path);

  // --- Attachment Points Calculation (Relative to 0,0 of the viewBox) ---
  const attachments: AttachmentList = {
    // Eyes on the top horizontal arm
    leftEye: { x: x1 + (x2 - x1) * 0.25, y: T_half },
    rightEye: { x: x1 + (x2 - x1) * 0.75, y: T_half },

    // Mouth centered on the middle horizontal arm
    mouth: { x: x1 + (x2 - x1) * 0.5, y: H_half },

    // Hat sits centered on top
    hat: { x: W / 2, y: outlineWidth / 2 },

    // Arms: one on the left spine, one at the tip of the E's middle arm
    leftArm: { x: outlineWidth / 2, y: H_half },
    rightArm: { x: W - outlineWidth / 2, y: H_half },

    // Legs: one under the spine, one under the tip of the E's bottom arm
    leftLeg: { x: T_half, y: H - outlineWidth / 2 },
    rightLeg: { x: W - T_half, y: H - outlineWidth / 2 },
  };

  return {
    svg: svg,
    attachments: attachments,
  };
}

export default renderE_uppercase;
