// letterpeople/src/letters/U-uppercase.ts
import type {
  LetterOptions,
  InternalLetterRenderResult,
  AttachmentList,
} from "../types";
import {
  Circle,
  Point,
  getVerticalLineCircleIntersections,
} from "../util/geometry";
import { placeFaceFeatures } from "../util/circle-letter-utils";
import { VIEWBOX_HEIGHT } from "./CONSTS";

// Define constants for our coordinate space
const VIEWBOX_WIDTH = 70;

// Constants for the letter's appearance
const DEFAULT_LIMB_THICKNESS = 12;
const DEFAULT_OUTLINE_WIDTH = 1;

/**
 * @internal
 * Renders the base shape and calculates attachment points for the uppercase letter 'U'.
 * This function uses a semicircular bottom with two vertical stems on the sides.
 *
 * @param options - Configuration options for the letter's appearance.
 * @returns An object containing the base SVG element and attachment coordinates.
 */
function renderU_uppercase(
  options?: LetterOptions,
): InternalLetterRenderResult {
  // --- SVG Setup ---
  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("viewBox", `0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`);
  svg.setAttribute("class", "letter-base letter-U-uppercase");

  // --- Options Processing ---
  const limbThickness = options?.lineWidth ?? DEFAULT_LIMB_THICKNESS;
  const fillColor = options?.color ?? "currentColor";
  const outlineColor = options?.borderColor ?? "black";
  const outlineWidth = options?.borderWidth ?? DEFAULT_OUTLINE_WIDTH;

  // --- Calculate Dimensions and Positions ---
  const W = VIEWBOX_WIDTH;
  const H = VIEWBOX_HEIGHT;

  // Calculate the U dimensions
  const stemWidth = limbThickness;
  const uWidth = W - 2 * stemWidth; // Width between the middle of both stems

  // Define the center and radius of the semicircular bottom
  const outerCircleRadius = W / 2;
  const circleCenterX = W / 2;
  const circleCenterY = H - outerCircleRadius;

  // Define the inner circle (creates the thickness of the curve)
  const innerCircleRadius = Math.max(outerCircleRadius - limbThickness, 0);

  // Calculate vertical stem positions
  const leftStemOuterX = 0;
  const leftStemInnerX = stemWidth;
  const rightStemInnerX = W - stemWidth;
  const rightStemOuterX = W;

  // Calculate where the stems connect to the semicircle
  const stemConnectionPointY = circleCenterY;

  // Outer and inner circles
  const outerCircle: Circle = {
    x: circleCenterX,
    y: circleCenterY,
    r: outerCircleRadius,
  };

  const innerCircle: Circle = {
    x: circleCenterX,
    y: circleCenterY,
    r: innerCircleRadius,
  };

  // --- Path Definition ---
  const path = document.createElementNS(svgNS, "path");

  // Define the outer and inner paths for the letter U
  const pathData = [
    // Start at top left of left stem
    `M ${leftStemOuterX} ${0}`,

    // Draw right across top of left stem
    `L ${leftStemInnerX} ${0}`,

    // Draw down left stem inner edge to where it meets the semicircle
    `L ${leftStemInnerX} ${stemConnectionPointY}`,

    // Draw inner semicircle from left to right
    `A ${innerCircleRadius} ${innerCircleRadius} 0 0 0 ${rightStemInnerX} ${stemConnectionPointY}`,

    // Draw up right stem inner edge
    `L ${rightStemInnerX} ${0}`,

    // Draw right across top of right stem
    `L ${rightStemOuterX} ${0}`,

    // Draw down right stem outer edge
    `L ${rightStemOuterX} ${stemConnectionPointY}`,

    // Draw outer semicircle from right to left
    `A ${outerCircleRadius} ${outerCircleRadius} 0 0 1 ${leftStemOuterX} ${stemConnectionPointY}`,

    // Draw up left stem outer edge back to starting point
    `L ${leftStemOuterX} ${0}`,

    // Close the path
    `Z`,
  ].join(" ");

  path.setAttribute("d", pathData);
  path.setAttribute("fill", fillColor);
  path.setAttribute("stroke", outlineColor);
  path.setAttribute("stroke-width", String(outlineWidth));
  path.setAttribute("stroke-linejoin", "round");

  svg.appendChild(path);

  // --- Attachment Points Calculation ---
  // Calculate face features (eyes and mouth) within the semicircle
  // Position in the middle of the stroke thickness
  // Calculate midpoint radius for face features
  const midRadius = (innerCircleRadius + outerCircleRadius) / 2;

  // Place face features in the bottom semicircle
  const faceFeatures = placeFaceFeatures(
    innerCircle,
    outerCircle,
    40, // eye separation
    10, // mouth offset
  );

  const attachments: AttachmentList = {
    // Eyes and mouth positioned in the bottom semicircle
    leftEye: { x: limbThickness / 2, y: limbThickness * 0.8 },
    rightEye: { x: W - limbThickness / 2, y: limbThickness * 0.8 },
    mouth: faceFeatures.mouth,

    // Hat sits on top of the letter
    hat: { x: (3 / 4) * limbThickness, y: outlineWidth / 2 },

    // Arms on the stems - position in the middle of the stems
    leftArm: { x: leftStemOuterX, y: H * 0.3 },
    rightArm: { x: rightStemOuterX, y: H * 0.3 },

    // Legs at the bottom of the semicircle
    leftLeg: {
      x: circleCenterX - outerCircleRadius / 2,
      y: H - outlineWidth / 2,
    },
    rightLeg: {
      x: circleCenterX + outerCircleRadius / 2,
      y: H - outlineWidth / 2,
    },
  };

  return {
    svg: svg,
    attachments: attachments,
  };
}

export default renderU_uppercase;
