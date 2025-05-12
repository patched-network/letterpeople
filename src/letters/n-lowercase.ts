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
import { win32 } from "node:path/win32";

// Define constants for our coordinate space
const VIEWBOX_WIDTH = 60;

// TODO: These should ideally be imported from a shared constants file
const DEFAULT_LIMB_THICKNESS = 8;
const DEFAULT_OUTLINE_WIDTH = 1;

/**
 * @internal
 * Renders the base shape and calculates attachment points for the lowercase letter 'r'.
 * This function uses a vertical stem on the left with a quarter circle hook at the top right.
 *
 * @param options - Configuration options for the letter's appearance.
 * @returns An object containing the base SVG element and attachment coordinates.
 */
function renderR_lowercase(
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
  const stemLeftEdgeX = 0;
  const stemRightEdgeX = stemLeftEdgeX + stemWidth;
  const stemTopY = H - EFFECTIVE_LOWERCASE_HEIGHT; // Start at lowercase height
  const stemBottomY = H;

  const stemUpperLeft: Point = {
    x: stemLeftEdgeX,
    y: stemTopY,
  };
  const stemUpperRight: Point = {
    x: stemRightEdgeX,
    y: stemTopY,
  };
  const stemBottomLeft: Point = {
    x: stemLeftEdgeX,
    y: stemBottomY,
  };
  const stemBottomRight: Point = {
    x: stemRightEdgeX,
    y: stemBottomY,
  };

  const circles = lowerCaseCircles(limbThickness);

  const upperArcStemIntersection = getVerticalLineCircleIntersections(
    stemRightEdgeX,
    circles.outer,
  ).upperIntersection!;
  const lowerArcStemIntersection = getVerticalLineCircleIntersections(
    stemRightEdgeX,
    circles.inner,
  ).upperIntersection!;

  const smallLegOutsideX = circles.outer.r * 2;
  const smallLegInsideX = smallLegOutsideX - limbThickness;
  const smallLegTopY = circles.outer.y;
  const smallLegBottomY = H;

  if (!upperArcStemIntersection) {
    alert("no upperintersection");
  }
  if (!lowerArcStemIntersection) {
    alert("no lowerIntersection");
  }

  // --- Path Definition ---
  const path = document.createElementNS(svgNS, "path");
  // Start at the top left of the stem, then move clockwise
  const pathData = [
    `M ${stemUpperLeft.x} ${stemUpperLeft.y}`, // Start at the upper left
    `L ${stemUpperRight.x} ${stemUpperRight.y}`, // Line across
    `L ${upperArcStemIntersection.x} ${upperArcStemIntersection.y}`, // Line down to where the arc begins
    `A ${circles.outer.r} ${circles.outer.r} 0 0 1 ${smallLegOutsideX} ${smallLegTopY}`, // Arc out to top of small leg
    `L ${smallLegOutsideX} ${smallLegBottomY}`, // Line to the lower point of smaller leg
    `L ${smallLegInsideX} ${smallLegBottomY}`, // Line to the inside point of smaller leg
    `L ${smallLegInsideX} ${smallLegTopY}`, // Line to the inside point of smaller leg
    `A ${circles.inner.r} ${circles.inner.r} 0 0 0 ${lowerArcStemIntersection.x} ${lowerArcStemIntersection.y}`, // arc back to stem
    `L ${stemRightEdgeX} ${stemBottomY}`, // Line down to bottom right of stem
    `L ${stemLeftEdgeX} ${stemBottomY}`, // Line to top left of stem
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
      x: limbThickness / 2,
      y: lowerArcStemIntersection.y + limbThickness / 2,
    },

    // Hat sits on top of the stem
    hat: { x: stemWidth / 2, y: stemTopY - outlineWidth / 2 },

    // Arms
    leftArm: { x: outlineWidth / 2, y: H * 0.6 }, // On the stem
    rightArm: { x: smallLegOutsideX, y: smallLegTopY }, // At the end of the arc

    // Legs at the bottom of the stem
    leftLeg: { x: stemLeftEdgeX + stemWidth * 0.25, y: H - outlineWidth / 2 },
    rightLeg: { x: stemLeftEdgeX + stemWidth * 0.75, y: H - outlineWidth / 2 },
  };

  return {
    svg: svg,
    attachments: attachments,
  };
}

export default renderR_lowercase;
