// letterpeople/src/letters/a-lowercase.ts
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

// TODO: These should ideally be imported from a shared constants file
const DEFAULT_LIMB_THICKNESS = 8;
const DEFAULT_OUTLINE_WIDTH = 1;

/**
 * @internal
 * Renders the base shape and calculates attachment points for the lowercase letter 'a'.
 * This function uses a circle on the left and a vertical stem on the right,
 * with the stem cut off at the lowercase height constant.
 *
 * @param options - Configuration options for the letter's appearance.
 * @returns An object containing the base SVG element and attachment coordinates.
 */
function renderA_lowercase(
  options?: LetterOptions,
): InternalLetterRenderResult {
  // --- SVG Setup ---
  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("viewBox", `0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`);
  svg.setAttribute("class", "letter-base letter-a-lowercase");

  // --- Options Processing ---
  const limbThickness = options?.lineWidth ?? DEFAULT_LIMB_THICKNESS;
  const fillColor = options?.color ?? "currentColor";
  const outlineColor = options?.borderColor ?? "black";
  const outlineWidth = options?.borderWidth ?? DEFAULT_OUTLINE_WIDTH;
  const stemWidth = limbThickness;

  // --- Calculate Dimensions and Positions ---
  const W = VIEWBOX_WIDTH;
  const H = VIEWBOX_HEIGHT;

  // Circle properties (bowl of the 'a')
  const circleOuterRadius = EFFECTIVE_LOWERCASE_HEIGHT / 2;
  const circleCenterY = H - EFFECTIVE_LOWERCASE_HEIGHT / 2; // Positioned towards the bottom
  const circleInnerRadius = circleOuterRadius - limbThickness;

  // Position the circle on the left side of its allocated space
  // The 'a' character's body will be from 0 to EFFECTIVE_LOWERCASE_HEIGHT
  const circleCenterX = circleOuterRadius;

  const outerCircle: Circle = {
    x: circleCenterX,
    y: circleCenterY,
    r: circleOuterRadius,
  };
  const innerCircle: Circle = {
    x: circleCenterX,
    y: circleCenterY,
    r: circleInnerRadius > 0 ? circleInnerRadius : 0, // Ensure non-negative radius
  };

  // Vertical stem position (right side of the character)
  // Unlike 'd', we cut this off at the lowercase height
  const stemRightEdgeX = W;
  const stemLeftEdgeX = stemRightEdgeX - stemWidth;
  const stemTopY = H - EFFECTIVE_LOWERCASE_HEIGHT; // Cut off at lowercase height

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
    y: H,
  };
  const stemBottomRight: Point = {
    x: stemRightEdgeX,
    y: H,
  };

  // Calculate connection between stem and circle
  // The stem connects to the circle along the line x = stemLeftEdgeX
  const connections = getVerticalLineCircleIntersections(
    stemLeftEdgeX,
    outerCircle,
  );
  if (
    connections.upperIntersection === null ||
    connections.lowerIntersection === null
  ) {
    throw new Error(
      `a's 'circle' (at x=${outerCircle.x}) is not joined to its stem (at x=${stemLeftEdgeX})! Radius: ${outerCircle.r}. Effective height: ${EFFECTIVE_LOWERCASE_HEIGHT}`,
    );
  }

  const upperConnection: Point = connections.upperIntersection!;
  const lowerConnection: Point = connections.lowerIntersection!;

  // --- Path Definition ---
  const path = document.createElementNS(svgNS, "path");
  // Start at the upper connection point, then move clockwise for the outer shape
  const pathData = [
    `M ${upperConnection.x} ${upperConnection.y}`, // Start at the upper connection point (stem's left, top-ish)
    `L ${stemUpperLeft.x} ${stemUpperLeft.y}`, // Line to top left of stem (at lowercase height)
    `L ${stemUpperRight.x} ${stemUpperRight.y}`, // Line to top right of stem (at lowercase height)
    `L ${stemBottomRight.x} ${stemBottomRight.y}`, // Line to bottom right of stem
    `L ${stemBottomLeft.x} ${stemBottomLeft.y}`, // Line to bottom left of stem
    `L ${lowerConnection.x} ${lowerConnection.y}`, // Line to the lower connection point (stem's left, bottom-ish)
    // Arc from lower connection to upper connection, forming the left side of the 'a'
    // Using large-arc-flag=1, sweep-flag=1
    `A ${circleOuterRadius} ${circleOuterRadius} 0 1 1 ${upperConnection.x} ${upperConnection.y}`,
    `Z`, // Close outer path

    // Now draw the counter-clockwise inner circle to create the hole
    // Start at the rightmost point of the inner circle
    `M ${innerCircle.x + innerCircle.r} ${innerCircle.y}`,
    // Arc 1: Draw a 180-degree semi-circle counter-clockwise to the leftmost point.
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
  // Ensure fill-rule is nonzero for the hole to be cut out correctly
  path.setAttribute("fill-rule", "nonzero");

  svg.appendChild(path);

  // --- Attachment Points Calculation ---
  const faceFeatures = placeFaceFeatures(innerCircle, outerCircle);

  const attachments: AttachmentList = {
    // Eyes and mouth positioned using placeFaceFeatures utility
    leftEye: faceFeatures.left,
    rightEye: faceFeatures.right,
    mouth: faceFeatures.mouth,

    // Hat sits on top of the circle since the stem is cut off
    hat: {
      x: outerCircle.x,
      y: circleCenterY - outerCircle.r - outlineWidth / 2,
    },

    // Arms
    // Left arm on the far left of the circle
    leftArm: {
      x: outerCircle.x - outerCircle.r + outlineWidth / 2,
      y: outerCircle.y,
    },
    // Right arm on the stem (far right of 'a's body)
    rightArm: { x: stemRightEdgeX - outlineWidth / 2, y: H * 0.75 }, // Position on the shortened stem

    // Legs
    // Left leg at the bottom center of the circle
    leftLeg: { x: outerCircle.x, y: H - outlineWidth / 2 },
    // Right leg at the bottom of the stem
    rightLeg: {
      x: (stemLeftEdgeX + stemRightEdgeX) / 2,
      y: H - outlineWidth / 2,
    },
  };

  return {
    svg: svg,
    attachments: attachments,
  };
}

export default renderA_lowercase;
