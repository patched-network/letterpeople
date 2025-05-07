// letterpeople/src/letters/w-lowercase.ts
import type {
  LetterOptions,
  InternalLetterRenderResult,
  AttachmentList,
} from "../types";
import {
  VIEWBOX_HEIGHT as GLOBAL_VIEWBOX_HEIGHT,
  EFFECTIVE_LOWERCASE_HEIGHT,
} from "./CONSTS";

// Define constants for our coordinate space for lowercase 'w'
const VIEWBOX_WIDTH = 80; // Lowercase 'w' is typically a bit wider than 'o', narrower than 'W'
const VIEWBOX_HEIGHT = GLOBAL_VIEWBOX_HEIGHT; // Consistent height
const DEFAULT_LIMB_THICKNESS = 16; // Slightly thinner for lowercase
const DEFAULT_OUTLINE_WIDTH = 2;

// Proportional factors from uppercase 'W', to be applied to effective lowercase dimensions
const DEFAULT_PEAK_Y_FACTOR = 0.25; // How far down the middle peak goes (0.0 to 1.0 of char_height)
const DEFAULT_VALLEY_Y_FACTOR = 0.6; // How far down the valleys go (0.0 to 1.0 of char_height)
const FLAT_BOTTOM_WIDTH_FACTOR = 0.75; // Factor for the width of the flat part of legs

// Factor for positioning within the viewBox (consistent with lowercase 'o')
const O_BOTTOM_PADDING_FACTOR = 0.05;

/**
 * @internal
 * Renders the base shape and calculates attachment points for the lowercase letter 'w'.
 *
 * @param options - Configuration options for the letter's appearance.
 * @returns An object containing the base SVG element and attachment coordinates.
 */
function renderW_lowercase(
  options?: LetterOptions,
): InternalLetterRenderResult {
  // --- SVG Setup ---
  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("viewBox", `0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`);
  svg.setAttribute("class", "letter-base letter-w-lowercase");

  // --- Options Processing ---
  const limbT = options?.lineWidth ?? DEFAULT_LIMB_THICKNESS;
  const fillColor = options?.color ?? "currentColor";
  const outlineColor = options?.borderColor ?? "black";
  const outlineW = options?.borderWidth ?? DEFAULT_OUTLINE_WIDTH;

  // --- Calculate lowercase 'w' body dimensions and position ---
  const char_width = VIEWBOX_WIDTH; // Character fills its own viewBox width
  const char_height = EFFECTIVE_LOWERCASE_HEIGHT;

  // Baseline and top position for the character body
  const y_baseline =
    VIEWBOX_HEIGHT - VIEWBOX_HEIGHT * O_BOTTOM_PADDING_FACTOR - outlineW / 2;
  const y_top_char = y_baseline - char_height;

  // --- Path Definition ---
  const pathEl = document.createElementNS(svgNS, "path");
  const T = limbT; // Thickness, for brevity in point calculations

  // Calculate key Y coordinates relative to the character's own box
  const peakY_abs = y_top_char + char_height * DEFAULT_PEAK_Y_FACTOR;
  const valleyY_abs = y_top_char + char_height * DEFAULT_VALLEY_Y_FACTOR;

  // Horizontal quarter-points for the character width
  const quarter = char_width / 4;

  // Define points for the lowercase 'w' shape, analogous to uppercase 'W'
  // All coordinates are absolute within the SVG viewBox.

  // Points for the "top" contour and outer edges
  const p1 = { x: 0, y: y_top_char }; // Top-left of char
  const p2 = { x: T, y: y_top_char }; // Top-left, inner edge of left stem's top
  const p3 = { x: quarter, y: valleyY_abs }; // First valley point
  const p4_peak_center = { x: char_width / 2, y: peakY_abs }; // Middle peak, top center
  const p5 = { x: 3 * quarter, y: valleyY_abs }; // Second valley point
  const p6 = { x: char_width - T, y: y_top_char }; // Top-right, inner edge of right stem's top
  const p7 = { x: char_width, y: y_top_char }; // Top-right of char

  // Points for the "bottom" contour and leg endings
  const p8_leg_bottom_right = { x: char_width - T * 0.5, y: y_baseline }; // Center of right leg's bottom edge
  const p10_peak_bottom = { x: char_width / 2, y: peakY_abs + T }; // Bottom of middle peak structure
  const p12_leg_bottom_left = { x: T * 0.5, y: y_baseline }; // Center of left leg's bottom edge

  const flat_bottom_width = T * FLAT_BOTTOM_WIDTH_FACTOR;

  // Path for the 'w' shape, clockwise around the perimeter
  // Structure follows the uppercase 'W' path logic
  const d = [
    `M ${p1.x.toFixed(3)} ${p1.y.toFixed(3)}`, // Start at top-left
    `H ${p2.x.toFixed(3)}`, // Across to inner edge of left stem
    `L ${p3.x.toFixed(3)} ${p3.y.toFixed(3)}`, // Down-right to first valley point
    `L ${(p4_peak_center.x - T / 2).toFixed(3)} ${p4_peak_center.y.toFixed(3)}`, // Up-right to middle peak bezel (left)
    `L ${(p4_peak_center.x + T / 2).toFixed(3)} ${p4_peak_center.y.toFixed(3)}`, // Across middle peak bezel
    `L ${p5.x.toFixed(3)} ${p5.y.toFixed(3)}`, // Down-right to second valley point
    `L ${p6.x.toFixed(3)} ${p6.y.toFixed(3)}`, // Up-right to inner edge of right stem
    `H ${p7.x.toFixed(3)}`, // Across to top-right corner

    `L ${p8_leg_bottom_right.x.toFixed(3)} ${p8_leg_bottom_right.y.toFixed(3)}`, // Down to bottom-right of right leg
    `L ${(p8_leg_bottom_right.x - flat_bottom_width).toFixed(3)} ${p8_leg_bottom_right.y.toFixed(3)}`, // Left across flat bottom of right leg

    `L ${p10_peak_bottom.x.toFixed(3)} ${p10_peak_bottom.y.toFixed(3)}`, // Up-left to bottom of middle peak structure

    `L ${(p12_leg_bottom_left.x + flat_bottom_width).toFixed(3)} ${p12_leg_bottom_left.y.toFixed(3)}`, // Down-left to right side of flat bottom of left leg
    `L ${p12_leg_bottom_left.x.toFixed(3)} ${p12_leg_bottom_left.y.toFixed(3)}`, // Left across flat bottom of left leg
    `Z`, // Close path (forms outer left leg)
  ].join(" ");

  pathEl.setAttribute("d", d);
  pathEl.setAttribute("fill", fillColor);
  pathEl.setAttribute("stroke", outlineColor);
  pathEl.setAttribute("stroke-width", String(outlineW));
  pathEl.setAttribute("stroke-linejoin", "round"); // Softer corners for lowercase

  svg.appendChild(pathEl);

  // --- Attachment Points Calculation ---
  const attachments: AttachmentList = {
    // Eyes on the "shoulders" of the 'w'
    leftEye: { x: T / 2, y: y_top_char + T * 0.5 },
    rightEye: { x: VIEWBOX_WIDTH - T / 2, y: y_top_char + T * 0.5 },

    // Mouth on the slope of the middle peak
    mouth: { x: char_width / 2, y: p4_peak_center.y + T * 0.5 },

    // Standard attachment points
    hat: { x: char_width / 2, y: p4_peak_center.y },
    leftArm: {
      x: outlineW / 2,
      y: y_top_char + char_height * 0.45,
    },
    rightArm: {
      x: char_width - outlineW / 2,
      y: y_top_char + char_height * 0.45,
    },
    // Legs centered on the flat bottom parts of the outer legs
    leftLeg: { x: p12_leg_bottom_left.x, y: y_baseline + outlineW / 2 },
    rightLeg: { x: p8_leg_bottom_right.x, y: y_baseline + outlineW / 2 },
  };

  return {
    svg: svg,
    attachments: attachments,
  };
}

export default renderW_lowercase;
