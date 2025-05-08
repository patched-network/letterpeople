// letterpeople/src/letters/G-uppercase.ts
import type {
  LetterOptions,
  InternalLetterRenderResult,
  AttachmentList,
} from "../types";

// Define constants for our coordinate space
const VIEWBOX_WIDTH = 80; // Consistent with 'O'
const VIEWBOX_HEIGHT = 100;
const DEFAULT_LIMB_THICKNESS = 20; // Thickness of the 'G' body
const DEFAULT_OUTLINE_WIDTH = 2; // Default width for the border/stroke
const DEFAULT_OPENING_ANGLE_DEG = 40; // Half-angle of the G's opening (e.g., 40 means 80-degree total opening)

/**
 * @internal
 * Renders the base shape and calculates attachment points for the uppercase letter 'G'.
 *
 * @param options - Configuration options for the letter's appearance.
 * @returns An object containing the base SVG element and attachment coordinates.
 */
function renderG_uppercase(
  options?: LetterOptions,
): InternalLetterRenderResult {
  // --- SVG Setup ---
  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("viewBox", `0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`);
  svg.setAttribute("class", "letter-base letter-G-uppercase");

  // --- Options Processing ---
  const limbThickness = options?.lineWidth ?? DEFAULT_LIMB_THICKNESS;
  const fillColor = options?.color ?? "currentColor";
  const outlineColor = options?.borderColor ?? "black";
  const outlineWidth = options?.borderWidth ?? DEFAULT_OUTLINE_WIDTH;
  // const openingAngleDeg = DEFAULT_OPENING_ANGLE_DEG;

  // --- Path Definition ---
  const pathEl = document.createElementNS(svgNS, "path");

  const W = VIEWBOX_WIDTH;
  const H = VIEWBOX_HEIGHT;
  const cx = W / 2; // Center X
  const cy = H / 2; // Center Y

  // Outer ellipse radii
  const outerRx = (W - outlineWidth) / 2;
  const outerRy = (H - outlineWidth) / 2;

  // Inner ellipse radii (for the hole)
  const minInnerRadius = 1; // Minimum radius for the inner part to be drawable
  let innerRx = outerRx - limbThickness;
  let innerRy = outerRy - limbThickness;

  innerRx = Math.max(minInnerRadius, innerRx);
  innerRy = Math.max(minInnerRadius, innerRy);

  // Calculate angles for the opening points
  // Angles are in radians, 0 is to the right (East), positive is counter-clockwise.
  const angleTopOpenRad = (-50 * Math.PI) / 180;
  const angleBottomOpenRad = (10 * Math.PI) / 180;

  // Calculate key points for the path
  const pOuterTopOpen = {
    x: cx + outerRx * Math.cos(angleTopOpenRad),
    y: cy + outerRy * Math.sin(angleTopOpenRad),
  };
  const pOuterBottomOpen = {
    x: cx + outerRx * Math.cos(angleBottomOpenRad),
    y: cy + outerRy * Math.sin(angleBottomOpenRad),
  };
  const pInnerTopOpen = {
    x: cx + innerRx * Math.cos(angleTopOpenRad),
    y: cy + innerRy * Math.sin(angleTopOpenRad),
  };
  const pInnerBottomOpen = {
    x: cx + innerRx * Math.cos(angleBottomOpenRad),
    y: cy + innerRy * Math.sin(angleBottomOpenRad),
  };

  // Path data string:
  // 1. Move to outer top of opening.
  // 2. Arc along outer edge (CCW, large arc) to outer bottom of opening.
  // 3. Line to inner bottom of opening.
  // 4. Arc along inner edge (CW, large arc) to inner top of opening.
  // 5. Close path (line to outer top of opening).
  const d = [
    `M ${pOuterTopOpen.x.toFixed(3)} ${pOuterTopOpen.y.toFixed(3)}`,
    `A ${outerRx.toFixed(3)} ${outerRy.toFixed(3)} 0 1 0 ${pOuterBottomOpen.x.toFixed(3)} ${pOuterBottomOpen.y.toFixed(3)}`, // Outer arc (CCW)
    // the 'stroke' of the G
    `H ${pOuterBottomOpen.x + limbThickness * 0.4}`,
    `V ${pOuterBottomOpen.y - limbThickness * 0.8}`,
    `H ${pInnerBottomOpen.x - limbThickness * 0.45}`,
    `V ${pOuterBottomOpen.y}`,

    `L ${pInnerBottomOpen.x.toFixed(3)} ${pOuterBottomOpen.y.toFixed(3)}`,
    `A ${innerRx.toFixed(3)} ${innerRy.toFixed(3)} 0 1 1 ${pInnerTopOpen.x.toFixed(3)} ${pInnerTopOpen.y.toFixed(3)}`, // Inner arc (CW)
    `Z`,
  ].join(" ");

  pathEl.setAttribute("d", d);
  pathEl.setAttribute("fill", fillColor);
  pathEl.setAttribute("stroke", outlineColor);
  pathEl.setAttribute("stroke-width", String(outlineWidth));
  pathEl.setAttribute("stroke-linejoin", "round"); // Round is better for curves

  svg.appendChild(pathEl);

  // --- Attachment Points Calculation ---
  const attachments: AttachmentList = {
    // Eyes in the hollow part, slightly left-biased
    leftEye: { x: cx - innerRx * 0.5, y: cy - (innerRy + outerRy - 3) / 2 },
    rightEye: { x: cx + innerRx * 0.5, y: cy - (innerRy + outerRy - 3) / 2 },
    mouth: { x: cx - innerRx * 0.1, y: cy + (innerRy + outerRy) / 2 },

    // Hat sits centered on top of the G's curve (highest point of G)
    hat: { x: cx, y: cy - outerRy + outlineWidth / 2 },

    // Left arm on the far left of the G's curve
    leftArm: { x: cx - outerRx - outlineWidth / 2, y: cy },
    // Right arm in the middle of the top opening's thickness
    rightArm: {
      x: (pOuterTopOpen.x + pInnerTopOpen.x) / 2,
      y: (pOuterTopOpen.y + pInnerTopOpen.y) / 2,
    },

    // Left leg towards the bottom-left of the G's curve
    leftLeg: { x: cx - outerRx * 0.5, y: cy + outerRy - outlineWidth / 2 },
    // Right leg in the middle of the bottom opening's thickness
    rightLeg: {
      x: (pOuterBottomOpen.x + pInnerBottomOpen.x) / 2,
      y: (pOuterBottomOpen.y + pInnerBottomOpen.y) / 2,
    },
  };

  return {
    svg: svg,
    attachments: attachments,
  };
}

export default renderG_uppercase;
