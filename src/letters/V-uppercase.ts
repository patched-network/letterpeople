// letterpeople/src/letters/V-uppercase.ts
import type {
  LetterOptions,
  InternalLetterRenderResult,
  Point,
  AttachmentList,
} from "../types";

// Define constants for our coordinate space
const VIEWBOX_WIDTH = 80;
const VIEWBOX_HEIGHT = 100;
const DEFAULT_LIMB_THICKNESS = 20;
const DEFAULT_OUTLINE_WIDTH = 2;

// V-specific geometry constants
const DEFAULT_TOP_Y_OFFSET = 0; // Starts at the very top
const DEFAULT_BOTTOM_Y_OFFSET = 0; // Apex reaches the very bottom
const DEFAULT_HORIZONTAL_SPREAD_AT_TOP = VIEWBOX_WIDTH * 0.9; // V is 90% of viewBox width at the top

// --- Geometry Helper Functions (re-used from A-uppercase.ts) ---
interface Line {
  p1: Point;
  p2: Point;
}

function getIntersectionPoint(line1: Line, line2: Line): Point | null {
  const { p1: l1p1, p2: l1p2 } = line1;
  const { p1: l2p1, p2: l2p2 } = line2;
  const d =
    (l1p1.x - l1p2.x) * (l2p1.y - l2p2.y) -
    (l1p1.y - l1p2.y) * (l2p1.x - l2p2.x);
  if (d === 0) return null;
  const t =
    ((l1p1.x - l2p1.x) * (l2p1.y - l2p2.y) -
      (l1p1.y - l2p1.y) * (l2p1.x - l2p2.x)) /
    d;
  return {
    x: l1p1.x + t * (l1p2.x - l1p1.x),
    y: l1p1.y + t * (l1p2.y - l1p1.y),
  };
}

function getParallelLine(
  p1: Point,
  p2: Point,
  distance: number,
  side: "left" | "right",
): Line {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const L = Math.sqrt(dx * dx + dy * dy);
  if (L === 0) return { p1: { ...p1 }, p2: { ...p2 } };
  let nx = -dy / L;
  let ny = dx / L;
  if (side === "right") {
    nx = -nx;
    ny = -ny;
  }
  return {
    p1: { x: p1.x + distance * nx, y: p1.y + distance * ny },
    p2: { x: p2.x + distance * nx, y: p2.y + distance * ny },
  };
}

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
  const lineOuterLeftLeg: Line = { p1: OTL, p2: OBA };
  const lineOuterRightLeg: Line = { p1: OTR, p2: OBA };

  // Inner leg lines (parallel to outer legs, offset inwards)
  const lineInnerLeftLeg = getParallelLine(OTL, OBA, limbT, "right");
  const lineInnerRightLeg = getParallelLine(OTR, OBA, limbT, "left");

  // Top inner horizontal line (where inner legs meet the top thickness)
  const lineTopInnerHorizontal: Line = {
    p1: { x: 0, y: topY },
    p2: { x: W, y: topY },
  };

  // Calculate intersection points
  const ITL = getIntersectionPoint(lineInnerLeftLeg, lineTopInnerHorizontal); // Inner Top Left
  const ITR = getIntersectionPoint(lineInnerRightLeg, lineTopInnerHorizontal); // Inner Top Right
  const IBA = getIntersectionPoint(lineInnerLeftLeg, lineInnerRightLeg); // Inner Bottom Apex

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
  const midUpperWidth = (ITR.x + ITL.x) / 2;

  const attachments: AttachmentList = {
    leftEye: { x: midUpperWidth - (ITR.x - ITL.x) * 0.5, y: eyeY },
    rightEye: { x: midUpperWidth + (ITR.x - ITL.x) * 0.5, y: eyeY },
    mouth: { x: hCenter, y: eyeY + limbT * 1.8 },

    hat: { x: hCenter, y: topY - outlineW / 2 }, // On top of the V's highest point

    // Arms mid-height on the outer edges of the V
    // Approximate mid-point Y of the V's slanted edge
    leftArm: { x: OTL.x - outlineW, y: (OTL.y + OBA.y) / 2 },
    rightArm: { x: OTR.x + outlineW, y: (OTR.y + OBA.y) / 2 },

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
