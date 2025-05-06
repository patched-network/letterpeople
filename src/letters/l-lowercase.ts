// src/letters/l-lowercase.ts
import type {
  LetterOptions,
  InternalLetterRenderResult,
  Point,
  AttachmentList,
} from "../types";

// Define constants for our coordinate space
const VIEWBOX_WIDTH = 40; // Narrower than uppercase L
const VIEWBOX_HEIGHT = 100;
const DEFAULT_LIMB_THICKNESS = 16; // Slightly thinner than uppercase
const DEFAULT_OUTLINE_WIDTH = 2; // Default width for the border/stroke
const TAIL_WIDTH = 15; // Width of the tail at the bottom

/**
 * @internal
 * Renders the base shape and calculates attachment points for the lowercase letter 'l'.
 * This function does NOT add attachments like eyes/mouth; that happens in the main createLetter function.
 *
 * @param options - Configuration options for the letter's appearance.
 * @returns An object containing the base SVG element and attachment coordinates.
 */
function renderL_lowercase(
  options?: LetterOptions,
): InternalLetterRenderResult {
  // --- SVG Setup ---
  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  // Set viewBox immediately, other attributes (width, height, aspect ratio)
  // might be better set on the instance in createLetter or by the user via CSS.
  svg.setAttribute("viewBox", `0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`);
  // Add a class for potential base styling
  svg.setAttribute("class", "letter-base letter-l-lowercase");

  // --- Options Processing ---
  const limbThickness = options?.lineWidth ?? DEFAULT_LIMB_THICKNESS;
  const fillColor = options?.color ?? "currentColor";
  const outlineColor = options?.borderColor ?? "black";
  const outlineWidth = options?.borderWidth ?? DEFAULT_OUTLINE_WIDTH;

  // --- Path Definition (Filled Shape Outline) ---
  // Create the lowercase 'l' with a distinctive tail at the bottom right
  const path = document.createElementNS(svgNS, "path");
  const T = limbThickness; // Alias
  const W = VIEWBOX_WIDTH;
  const H = VIEWBOX_HEIGHT;
  const TW = TAIL_WIDTH; // Tail width

  // Path moves from top left, across, down, right for the tail, back up, and closes
  const d = [
    // Start at top left
    `M ${(W - T) / 2} 0`, 
    // Top edge right
    `H ${(W + T) / 2}`,
    // Right side down to bottom of letter minus tail height
    `V ${H - T}`,
    // Right to form tail
    `H ${Math.min(W, (W + T) / 2 + TW)}`,
    // Down to complete bottom
    `V ${H}`,
    // Left across the whole bottom (under stem and tail)
    `H ${(W - T) / 2}`,
    // Back up to starting point
    `V 0`,
    `Z`,
  ].join(" ");

  path.setAttribute("d", d);
  path.setAttribute("fill", fillColor);
  path.setAttribute("stroke", outlineColor);
  path.setAttribute("stroke-width", String(outlineWidth));
  path.setAttribute("stroke-linejoin", "miter"); // Keep sharp corners for the base shape

  // Append ONLY the path to the base SVG element
  svg.appendChild(path);

  // --- Attachment Points Calculation (Relative to 0,0 of the viewBox) ---
  // Calculate the center of the vertical stem
  const stemCenterX = W / 2;
  
  const attachments: AttachmentList = {
    // Eyes and mouth near the top of the vertical stem, centered
    leftEye: { x: stemCenterX - T * 0.2, y: T * 0.8 },
    rightEye: { x: stemCenterX + T * 0.2, y: T * 0.8 },
    mouth: { x: stemCenterX, y: T * 1.3 },

    // Hat sits centered on top
    hat: { x: stemCenterX, y: outlineWidth / 2 },

    // Arms at mid-height, on the left and right edges of the stem
    leftArm: { x: (W - T) / 2 + outlineWidth / 2, y: H * 0.4 },
    rightArm: { x: (W + T) / 2 - outlineWidth / 2, y: H * 0.4 },

    // Legs at the bottom
    leftLeg: { x: stemCenterX - T * 0.3, y: H - outlineWidth / 2 }, // On bottom edge, left side
    rightLeg: { x: stemCenterX + TW * 0.7, y: H - outlineWidth / 2 }, // On bottom edge, right side (in the tail)
  };

  // Return the result conforming to InternalLetterRenderResult
  return {
    svg: svg,
    attachments: attachments,
  };
}

// Export the function
export default renderL_lowercase;