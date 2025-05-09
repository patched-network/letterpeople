// letterpeople/src/letters/j-lowercase.ts
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
const DEFAULT_LIMB_THICKNESS = 10;
const DEFAULT_OUTLINE_WIDTH = 1;

/**
 * @internal
 * Renders the base shape and calculates attachment points for the uppercase letter 'J'.
 * This function creates a letter with a horizontal bar at the top and a curved hook at the bottom.
 *
 * @param options - Configuration options for the letter's appearance.
 * @returns An object containing the base SVG element and attachment coordinates.
 */
function renderJ_uppercase(
  options?: LetterOptions,
): InternalLetterRenderResult {
  // --- SVG Setup ---
  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  // The lower case j is a special case for the view box definition, because it has
  // both a descender and an ascendant piecs (the dot)
  svg.setAttribute("viewBox", `0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT + 35}`);
  svg.setAttribute("class", "letter-base letter-J-uppercase");

  // --- Options Processing ---
  const limbThickness = options?.lineWidth ?? DEFAULT_LIMB_THICKNESS;
  const fillColor = options?.color ?? "currentColor";
  const outlineColor = options?.borderColor ?? "black";
  const outlineWidth = options?.borderWidth ?? DEFAULT_OUTLINE_WIDTH;
  const dotDiameter = options?.lineWidth
    ? options.lineWidth * 1.6
    : DEFAULT_DOT_DIAMETER;

  // --- Calculate Dimensions and Positions ---
  const W = VIEWBOX_WIDTH;
  const H = VIEWBOX_HEIGHT;

  // J dimensions
  const stemWidth = limbThickness;
  const topBarWidth = W * 0.65; // Width of horizontal bar at top

  // Center of the stem
  const stemCenterX = W * 0.65;

  // Left and right edges of the stem
  const stemLeftX = stemCenterX - stemWidth / 2;
  const stemRightX = stemCenterX + stemWidth / 2;
  const stemTopY = 0;

  // Bottom curve dimensions
  const curveRadius = W * 0.25;
  const curveCenterX = curveRadius + limbThickness / 2;
  const curveCenterY = H - (curveRadius + limbThickness / 2);

  // // Horizontal bar coordinates
  // const barLeftX = stemCenterX - topBarWidth / 2;
  // const barRightX = stemCenterX + topBarWidth / 2;
  // const barTopY = 0;
  // const barBottomY = limbThickness;

  // Where the stem meets the curve
  const stemBottomY = curveCenterY;

  // --- Path Definition ---
  const path = document.createElementNS(svgNS, "path");
  const pathData = [
    // Start at top-left of horizontal bar
    `M ${stemLeftX} ${stemTopY}`,

    // Draw across top of stem
    `L ${stemRightX} ${stemTopY}`,

    // Draw down right side of stem
    `L ${stemRightX} ${stemBottomY}`,

    // Draw curve from bottom right to bottom left
    `A ${curveRadius} ${curveRadius * 0.8} 0 0 1 ${curveCenterX - 2 * curveRadius} ${curveCenterY}`,

    // Draw leftmost point of curve
    `L ${curveCenterX - curveRadius} ${curveCenterY}`,

    // Draw outer curve back to stem
    `A ${curveRadius - limbThickness} ${curveRadius - limbThickness} 0 0 0 ${stemLeftX} ${stemBottomY}`,

    // Draw up left side of stem
    `L ${stemLeftX} ${stemTopY}`,

    // Close path
    `Z`,
  ].join(" ");

  path.setAttribute("d", pathData);
  path.setAttribute("fill", fillColor);
  path.setAttribute("stroke", outlineColor);
  path.setAttribute("stroke-width", String(outlineWidth));
  path.setAttribute("stroke-linejoin", "round");
  svg.appendChild(path);

  // --- Dot definition ---
  // Dot is centered over the stem
  const dotRadius = dotDiameter / 2;
  const dotCenterX = stemCenterX;
  const dotCenterY = -(2 + dotRadius);

  const dot = document.createElementNS(svgNS, "circle");
  dot.setAttribute("cx", String(dotCenterX));
  dot.setAttribute("cy", String(dotCenterY));
  dot.setAttribute("r", String(dotRadius));
  dot.setAttribute("fill", fillColor);
  dot.setAttribute("stroke", outlineColor);
  dot.setAttribute("stroke-width", String(outlineWidth));

  svg.appendChild(dot);

  // --- Attachment Points Calculation ---
  // Define circle for face features
  const faceCircle: Circle = {
    x: curveCenterX,
    y: curveCenterY,
    r: curveRadius - limbThickness / 2,
  };

  const outerCircle: Circle = {
    x: curveCenterX,
    y: curveCenterY,
    r: curveRadius,
  };

  const innerCircle: Circle = {
    x: curveCenterX,
    y: curveCenterY,
    r: curveRadius - limbThickness,
  };

  const attachments: AttachmentList = {
    // Eyes in the upper part of the dot
    leftEye: {
      x: dotCenterX - dotRadius * 0.3,
      y: dotCenterY - dotRadius * 0.4,
    },
    rightEye: {
      x: dotCenterX + dotRadius * 0.3,
      y: dotCenterY - dotRadius * 0.4,
    },

    // Mouth in the lower part of the dot
    mouth: { x: dotCenterX, y: dotCenterY + dotRadius * 0.3 },

    // Hat sits on top of the letter
    hat: { x: stemCenterX, y: outlineWidth / 2 },

    // Arms
    leftArm: {
      x: stemLeftX,
      y: H * 0.3,
    },
    rightArm: { x: stemRightX, y: H * 0.3 },

    // Legs
    leftLeg: { x: stemLeftX, y: H - outlineWidth / 2 },
    rightLeg: { x: stemRightX, y: H - outlineWidth / 2 },
  };

  return {
    svg: svg,
    attachments: attachments,
  };
}

export default renderJ_uppercase;
