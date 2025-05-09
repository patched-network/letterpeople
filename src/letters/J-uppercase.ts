// letterpeople/src/letters/J-uppercase.ts
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
  svg.setAttribute("viewBox", `0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`);
  svg.setAttribute("class", "letter-base letter-J-uppercase");

  // --- Options Processing ---
  const limbThickness = options?.lineWidth ?? DEFAULT_LIMB_THICKNESS;
  const fillColor = options?.color ?? "currentColor";
  const outlineColor = options?.borderColor ?? "black";
  const outlineWidth = options?.borderWidth ?? DEFAULT_OUTLINE_WIDTH;

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

  // Horizontal bar coordinates
  const barLeftX = stemCenterX - topBarWidth / 2;
  const barRightX = stemCenterX + topBarWidth / 2;
  const barTopY = 0;
  const barBottomY = limbThickness;

  // Bottom curve dimensions
  const curveRadius = W * 0.25;
  const curveCenterX = curveRadius + limbThickness / 2;
  const curveCenterY = H - curveRadius;

  // Where the stem meets the curve
  const stemBottomY = H - curveRadius;

  // --- Path Definition ---
  const path = document.createElementNS(svgNS, "path");
  const pathData = [
    // Start at top-left of horizontal bar
    `M ${barLeftX} ${barTopY}`,

    // Draw across top of bar
    `L ${barRightX} ${barTopY}`,

    // Draw down right side of bar
    `L ${barRightX} ${barBottomY}`,

    // Draw back to where stem starts
    `L ${stemRightX} ${barBottomY}`,

    // Draw down right side of stem
    `L ${stemRightX} ${stemBottomY}`,

    // Draw curve from bottom right to bottom left
    `A ${curveRadius} ${curveRadius} 0 0 1 ${curveCenterX - 2 * curveRadius} ${curveCenterY}`,

    // Draw leftmost point of curve
    `L ${curveCenterX - curveRadius} ${curveCenterY}`,

    // Draw outer curve back to stem
    `A ${curveRadius - limbThickness} ${curveRadius - limbThickness} 0 0 0 ${stemLeftX} ${stemBottomY}`,

    // Draw up left side of stem
    `L ${stemLeftX} ${barBottomY}`,

    // Draw left to complete the bottom of the bar
    `L ${barLeftX} ${barBottomY}`,

    // Close path
    `Z`,
  ].join(" ");

  path.setAttribute("d", pathData);
  path.setAttribute("fill", fillColor);
  path.setAttribute("stroke", outlineColor);
  path.setAttribute("stroke-width", String(outlineWidth));
  path.setAttribute("stroke-linejoin", "round");

  svg.appendChild(path);

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
    // Eyes at the top of the J
    leftEye: { x: stemCenterX - stemWidth / 2, y: barBottomY / 2 },
    rightEye: { x: stemCenterX + stemWidth / 2, y: barBottomY / 2 },

    // Mouth in the bottom curve
    mouth: { x: stemCenterX, y: curveCenterY },

    // Hat sits on top of the letter
    hat: { x: stemCenterX, y: outlineWidth / 2 },

    // Arms
    leftArm: {
      x: curveCenterX - curveRadius + limbThickness,
      y: H * 0.5,
    },
    rightArm: { x: stemRightX, y: H * 0.5 },

    // Legs
    leftLeg: { x: curveCenterX - curveRadius / 2, y: H - outlineWidth / 2 },
    rightLeg: { x: curveCenterX + curveRadius / 2, y: H - outlineWidth / 2 },
  };

  return {
    svg: svg,
    attachments: attachments,
  };
}

export default renderJ_uppercase;
