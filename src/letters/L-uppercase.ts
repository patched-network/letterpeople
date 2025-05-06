// src/letters/L-uppercase.ts
import type {
  LetterOptions,
  InternalLetterRenderResult,
  Point,
} from "../types";

// Define constants for our coordinate space
const VIEWBOX_WIDTH = 100;
const VIEWBOX_HEIGHT = 100;
const DEFAULT_LIMB_THICKNESS = 20; // How thick the vertical/horizontal parts are
const DEFAULT_OUTLINE_WIDTH = 2; // Default width for the border/stroke

/**
 * @internal
 * Renders the base shape and calculates attachment points for the uppercase letter 'L'.
 * This function does NOT add attachments like eyes/mouth; that happens in the main createLetter function.
 *
 * @param options - Configuration options for the letter's appearance.
 * @returns An object containing the base SVG element and attachment coordinates.
 */
function renderL_uppercase(
  options?: LetterOptions,
): InternalLetterRenderResult {
  // --- SVG Setup ---
  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  // Set viewBox immediately, other attributes (width, height, aspect ratio)
  // might be better set on the instance in createLetter or by the user via CSS.
  svg.setAttribute("viewBox", `0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`);
  // Add a class for potential base styling
  svg.setAttribute("class", "letter-base letter-L-uppercase");

  // --- Options Processing ---
  const limbThickness = options?.lineWidth ?? DEFAULT_LIMB_THICKNESS;
  const fillColor = options?.color ?? "currentColor";
  const outlineColor = options?.borderColor ?? "black";
  const outlineWidth = options?.borderWidth ?? DEFAULT_OUTLINE_WIDTH;

  // --- Path Definition (Filled Shape Outline) ---
  const path = document.createElementNS(svgNS, "path");
  const T = limbThickness; // Alias
  const W = VIEWBOX_WIDTH;
  const H = VIEWBOX_HEIGHT;

  const d = [
    `M 0 0`,
    `H ${T}`,
    `V ${H - T}`,
    `H ${W}`,
    `V ${H}`,
    `H 0`,
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
  // Ensure the keys match the expected structure if defined strictly in LetterInstance later
  const attachments: { [key: string]: Point } = {
    // Eyes and mouth on the upper part of the vertical stem
    leftEye: { x: T * 0.3, y: T * 0.8 },
    rightEye: { x: T * 0.7, y: T * 0.8 },
    mouth: { x: T / 2, y: T * 1.3 },

    // Hat sits centered on top
    hat: { x: T / 2, y: outlineWidth / 2 }, // Center on the outline thickness

    // Arms roughly mid-height
    leftArm: { x: outlineWidth / 2, y: H * 0.6 }, // Center on left outline
    rightArm: { x: T - outlineWidth / 2, y: H * 0.6 }, // Center on right edge of vertical stem outline

    // Legs at the bottom centers of the stems
    leftLeg: { x: T / 2, y: H - outlineWidth / 2 }, // Center on bottom outline
    rightLeg: { x: T + (W - T) / 2, y: H - outlineWidth / 2 }, // Center on bottom outline
  };

  // Return the result conforming to InternalLetterRenderResult
  return {
    svg: svg,
    attachments: attachments,
  };
}

// Export the function using its descriptive name
export default renderL_uppercase;
