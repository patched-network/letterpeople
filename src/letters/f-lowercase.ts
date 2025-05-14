// letterpeople/src/letters/r-lowercase.ts
import type {
  LetterOptions,
  InternalLetterRenderResult,
  AttachmentList,
} from "../types";
import {
  Circle,
  Point,
  getVerticalLineCircleIntersections,
  midpoint,
  pointAtAngle,
} from "../util/geometry";
import {
  lowerCaseCircles,
  placeFaceFeatures,
} from "../util/circle-letter-utils";
import { EFFECTIVE_LOWERCASE_HEIGHT, VIEWBOX_HEIGHT } from "./CONSTS";

// Define constants for our coordinate space
const VIEWBOX_WIDTH = 60;

// TODO: These should ideally be imported from a shared constants file
const DEFAULT_LIMB_THICKNESS = 8;
const DEFAULT_OUTLINE_WIDTH = 1;

/**
 * @internal
 * Renders the base shape and calculates attachment points for the lowercase letter 'f'.
 *
 * @param options - Configuration options for the letter's appearance.
 * @returns An object containing the base SVG element and attachment coordinates.
 */
function renderF_lowercase(
  options?: LetterOptions,
): InternalLetterRenderResult {
  // --- SVG Setup ---
  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("viewBox", `0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`);
  svg.setAttribute("class", "letter-base letter-r-lowercase");

  // --- Options Processing ---
  const limbThickness = options?.lineWidth ?? DEFAULT_LIMB_THICKNESS;
  const fillColor = options?.color ?? "currentColor";
  const outlineColor = options?.borderColor ?? "black";
  const outlineWidth = options?.borderWidth ?? DEFAULT_OUTLINE_WIDTH;
  const stemWidth = limbThickness;

  // --- Calculate Dimensions and Positions ---
  const W = VIEWBOX_WIDTH;
  const H = VIEWBOX_HEIGHT;

  // Vertical stem position (left side)
  const stemLeftEdgeX = (W - stemWidth) / 2;
  const stemRightEdgeX = stemLeftEdgeX + stemWidth;

  /** Defining the arc at top of `f` */
  const circles = lowerCaseCircles(limbThickness);
  // tangent to top of viewbox
  circles.inner.y = circles.outer.r;
  circles.outer.y = circles.outer.r;
  // position onto stem
  circles.inner.x = stemLeftEdgeX + circles.outer.r;
  circles.outer.x = stemLeftEdgeX + circles.outer.r;

  const stemTopY = circles.inner.y; // Start at lowercase height
  const stemBottomY = H;
  const crossTopY = H - EFFECTIVE_LOWERCASE_HEIGHT;
  const crossBottomY = crossTopY + limbThickness;
  const upperArcPoint = pointAtAngle(-40, circles.outer);
  const lowerArcPoint = pointAtAngle(-40, circles.inner);

  // Log circle and arc point values for debugging
  console.log("Inner circle:", {
    x: circles.inner.x,
    y: circles.inner.y,
    r: circles.inner.r,
  });
  console.log("Outer circle:", {
    x: circles.outer.x,
    y: circles.outer.y,
    r: circles.outer.r,
  });
  console.log("Upper arc point:", upperArcPoint);
  console.log("Lower arc point:", lowerArcPoint);

  // --- Path Definition ---
  const path = document.createElementNS(svgNS, "path");
  // Start at the top left of the stem, then move clockwise
  const pathData = [
    `M ${stemLeftEdgeX} ${stemTopY}`,
    `A ${circles.outer.r} ${circles.outer.r} 0 0 1 ${upperArcPoint.x} ${upperArcPoint.y}`,
    `L ${lowerArcPoint.x} ${lowerArcPoint.y}`,
    `A ${circles.inner.r} ${circles.inner.r} 0 0 0 ${stemRightEdgeX} ${stemTopY}`,
    `L ${stemRightEdgeX} ${crossTopY}`,
    `L ${stemRightEdgeX + limbThickness * 0.65} ${crossTopY}`,
    `L ${stemRightEdgeX + limbThickness * 0.65} ${crossBottomY}`,
    `L ${stemRightEdgeX} ${crossBottomY}`,
    `L ${stemRightEdgeX} ${stemBottomY}`,
    `L ${stemLeftEdgeX} ${stemBottomY}`,
    `L ${stemLeftEdgeX} ${crossBottomY}`,
    `L ${stemLeftEdgeX - limbThickness * 0.65} ${crossBottomY}`,
    `L ${stemLeftEdgeX - limbThickness * 0.65} ${crossTopY}`,
    `L ${stemLeftEdgeX} ${crossTopY}`,
    `L ${stemLeftEdgeX} ${stemTopY}`,

    `Z`, // Close path
  ].join(" ");

  // ... rest of your function
  path.setAttribute("d", pathData);
  path.setAttribute("fill", fillColor);
  path.setAttribute("stroke", outlineColor);
  path.setAttribute("stroke-width", String(outlineWidth));
  path.setAttribute("stroke-linejoin", "round");

  svg.appendChild(path);

  // --- Attachment Points Calculation ---
  // For r, we'll place facial features on the hook arc

  const faceFeatures = placeFaceFeatures(circles.inner, circles.outer, 50, 20);

  const attachments: AttachmentList = {
    // Eyes positioned at either end of the arc
    leftEye: faceFeatures.left,
    rightEye: faceFeatures.right,

    // Mouth positioned at the curve of the arc
    mouth: {
      x: W / 2,
      y: crossTopY + limbThickness / 3,
    },

    // Hat sits on top of the stem
    hat: { x: circles.inner.x, y: 0 },

    // Arms
    leftArm: { x: stemLeftEdgeX, y: crossBottomY + limbThickness / 2 }, // On the stem
    rightArm: { x: stemRightEdgeX, y: crossBottomY + limbThickness / 2 },

    // Legs at the bottom of the stem
    leftLeg: { x: stemLeftEdgeX + stemWidth * 0.25, y: H - outlineWidth / 2 },
    rightLeg: { x: stemLeftEdgeX + stemWidth * 0.75, y: H - outlineWidth / 2 },
  };

  return {
    svg: svg,
    attachments: attachments,
  };
}

export default renderF_lowercase;
