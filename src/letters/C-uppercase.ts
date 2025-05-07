// letterpeople/src/letters/C-uppercase.ts
import type {
  LetterOptions,
  InternalLetterRenderResult,
  // Point, // Not directly used in this file's logic beyond types
  AttachmentList,
} from "../types";

// Helper to convert degrees to radians
const toRadians = (degrees: number): number => degrees * (Math.PI / 180);

// Define constants for our coordinate space
const VIEWBOX_WIDTH = 80; // Consistent with 'O'
const VIEWBOX_HEIGHT = 100;
const DEFAULT_LIMB_THICKNESS = 20; // Thickness of the 'C'
const DEFAULT_OUTLINE_WIDTH = 2; // Default width for the border/stroke

// Define the opening of the 'C'
// Angles are relative to the positive x-axis (0 degrees = 3 o'clock)
// Arc sweeps counter-clockwise from startAngle to endAngle
const START_ANGLE_DEG = 40; // Top part of the C's opening
const END_ANGLE_DEG = 320; // Bottom part of the C's opening (360 - 40)

/**
 * @internal
 * Renders the base shape and calculates attachment points for the uppercase letter 'C'.
 * This function uses two elliptical arcs to create the shape with an opening.
 *
 * @param options - Configuration options for the letter's appearance.
 * @returns An object containing the base SVG element and attachment coordinates.
 */
function renderC_uppercase(
  options?: LetterOptions,
): InternalLetterRenderResult {
  // --- SVG Setup ---
  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("viewBox", `0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`);
  svg.setAttribute("class", "letter-base letter-C-uppercase");

  // --- Options Processing ---
  const limbThickness = options?.lineWidth ?? DEFAULT_LIMB_THICKNESS;
  const fillColor = options?.color ?? "currentColor";
  const outlineColor = options?.borderColor ?? "black";
  const outlineWidth = options?.borderWidth ?? DEFAULT_OUTLINE_WIDTH;

  // --- Path Definition ---
  const pathEl = document.createElementNS(svgNS, "path");

  const W = VIEWBOX_WIDTH;
  const H = VIEWBOX_HEIGHT;
  const cx = W / 2; // Center X of the bounding box
  const cy = H / 2; // Center Y of the bounding box

  // Outer ellipse radii, accounting for outline
  const outerRx = (W - outlineWidth) / 2;
  const outerRy = (H - outlineWidth) / 2;

  // Inner ellipse radii (for the hollow part)
  const minInnerRadius = 1; // Minimum radius to ensure the shape is drawable
  let innerRx = outerRx - limbThickness;
  let innerRy = outerRy - limbThickness;

  innerRx = Math.max(minInnerRadius, innerRx);
  innerRy = Math.max(minInnerRadius, innerRy);

  // Convert angles to radians for Math functions
  const startAngleRad = toRadians(START_ANGLE_DEG);
  const endAngleRad = toRadians(END_ANGLE_DEG);

  // Calculate key points for the arcs
  // Outer arc points (where the C's "horns" start/end)
  const pOuterStart = {
    x: cx + outerRx * Math.cos(startAngleRad),
    y: cy + outerRy * Math.sin(startAngleRad),
  };
  const pOuterEnd = {
    x: cx + outerRx * Math.cos(endAngleRad),
    y: cy + outerRy * Math.sin(endAngleRad),
  };

  // Inner arc points
  const pInnerStart = {
    x: cx + innerRx * Math.cos(startAngleRad),
    y: cy + innerRy * Math.sin(startAngleRad),
  };
  const pInnerEnd = {
    x: cx + innerRx * Math.cos(endAngleRad),
    y: cy + innerRy * Math.sin(endAngleRad),
  };

  // Determine large-arc-flag: 1 if arc sweep > 180 degrees (PI radians)
  // Normalize endAngleRad to be greater than startAngleRad for sweep calculation
  const normalizedEndAngleRad =
    endAngleRad < startAngleRad ? endAngleRad + 2 * Math.PI : endAngleRad;
  const sweepAngleRad = normalizedEndAngleRad - startAngleRad;
  const largeArcFlag = sweepAngleRad > Math.PI ? 1 : 0;

  // Construct the path data string
  const d = [
    // Move to the start of the outer arc (top horn, outer edge)
    `M ${pOuterStart.x.toFixed(3)} ${pOuterStart.y.toFixed(3)}`,
    // Outer arc (sweeps counter-clockwise around the left side)
    `A ${outerRx.toFixed(3)} ${outerRy.toFixed(3)} 0 ${largeArcFlag} 0 ${pOuterEnd.x.toFixed(3)} ${pOuterEnd.y.toFixed(3)}`,
    // Line from outer end to inner end (bottom horn, connecting outer to inner edge)
    `L ${pInnerEnd.x.toFixed(3)} ${pInnerEnd.y.toFixed(3)}`,
    // Inner arc (sweeps clockwise around the left side, forming the inside of the C)
    `A ${innerRx.toFixed(3)} ${innerRy.toFixed(3)} 0 ${largeArcFlag} 1 ${pInnerStart.x.toFixed(3)} ${pInnerStart.y.toFixed(3)}`,
    // Close the path (line from inner start to outer start, completing the top horn)
    `Z`,
  ].join(" ");

  pathEl.setAttribute("d", d);
  pathEl.setAttribute("fill", fillColor);
  pathEl.setAttribute("stroke", outlineColor);
  pathEl.setAttribute("stroke-width", String(outlineWidth));
  pathEl.setAttribute("stroke-linejoin", "round"); // Round for smoother curves

  svg.appendChild(pathEl);

  // --- Attachment Points Calculation ---
  // Effective center for facial features, shifted left due to C's shape
  const visualCenterX = cx - limbThickness * 0.3;
  const visualCenterY = cy;

  const attachments: AttachmentList = {
    // Eyes and mouth placed within the curve of the C
    leftEye: {
      x: visualCenterX - innerRx * 0.35,
      y: visualCenterY - innerRy * 0.3,
    },
    rightEye: {
      x: visualCenterX + innerRx * 0.25, // Slightly more to the right
      y: visualCenterY - innerRy * 0.35, // Slightly higher
    },
    mouth: {
      x: visualCenterX - innerRx * 0.05,
      y: visualCenterY + innerRy * 0.4,
    },

    // Hat sits on top of the C's curve, centered horizontally on the viewBox
    hat: { x: cx, y: cy - outerRy - outlineWidth / 2 },

    // Left arm on the furthest left point of the C
    leftArm: { x: cx - outerRx - outlineWidth / 2, y: cy },
    // Right arm on the upper "horn" of the C
    rightArm: {
      x: pOuterStart.x - limbThickness * 0.2, // Slightly in from the tip
      y: pOuterStart.y + limbThickness * 0.3,
    },

    // Left leg on the bottom-left curve of the C
    leftLeg: {
      x: cx - outerRx * 0.6, // Pulled in from the absolute left
      y: cy + outerRy - limbThickness * 0.3 - outlineWidth / 2, // Adjusted upwards from bottom
    },
    // Right leg on the lower "horn" of the C
    rightLeg: {
      x: pOuterEnd.x - limbThickness * 0.2, // Slightly in from the tip
      y: pOuterEnd.y - limbThickness * 0.3,
    },
  };

  return {
    svg: svg,
    attachments: attachments,
  };
}

export default renderC_uppercase;
