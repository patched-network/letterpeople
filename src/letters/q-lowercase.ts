// letterpeople/src/letters/q-lowercase.ts
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
 * Renders the base shape and calculates attachment points for the lowercase letter 'q'.
 * This function uses a circle on the left and a vertical stem on the right that extends
 * below the baseline.
 *
 * @param options - Configuration options for the letter's appearance.
 * @returns An object containing the base SVG element and attachment coordinates.
 */
function renderQ_lowercase(
  options?: LetterOptions,
): InternalLetterRenderResult {
  // --- SVG Setup ---
  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("viewBox", `0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`);
  svg.setAttribute("class", "letter-base letter-q-lowercase");

  // --- Options Processing ---
  const limbThickness = options?.lineWidth ?? DEFAULT_LIMB_THICKNESS;
  const fillColor = options?.color ?? "currentColor";
  const outlineColor = options?.borderColor ?? "black";
  const outlineWidth = options?.borderWidth ?? DEFAULT_OUTLINE_WIDTH;
  const stemWidth = limbThickness;

  // --- Calculate Dimensions and Positions ---
  const W = VIEWBOX_WIDTH;
  const H = VIEWBOX_HEIGHT;

  // Circle properties (bowl of the 'q')
  const circleOuterRadius = EFFECTIVE_LOWERCASE_HEIGHT / 2;
  const circleCenterY = EFFECTIVE_LOWERCASE_HEIGHT / 2; // Positioned at the top
  const circleInnerRadius = circleOuterRadius - limbThickness;

  // Position the circle on the left side
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
  const stemRightEdgeX = W;
  const stemLeftEdgeX = stemRightEdgeX - stemWidth;

  // The stem extends from the top to the bottom of the viewbox (including descender)
  const stemUpperLeft: Point = {
    x: stemLeftEdgeX,
    y: 0,
  };
  const stemUpperRight: Point = {
    x: stemRightEdgeX,
    y: 0,
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
      `q's 'circle' (at x=${outerCircle.x}) is not joined to its stem (at x=${stemLeftEdgeX})! Radius: ${outerCircle.r}. Effective height: ${EFFECTIVE_LOWERCASE_HEIGHT}`,
    );
  }

  const upperConnection: Point = connections.upperIntersection!;
  const lowerConnection: Point = connections.lowerIntersection!;

  // --- Path Definition ---
  const path = document.createElementNS(svgNS, "path");
  // Start at the upper connection point, then move clockwise for the outer shape
  const pathData = [
    `M ${upperConnection.x} ${upperConnection.y}`, // Start at the upper connection point
    `L ${stemUpperLeft.x} ${stemUpperLeft.y}`, // Line to top left of stem
    `L ${stemUpperRight.x} ${stemUpperRight.y}`, // Line to top right of stem
    `L ${stemBottomRight.x} ${stemBottomRight.y}`, // Line to bottom right of stem
    `L ${stemBottomLeft.x} ${stemBottomLeft.y}`, // Line to bottom left of stem
    `L ${lowerConnection.x} ${lowerConnection.y}`, // Line to the lower connection point
    // Arc from lower connection to upper connection, forming the left side of the 'q'
    `A ${circleOuterRadius} ${circleOuterRadius} 0 1 1 ${upperConnection.x} ${upperConnection.y}`,
    `Z`, // Close outer path

    // Now draw the counter-clockwise inner circle to create the hole
    // Start at a point where the inner circle would meet the stem (to avoid overlap)
    `M ${innerCircle.x} ${innerCircle.y - innerCircle.r}`,
    // Arc 1: Draw counter-clockwise from top to bottom on the left side
    `A ${innerCircle.r} ${innerCircle.r} 0 0 0 ${innerCircle.x} ${innerCircle.y + innerCircle.r}`,
    // Arc 2: Draw counter-clockwise from bottom to top on the left side
    `A ${innerCircle.r} ${innerCircle.r} 0 0 0 ${innerCircle.x} ${innerCircle.y - innerCircle.r}`,
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

    // Hat sits on top of the circle
    hat: {
      x: outerCircle.x,
      y: circleCenterY - outerCircle.r - outlineWidth / 2,
    },

    // Arms
    // Left arm on the far left of the 'q's circle
    leftArm: { x: outlineWidth / 2, y: outerCircle.y },
    // Right arm on the stem (far right of 'q's body)
    rightArm: { x: stemRightEdgeX - outlineWidth / 2, y: BASELINE_Y * 0.4 },

    // Legs at the baseline (not at the bottom of the descender)
    leftLeg: { x: outerCircle.x, y: BASELINE_Y - outlineWidth / 2 },
    rightLeg: {
      x: (stemLeftEdgeX + stemRightEdgeX) / 2,
      y: BASELINE_Y - outlineWidth / 2,
    },
  };

  return {
    svg: svg,
    attachments: attachments,
  };
}

export default renderQ_lowercase;
