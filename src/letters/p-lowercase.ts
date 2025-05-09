// letterpeople/src/letters/p-lowercase.ts
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
import { EFFECTIVE_LOWERCASE_HEIGHT } from "./CONSTS";

// Define constants for our coordinate space
const VIEWBOX_WIDTH = 70;
const VIEWBOX_HEIGHT = 100;
const BASELINE_Y = 100; // Standard baseline height

// TODO: These should ideally be imported from a shared constants file
const DEFAULT_LIMB_THICKNESS = 8;
const DEFAULT_OUTLINE_WIDTH = 1;

/**
 * @internal
 * Renders the base shape and calculates attachment points for the lowercase letter 'p'.
 * This function uses a vertical stem on the left and a circle on the right,
 * with the circle positioned at the top of the viewing area.
 *
 * @param options - Configuration options for the letter's appearance.
 * @returns An object containing the base SVG element and attachment coordinates.
 */
function renderP_lowercase(
  options?: LetterOptions,
): InternalLetterRenderResult {
  // --- SVG Setup ---
  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("viewBox", `0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`);
  svg.setAttribute("class", "letter-base letter-p-lowercase");

  // --- Options Processing ---
  const limbThickness = options?.lineWidth ?? DEFAULT_LIMB_THICKNESS;
  const fillColor = options?.color ?? "currentColor";
  const outlineColor = options?.borderColor ?? "black";
  const outlineWidth = options?.borderWidth ?? DEFAULT_OUTLINE_WIDTH;
  const stemWidth = limbThickness;

  // --- Calculate Dimensions and Positions ---
  const W = VIEWBOX_WIDTH;
  const H = VIEWBOX_HEIGHT;

  // Position the circle center at the top part of the viewbox
  const circleOuterRadius = EFFECTIVE_LOWERCASE_HEIGHT / 2;
  const circleCenterY = EFFECTIVE_LOWERCASE_HEIGHT / 2; // Positioned at the top
  const circleInnerRadius = circleOuterRadius - limbThickness; // make the stroke of the circle limbThickness wide

  // Create the vertical stem position (left side)
  const stemX = 0;

  const stemUpperLeft: Point = {
    x: 0,
    y: 0,
  };
  const stemUpperRight: Point = {
    x: stemWidth,
    y: 0,
  };
  const stemBottomLeft: Point = {
    x: 0,
    y: H,
  };
  const stemBottomRight: Point = {
    x: stemWidth,
    y: H,
  };

  const outerCircle: Circle = {
    x: circleOuterRadius,
    y: circleCenterY,
    r: circleOuterRadius,
  };
  const innerCircle: Circle = {
    x: circleOuterRadius,
    y: circleCenterY,
    r: circleOuterRadius - limbThickness,
  };

  // Calculate connection between stem and circle
  const connections = getVerticalLineCircleIntersections(
    stemWidth,
    outerCircle,
  );
  if (
    connections.upperIntersection === null ||
    connections.lowerIntersection === null
  ) {
    throw new Error("p's `circle` is not joined to its stem!");
  }

  const upper: Point = connections.upperIntersection!;
  const lower: Point = connections.lowerIntersection!;

  // --- Path Definition ---
  const path = document.createElementNS(svgNS, "path");
  // Start at the lower connection point, then move clockwise
  const pathData = [
    // draw the outline of the letter
    `M ${lower.x} ${lower.y}`, // Start at the lower connection point
    `L ${stemBottomRight.x} ${stemBottomRight.y}`, // Line to bottom right of stem
    `L ${stemBottomLeft.x} ${stemBottomLeft.y}`, // Line to bottom left of stem
    `L ${stemUpperLeft.x} ${stemUpperLeft.y}`, // Line to upper left of stem
    `L ${stemUpperRight.x} ${stemUpperRight.y}`, // Line to upper right of stem
    `L ${upper.x} ${upper.y}`, // Line to the upper connection point
    // Arc from upper connection to lower connection
    // Using large-arc-flag=1 makes it draw the long arc path
    `A ${circleOuterRadius} ${circleOuterRadius} 0 1 1 ${lower.x} ${lower.y}`,
    `Z`, // Close path

    // Now draw the counter-clockwise inner circle to create the hole
    // Move to the rightmost point of the inner circle
    `M ${innerCircle.x + innerCircle.r} ${innerCircle.y}`,
    // Arc 1: Draw a 180-degree semi-circle counter-clockwise to the leftmost point.
    // rx, ry, x-axis-rotation, large-arc-flag (0 for semi-circle), sweep-flag (0 for CCW), x, y
    `A ${innerCircle.r} ${innerCircle.r} 0 0 0 ${innerCircle.x - innerCircle.r} ${innerCircle.y}`,
    // Arc 2: Draw the second 180-degree semi-circle counter-clockwise back to the starting (rightmost) point.
    `A ${innerCircle.r} ${innerCircle.r} 0 0 0 ${innerCircle.x + innerCircle.r} ${innerCircle.y}`,
    `Z`, // Close inner path
  ].join(" ");

  path.setAttribute("d", pathData);
  path.setAttribute("fill", fillColor);
  path.setAttribute("stroke", outlineColor);
  path.setAttribute("stroke-width", String(outlineWidth));
  path.setAttribute("stroke-linejoin", "round");
  path.setAttribute("fill-rule", "nonzero");

  svg.appendChild(path);

  // --- Attachment Points Calculation ---
  const faceFeatures = placeFaceFeatures(innerCircle, outerCircle);

  const attachments: AttachmentList = {
    // Eyes and mouth positioned using placeFaceFeatures utility
    leftEye: faceFeatures.left,
    rightEye: faceFeatures.right,
    mouth: faceFeatures.mouth,

    // Hat sits on top of the stem
    hat: { x: stemWidth / 2, y: outlineWidth / 2 },

    // Arms on the sides
    leftArm: { x: outlineWidth / 2, y: BASELINE_Y * 0.4 }, // On the stem
    rightArm: { x: W - outlineWidth / 2, y: outerCircle.y }, // On the far right of the circle

    // Legs at the bottom of the baseline (not at the bottom of the descender)
    leftLeg: { x: stemWidth / 2, y: BASELINE_Y - outlineWidth / 2 }, // At baseline
    rightLeg: { x: outerCircle.x, y: BASELINE_Y - outlineWidth / 2 }, // At baseline
  };

  return {
    svg: svg,
    attachments: attachments,
  };
}

export default renderP_lowercase;
