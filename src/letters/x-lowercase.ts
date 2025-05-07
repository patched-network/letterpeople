// letterpeople/src/letters/x-lowercase.ts
import type {
  LetterOptions,
  InternalLetterRenderResult,
  AttachmentList,
} from "../types";
import {
  VIEWBOX_HEIGHT as GLOBAL_VIEWBOX_HEIGHT,
  EFFECTIVE_LOWERCASE_HEIGHT,
} from "./CONSTS";

// Define constants for our coordinate space for lowercase 'x'
const VIEWBOX_WIDTH = 70; // Lowercase 'x' is typically narrower
const VIEWBOX_HEIGHT = GLOBAL_VIEWBOX_HEIGHT; // Consistent height
const DEFAULT_LIMB_THICKNESS = 16; // Slightly thinner for lowercase
const DEFAULT_OUTLINE_WIDTH = 2;

// Factor for the "opening" at the center of the X, proportional to limb thickness
const CENTER_OFFSET_FACTOR = 5 / 8;

// Factor for positioning within the viewBox (consistent with other lowercase letters)
const O_BOTTOM_PADDING_FACTOR = 0.05;

/**
 * @internal
 * Renders the base shape and calculates attachment points for the lowercase letter 'x'.
 *
 * @param options - Configuration options for the letter's appearance.
 * @returns An object containing the base SVG element and attachment coordinates.
 */
function renderX_lowercase(
  options?: LetterOptions,
): InternalLetterRenderResult {
  // --- SVG Setup ---
  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("viewBox", `0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`);
  svg.setAttribute("class", "letter-base letter-x-lowercase");

  // --- Options Processing ---
  const limbT = options?.lineWidth ?? DEFAULT_LIMB_THICKNESS;
  const fillColor = options?.color ?? "currentColor";
  const outlineColor = options?.borderColor ?? "black";
  const outlineW = options?.borderWidth ?? DEFAULT_OUTLINE_WIDTH;

  // --- Calculate lowercase 'x' body dimensions and position ---
  const char_width = VIEWBOX_WIDTH; // Character fills its own viewBox width
  const char_height = EFFECTIVE_LOWERCASE_HEIGHT;

  // Baseline and top position for the character body
  const y_baseline =
    VIEWBOX_HEIGHT - VIEWBOX_HEIGHT * O_BOTTOM_PADDING_FACTOR - outlineW / 2;
  const y_top_char = y_baseline - char_height;

  // --- Path Definition ---
  const pathEl = document.createElementNS(svgNS, "path");
  const T = limbT;
  const center_offset_scaled = CENTER_OFFSET_FACTOR * T;

  // Center of the character body
  const cx_char = char_width / 2;
  const cy_char = y_top_char + char_height / 2;

  // Key points for the X shape, scaled and positioned for lowercase
  // Top-left arm
  const p1 = { x: 0, y: y_top_char };
  const p2 = { x: T, y: y_top_char };
  // Center-top point of the crossing
  const p3 = { x: cx_char, y: cy_char - center_offset_scaled };
  // Top-right arm
  const p4 = { x: char_width - T, y: y_top_char };
  const p5 = { x: char_width, y: y_top_char };
  // Center-right point of the crossing
  const p6 = { x: cx_char + center_offset_scaled, y: cy_char };
  // Bottom-right arm
  const p7 = { x: char_width, y: y_baseline };
  const p8 = { x: char_width - T, y: y_baseline };
  // Center-bottom point of the crossing
  const p9 = { x: cx_char, y: cy_char + center_offset_scaled };
  // Bottom-left arm
  const p10 = { x: T, y: y_baseline };
  const p11 = { x: 0, y: y_baseline };
  // Center-left point of the crossing
  const p12 = { x: cx_char - center_offset_scaled, y: cy_char };

  // Path for the 'x' shape
  const d = [
    `M ${p1.x.toFixed(3)} ${p1.y.toFixed(3)}`,
    `L ${p2.x.toFixed(3)} ${p2.y.toFixed(3)}`,
    `L ${p3.x.toFixed(3)} ${p3.y.toFixed(3)}`,
    `L ${p4.x.toFixed(3)} ${p4.y.toFixed(3)}`,
    `L ${p5.x.toFixed(3)} ${p5.y.toFixed(3)}`,
    `L ${p6.x.toFixed(3)} ${p6.y.toFixed(3)}`,
    `L ${p7.x.toFixed(3)} ${p7.y.toFixed(3)}`,
    `L ${p8.x.toFixed(3)} ${p8.y.toFixed(3)}`,
    `L ${p9.x.toFixed(3)} ${p9.y.toFixed(3)}`,
    `L ${p10.x.toFixed(3)} ${p10.y.toFixed(3)}`,
    `L ${p11.x.toFixed(3)} ${p11.y.toFixed(3)}`,
    `L ${p12.x.toFixed(3)} ${p12.y.toFixed(3)}`,
    `Z`,
  ].join(" ");

  pathEl.setAttribute("d", d);
  pathEl.setAttribute("fill", fillColor);
  pathEl.setAttribute("stroke", outlineColor);
  pathEl.setAttribute("stroke-width", String(outlineW));
  pathEl.setAttribute("stroke-linejoin", "round"); // Softer corners for lowercase

  svg.appendChild(pathEl);

  // --- Attachment Points Calculation ---
  // Adjust for lowercase proportions and positioning
  const eyeY = y_top_char + T; // Slightly below the top edge of the limbs
  const eyeXOffset = T * 1.2; // Offset from the outer edges

  const attachments: AttachmentList = {
    // Eyes in the upper quadrants of the 'x' body
    leftEye: { x: eyeXOffset, y: eyeY },
    rightEye: { x: char_width - eyeXOffset, y: eyeY },

    // Mouth in the center of the 'x' body
    mouth: { x: cx_char, y: cy_char },

    // Standard attachment points
    hat: { x: cx_char, y: y_top_char - outlineW / 2 },
    leftArm: {
      x: outlineW / 2,
      y: cy_char, // Vertically centered on the character body
    },
    rightArm: {
      x: char_width - outlineW / 2,
      y: cy_char, // Vertically centered on the character body
    },
    // Legs at the bottom corners of the character's effective bounding box
    leftLeg: { x: T * 0.75, y: y_baseline + outlineW / 2 },
    rightLeg: { x: char_width - T * 0.75, y: y_baseline + outlineW / 2 },
  };

  return {
    svg: svg,
    attachments: attachments,
  };
}

export default renderX_lowercase;
