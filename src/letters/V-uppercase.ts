// letterpeople/src/letters/V-uppercase.ts
import type {
  LetterOptions,
  InternalLetterRenderResult,
  AttachmentList,
} from "../types";
import {
  Point,
  Line,
  getLineIntersection,
  getParallelLineSegment,
  midpoint,
} from "../util/geometry";

// Define constants for our coordinate space
const VIEWBOX_WIDTH = 80;
const VIEWBOX_HEIGHT = 100;
const DEFAULT_LIMB_THICKNESS = 20;
const DEFAULT_OUTLINE_WIDTH = 2;

// V-specific geometry constants
const DEFAULT_TOP_Y_OFFSET = 0; // Starts at the very top
const DEFAULT_BOTTOM_Y_OFFSET = 0; // Apex reaches the very bottom
const DEFAULT_HORIZONTAL_SPREAD_AT_TOP = VIEWBOX_WIDTH * 0.9; // V is 90% of viewBox width at the top

// Using imported geometry utilities from "../util/geometry"

/**
 * @internal
 * Renders the base shape and calculates attachment points for the uppercase letter 'V'.
 *
 * @param options - Configuration options for the letter's appearance.
 * @returns An object containing the base SVG element and attachment coordinates.
 */
function renderV_uppercase(
  options?: LetterOptions,
): InternalLetterRenderResult {
  // --- SVG Setup ---
  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("viewBox", `0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`);
  svg.setAttribute("class", "letter-base letter-V-uppercase");

  // --- Options Processing ---
  const limbT = options?.lineWidth ?? DEFAULT_LIMB_THICKNESS;
  const fillColor = options?.color ?? "currentColor";
  const outlineColor = options?.borderColor ?? "black";
  const outlineW = options?.borderWidth ?? DEFAULT_OUTLINE_WIDTH;

  // V-specific geometry parameters from options or defaults
  const topYOffset = DEFAULT_TOP_Y_OFFSET;
  const bottomYOffset = DEFAULT_BOTTOM_Y_OFFSET;
  const horizontalSpread = DEFAULT_HORIZONTAL_SPREAD_AT_TOP;

  // --- Define Key Coordinates ---
  const W = VIEWBOX_WIDTH;
  const H = VIEWBOX_HEIGHT;
  const hCenter = W / 2;

  const topY = topYOffset;
  const bottomY = H - bottomYOffset;

  // Outer vertices of the 'V'
  const OTL: Point = { x: hCenter - horizontalSpread / 2, y: topY }; // Outer Top Left
  const OTR: Point = { x: hCenter + horizontalSpread / 2, y: topY }; // Outer Top Right
  const OBA: Point = { x: hCenter, y: bottomY }; // Outer Bottom Apex

  // Define lines for geometry calculations

  // Inner leg lines (parallel to outer legs, offset inwards)
  const lineInnerLeftLeg = getParallelLineSegment(OTL, OBA, limbT, "right");
  const lineInnerRightLeg = getParallelLineSegment(OTR, OBA, limbT, "left");

  // Top inner horizontal line (where inner legs meet the top thickness)
  const lineTopInnerHorizontal: Line = {
    p1: { x: 0, y: topY },
    p2: { x: W, y: topY },
  };

  // Calculate intersection points
  const ITL = getLineIntersection(lineInnerLeftLeg, lineTopInnerHorizontal); // Inner Top Left
  const ITR = getLineIntersection(lineInnerRightLeg, lineTopInnerHorizontal); // Inner Top Right
  const IBA = getLineIntersection(lineInnerLeftLeg, lineInnerRightLeg); // Inner Bottom Apex

  if (!ITL || !ITR || !IBA) {
    console.error(
      "Letter 'V': Failed to calculate some inner intersection points. Check limbThickness or geometry.",
    );
    throw new Error(
      "Letter 'V': Failed to calculate some inner intersection points. Check limbThickness or geometry.",
    );
  }

  // Safety check: If IBA is above ITL/ITR, the V has "closed up" due to large limbThickness.
  // This might lead to an undesirable shape. For now, we'll draw it as calculated.
  // A more robust solution might cap limbThickness or adjust geometry.
  if (IBA.y < ITL.y || IBA.y < ITR.y) {
    console.warn(
      "Letter 'V': Inner bottom apex is above inner top points. LimbThickness might be too large for current V geometry.",
    );
  }

  // --- Construct Path Data ---
  const pathEl = document.createElementNS(svgNS, "path");
  const pathData = [
    `M ${OTL.x.toFixed(3)} ${OTL.y.toFixed(3)}`, // Outer Top Left
    `L ${ITL.x.toFixed(3)} ${ITL.y.toFixed(3)}`, // Inner Top Left
    `L ${IBA.x.toFixed(3)} ${(IBA.y + VIEWBOX_HEIGHT / 8).toFixed(3)}`, // Inner Bottom Apex
    `L ${ITR.x.toFixed(3)} ${ITR.y.toFixed(3)}`, // Inner Top Right
    `L ${OTR.x.toFixed(3)} ${OTR.y.toFixed(3)}`, // Outer Top Right
    `L ${OBA.x.toFixed(3)} ${OBA.y.toFixed(3)}`, // Outer Bottom Apex
    `Z`, // Close path (connects OBA to OTL)
  ].join(" ");

  pathEl.setAttribute("d", pathData);
  pathEl.setAttribute("fill", fillColor);
  pathEl.setAttribute("stroke", outlineColor);
  pathEl.setAttribute("stroke-width", String(outlineW));
  pathEl.setAttribute("stroke-linejoin", "miter"); // Miter for sharp 'V' corners

  svg.appendChild(pathEl);

  // --- Attachment Points Calculation ---
  // Eyes on the upper part, spread based on inner top points
  const eyeY = topY + limbT * 1.5; // Position eyes somewhat below the top inner edge
  const midUpperWidth = midpoint(ITL, ITR).x;

  const attachments: AttachmentList = {
    leftEye: { x: midUpperWidth - (ITR.x - ITL.x) * 0.5, y: eyeY },
    rightEye: { x: midUpperWidth + (ITR.x - ITL.x) * 0.5, y: eyeY },
    mouth: { x: hCenter, y: eyeY + limbT * 1.8 },

    hat: { x: hCenter, y: topY - outlineW / 2 }, // On top of the V's highest point

    // Arms mid-height on the outer edges of the V
    // Approximate mid-point Y of the V's slanted edge
    leftArm: { x: OTL.x - outlineW, y: midpoint(OTL, OBA).y },
    rightArm: { x: OTR.x + outlineW, y: midpoint(OTR, OBA).y },

    // Legs near the bottom apex
    leftLeg: { x: OBA.x - limbT * 0.7, y: OBA.y - outlineW / 2 },
    rightLeg: { x: OBA.x + limbT * 0.7, y: OBA.y - outlineW / 2 },
  };

  return {
    svg: svg,
    attachments: attachments,
  };
}

export default renderV_uppercase;
