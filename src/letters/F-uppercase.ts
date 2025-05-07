// letterpeople/src/letters/F-uppercase.ts
import type {
  LetterOptions,
  InternalLetterRenderResult,
  AttachmentList,
} from "../types";

// Define constants for our coordinate space
const VIEWBOX_WIDTH = 80; // Similar width to E/H
const VIEWBOX_HEIGHT = 100;
const DEFAULT_LIMB_THICKNESS = 20; // Thickness of vertical/horizontal parts
const DEFAULT_OUTLINE_WIDTH = 2; // Default width for the border/stroke

/**
 * @internal
 * Renders the base shape and calculates attachment points for the uppercase letter 'F'.
 * This function does NOT add attachments like eyes/mouth; that happens in the main createLetter function.
 *
 * @param options - Configuration options for the letter's appearance.
 * @returns An object containing the base SVG element and attachment coordinates.
 */
function renderF_uppercase(
  options?: LetterOptions,
): InternalLetterRenderResult {
  // --- SVG Setup ---
  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("viewBox", `0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`);
  svg.setAttribute("class", "letter-base letter-F-uppercase");

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
  const x_top_arm_tip = W; // Outer right edge of the top arm
  const x_middle_arm_tip = W * 0.8; // Outer right edge of middle arm (shorter than top)

  const y_top_arm_top = 0;
  const y_top_arm_bottom = T;

  const y_middle_arm_top = H_half - T_half;
  const y_middle_arm_bottom = H_half + T_half;

  const y_spine_bottom = H;

  // Path for the 'F' shape, moving clockwise around the perimeter
  const d = [
    `M ${x0} ${y_top_arm_top}`, // P1: Top-left of spine (0,0)
    `H ${x_top_arm_tip}`, // P2: Top-right of top arm (W,0)
    `V ${y_top_arm_bottom}`, // P3: Bottom-right of top arm (W,T)
    `H ${x1}`, // P4: Inner-right of top arm, meets spine (T,T)
    `V ${y_middle_arm_top}`, // P5: Spine, at top of middle arm notch (T, H_half - T_half)
    `H ${x_middle_arm_tip}`, // P6: Top-right of middle arm (0.8*W, H_half - T_half)
    `V ${y_middle_arm_bottom}`, // P7: Bottom-right of middle arm (0.8*W, H_half + T_half)
    `H ${x1}`, // P8: Spine, at bottom of middle arm notch (T, H_half + T_half)
    `V ${y_spine_bottom}`, // P9: Spine, down to bottom of letter (T, H)
    `H ${x0}`, // P10: Bottom-left of spine (0,H)
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
    leftEye: { x: x1 + (x_top_arm_tip - x1) * 0.2, y: T_half },
    rightEye: { x: x1 + (x_top_arm_tip - x1) * 0.7, y: T_half },

    // Mouth centered on the middle horizontal arm
    mouth: { x: x1 + (x_middle_arm_tip - x1) * 0.55, y: H_half },

    // Hat sits centered on top (based on full width of top arm)
    hat: { x: x_top_arm_tip / 2, y: outlineWidth / 2 },

    // Arms: one on the left spine, one at the tip of the F's middle arm
    leftArm: { x: outlineWidth / 2, y: H_half },
    rightArm: { x: x_middle_arm_tip - outlineWidth / 2, y: H_half },

    // Legs: both on the main vertical spine
    leftLeg: { x: T * 0.3, y: H - outlineWidth / 2 },
    rightLeg: { x: T * 0.7, y: H - outlineWidth / 2 },
  };

  return {
    svg: svg,
    attachments: attachments,
  };
}

export default renderF_uppercase;
