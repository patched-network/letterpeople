// letterpeople/src/letters/R-uppercase.ts
import type {
  LetterOptions,
  InternalLetterRenderResult,
  AttachmentList,
} from "../types";
import { getLineIntersection, getParallelLineSegment, Line, midpoint, Point } from "../util/geometry";

// Define constants for our coordinate space
const VIEWBOX_WIDTH = 75;
const VIEWBOX_HEIGHT = 100;
const DEFAULT_LIMB_THICKNESS = 20;
const DEFAULT_OUTLINE_WIDTH = 2;

// R-specific geometry constants
const H_BOWL_FACTOR = 0.55; // Bowl takes up 55% of height from the top
const W_BOWL_MAX_FACTOR = 0.95; // Bowl's rightmost extent as a factor of VIEWBOX_WIDTH
// How far from the VIEWBOX_WIDTH right edge the leg spine aims for, as a factor of limb thickness.
// A larger value means the leg tip is further from the absolute right edge.
const LEG_SPINE_END_X_CLEARANCE_FACTOR = 0.5;
const HOLE_INSET_FACTOR = 0.15; // Factor of limbThickness for padding inside the bowl hole

// Using geometry utilities from "../util/geometry"

/**
 * @internal
 * Renders the base shape and calculates attachment points for the uppercase letter 'R'.
 *
 * @param options - Configuration options for the letter's appearance.
 * @returns An object containing the base SVG element and attachment coordinates.
 */
function renderR_uppercase(
  options?: LetterOptions,
): InternalLetterRenderResult {
  // --- SVG Setup ---
  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("viewBox", `0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`);
  svg.setAttribute("class", "letter-base letter-R-uppercase");

  // --- Options Processing ---
  const limbT = options?.lineWidth ?? DEFAULT_LIMB_THICKNESS;
  const fillColor = options?.color ?? "currentColor";
  const outlineColor = options?.borderColor ?? "black";
  const outlineW = options?.borderWidth ?? DEFAULT_OUTLINE_WIDTH;

  // --- R Geometry Calculations ---
  const H_bowl_bottom_y = VIEWBOX_HEIGHT * H_BOWL_FACTOR; // Y-coordinate for the bottom of the bowl part
  const W_bowl_max_x = VIEWBOX_WIDTH * W_BOWL_MAX_FACTOR; // Rightmost extent of the bowl

  // Define the "spine" of the leg
  // To ensure P_leg_inner_top is (limbT, H_bowl_bottom_y), we derive spine_p1
  const spine_p2_x = VIEWBOX_WIDTH - LEG_SPINE_END_X_CLEARANCE_FACTOR * limbT;
  const spine_p2_y = VIEWBOX_HEIGHT;

  // Tentative spine_p1 (will be adjusted)
  // A point roughly in the middle of where the leg would join the bowl.
  const initial_spine_p1_x = limbT + (W_bowl_max_x - limbT) * 0.5;
  const initial_spine_p1_y = H_bowl_bottom_y;

  const dx_spine_initial = spine_p2_x - initial_spine_p1_x;
  const dy_spine_initial = spine_p2_y - initial_spine_p1_y;
  const L_spine_initial = Math.sqrt(
    dx_spine_initial * dx_spine_initial + dy_spine_initial * dy_spine_initial,
  );

  let spine_p1_x = initial_spine_p1_x;
  let spine_p1_y = initial_spine_p1_y;

  if (L_spine_initial > 0) {
    // Adjust spine_p1 so that the inner edge of the leg starts at (limbT, H_bowl_bottom_y)
    // Normal vector (pointing left of spine direction): (-dy/L, dx/L)
    // P_leg_inner_top = spine_p1 + (limbT/2) * normal_left
    // So, spine_p1 = P_leg_inner_top - (limbT/2) * normal_left
    spine_p1_x = limbT - (limbT / 2) * (-dy_spine_initial / L_spine_initial);
    spine_p1_y =
      H_bowl_bottom_y - (limbT / 2) * (dx_spine_initial / L_spine_initial);
  }

  const legSpineP1: Point = { x: spine_p1_x, y: spine_p1_y };
  const legSpineP2: Point = { x: spine_p2_x, y: spine_p2_y };

  const outerLegEdge = getParallelLineSegment(
    legSpineP1,
    legSpineP2,
    limbT / 2,
    "right",
  );
  const innerLegEdge = getParallelLineSegment(
    legSpineP1,
    legSpineP2,
    limbT / 2,
    "left",
  );

  const p_leg_outer_top = outerLegEdge.p1;
  const p_leg_outer_bottom = outerLegEdge.p2;
  let p_leg_inner_top = innerLegEdge.p1;
  const p_leg_inner_bottom = innerLegEdge.p2;

  // Snap p_leg_inner_top to the intended connection point if very close, or ensure path connects
  // For simplicity in path drawing, we'll draw a line to (limbT, H_bowl_bottom_y) if it's not already there.

  // --- Construct Path Data ---
  const pathEl = document.createElementNS(svgNS, "path");

  const outerPathData = [
    `M 0 0`, // Top-left of stem
    `L ${limbT} 0`, // Top-right of stem

    // Outer bowl curve using a Cubic Bezier:
    // Control point 1: (W_bowl_max_x, 0) - influences top curve
    // Control point 2: (W_bowl_max_x, H_bowl_bottom_y) - influences bottom curve towards leg
    // Endpoint: p_leg_outer_top
    `C ${W_bowl_max_x} 0 ${W_bowl_max_x} ${H_bowl_bottom_y} ${p_leg_outer_top.x.toFixed(3)} ${p_leg_outer_top.y.toFixed(3)}`,

    `L ${p_leg_outer_bottom.x.toFixed(3)} ${p_leg_outer_bottom.y.toFixed(3)}`, // Outer edge of leg
    `L ${p_leg_inner_bottom.x.toFixed(3)} ${p_leg_inner_bottom.y.toFixed(3)}`, // Bottom of leg
    `L ${p_leg_inner_top.x.toFixed(3)} ${p_leg_inner_top.y.toFixed(3)}`, // Inner edge of leg

    // Connect inner leg edge to stem at (limbT, H_bowl_bottom_y)
    // This handles cases where p_leg_inner_top isn't exactly on that point due to calculation.
    `L ${limbT} ${H_bowl_bottom_y.toFixed(3)}`,

    `L ${limbT} ${VIEWBOX_HEIGHT}`, // Down the rest of the stem
    `L 0 ${VIEWBOX_HEIGHT}`, // Bottom-left of stem
    `Z`, // Close path
  ].join(" ");

  // Inner hole for the bowl
  const holeInset = limbT * HOLE_INSET_FACTOR;
  const holeTopY = holeInset;
  const holeBottomY = H_bowl_bottom_y - holeInset;
  const holeRightmostX = W_bowl_max_x - limbT; // Rightmost extent of the hole's curve

  // Ensure hole dimensions are positive
  if (holeBottomY > holeTopY && holeRightmostX > limbT) {
    const innerHolePathData = [
      `M ${limbT} ${holeTopY.toFixed(3)}`, // Top-left of hole (on stem)
      // Cubic Bezier for the hole's D-shape curve (counter-clockwise for fill-rule)
      // Control point 1: (holeRightmostX, holeTopY)
      // Control point 2: (holeRightmostX, holeBottomY)
      // Endpoint: (limbT, holeBottomY)
      `C ${holeRightmostX.toFixed(3)} ${holeTopY.toFixed(3)} ${holeRightmostX.toFixed(3)} ${holeBottomY.toFixed(3)} ${limbT} ${holeBottomY.toFixed(3)}`,
      `L ${limbT} ${holeTopY.toFixed(3)}`, // Close hole along the stem
      `Z`,
    ].join(" ");
    pathEl.setAttribute("d", `${outerPathData} ${innerHolePathData}`);
    pathEl.setAttribute("fill-rule", "evenodd"); // evenodd is often simpler for complex shapes with holes
  } else {
    // If hole would be invalid (e.g., limbT too large), draw only outer path
    pathEl.setAttribute("d", outerPathData);
  }

  pathEl.setAttribute("fill", fillColor);
  pathEl.setAttribute("stroke", outlineColor);
  pathEl.setAttribute("stroke-width", String(outlineW));
  pathEl.setAttribute("stroke-linejoin", "miter");

  svg.appendChild(pathEl);

  // --- Attachment Points Calculation ---
  const eyeY = H_bowl_bottom_y * 0.35;
  const bowlInnerWidth = holeRightmostX - limbT;
  const eyeLX = limbT + bowlInnerWidth * 0.25;
  const eyeRX = limbT + bowlInnerWidth * 0.75;
  const mouthX = limbT + bowlInnerWidth * 0.5;
  const mouthY = H_bowl_bottom_y * 0.7;

  const attachments: AttachmentList = {
    leftEye: { x: eyeLX, y: eyeY },
    rightEye: { x: eyeRX, y: eyeY },
    mouth: { x: mouthX, y: mouthY },

    hat: { x: limbT / 2, y: outlineW / 2 },
    leftArm: { x: outlineW / 2, y: VIEWBOX_HEIGHT * 0.45 },
    // Place right arm on the bowl's outer edge, vertically aligned with left arm
    rightArm: { x: W_bowl_max_x + outlineW / 2, y: VIEWBOX_HEIGHT * 0.45 },

    leftLeg: { x: limbT / 2, y: VIEWBOX_HEIGHT - outlineW / 2 },
    // Center right leg under the diagonal leg's foot
    rightLeg: {
      x: midpoint(p_leg_outer_bottom, p_leg_inner_bottom).x,
      y: VIEWBOX_HEIGHT - outlineW / 2,
    },
  };

  return {
    svg: svg,
    attachments: attachments,
  };
}

export default renderR_uppercase;
