// letterpeople/src/letters/u-lowercase.ts
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
 * Renders the base shape and calculates attachment points for the lowercase letter 'u'.
 * This function uses a semicircle on the right and a vertical stem on the left,
 * with both elements within the lowercase height.
 *
 * @param options - Configuration options for the letter's appearance.
 * @returns An object containing the base SVG element and attachment coordinates.
 */
function renderU_lowercase(
  options?: LetterOptions,
): InternalLetterRenderResult {
  // --- SVG Setup ---
  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("viewBox", `0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`);
  svg.setAttribute("class", "letter-base letter-u-lowercase");

  // --- Options Processing ---
  const limbThickness = options?.lineWidth ?? DEFAULT_LIMB_THICKNESS;
  const fillColor = options?.color ?? "currentColor";
  const outlineColor = options?.borderColor ?? "black";
  const outlineWidth = options?.borderWidth ?? DEFAULT_OUTLINE_WIDTH;
  const stemWidth = limbThickness;

  // --- Calculate Dimensions and Positions ---
  const W = VIEWBOX_WIDTH;
  const H = VIEWBOX_HEIGHT;

  // Circle properties (bowl of the 'u')
  const circleOuterRadius = EFFECTIVE_LOWERCASE_HEIGHT / 2;
  const circleCenterY = H - EFFECTIVE_LOWERCASE_HEIGHT / 2; // Positioned towards the bottom
  const circleInnerRadius = circleOuterRadius - limbThickness;

  // Position the circle on the left side of its allocated space
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
  const rightStemRightEdgeX = W;
  const rightStemLeftEdgeX = rightStemRightEdgeX - stemWidth;
  const stemTopY = H - EFFECTIVE_LOWERCASE_HEIGHT; // Start at lowercase height

  // Vertical stem position (left side of the character)
  const leftStemLeftEdgeX = 0;
  const leftStemRightEdgeX = limbThickness;

  const rightStemUpperLeft: Point = {
    x: rightStemLeftEdgeX,
    y: stemTopY,
  };
  const rightStemUpperRight: Point = {
    x: rightStemRightEdgeX,
    y: stemTopY,
  };
  const rightStemBottomLeft: Point = {
    x: rightStemLeftEdgeX,
    y: H,
  };
  const rightStemBottomRight: Point = {
    x: rightStemRightEdgeX,
    y: H,
  };

  // Calculate connection between stem and circle
  // The stem connects to the circle along the line x = rightStemLeftEdgeX
  const connections = getVerticalLineCircleIntersections(
    rightStemLeftEdgeX,
    outerCircle,
  );
  if (
    connections.upperIntersection === null ||
    connections.lowerIntersection === null
  ) {
    throw new Error(
      `u's 'circle' (at x=${outerCircle.x}) is not joined to its stem (at x=${rightStemLeftEdgeX})! Radius: ${outerCircle.r}. Effective height: ${EFFECTIVE_LOWERCASE_HEIGHT}`,
    );
  }

  const upperConnection: Point = connections.upperIntersection!;
  const lowerConnection: Point = connections.lowerIntersection!;

  // --- Path Definition ---
  const path = document.createElementNS(svgNS, "path");
  // Start at the upper connection point, then move clockwise for the outer shape
  const pathData = [
    `M ${rightStemUpperLeft.x} ${circleCenterY}`, // Start at the upper connection point (stem's left, top-ish)
    `L ${rightStemUpperLeft.x} ${rightStemUpperLeft.y}`, // Line to top left of stem
    `L ${rightStemUpperRight.x} ${rightStemUpperRight.y}`, // Line to top right of stem
    `L ${rightStemBottomRight.x} ${rightStemBottomRight.y}`, // Line to bottom right of stem
    `L ${rightStemBottomLeft.x} ${rightStemBottomLeft.y}`, // Line to bottom left of stem
    `L ${lowerConnection.x} ${lowerConnection.y}`, // Line to the lower connection point (stem's left, bottom-ish)
    // Arc from lower connection to upper outside of left stem
    // Using large-arc-flag=0, sweep-flag=1
    `A ${circleOuterRadius} ${circleOuterRadius} 0 0 1 ${0} ${circleCenterY}`,
    `L ${0} ${stemTopY}`, // to top of stem
    `L ${limbThickness} ${stemTopY}`, // across top of stem
    `L ${limbThickness} ${circleCenterY}`, // down to beginning of bend of stem

    `A ${circleInnerRadius} ${circleInnerRadius} 0 0 0 ${rightStemLeftEdgeX} ${circleCenterY}`,

    `Z`, // Close outer path
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
    leftEye: { x: limbThickness / 2, y: stemTopY + 0.8 * limbThickness },
    rightEye: { x: W - limbThickness / 2, y: stemTopY + 0.8 * limbThickness },
    mouth: faceFeatures.mouth,

    // Hat sits on top of the stem
    hat: {
      x: (rightStemLeftEdgeX + rightStemRightEdgeX) / 2,
      y: stemTopY - outlineWidth / 2,
    },

    // Arms
    // Left arm on the far left of the circle
    leftArm: {
      x: outlineWidth / 2,
      y: circleCenterY,
    },
    // Right arm on the stem
    rightArm: {
      x: rightStemRightEdgeX - outlineWidth / 2,
      y: H * 0.7,
    },

    // Legs
    // Left leg at the bottom center of the circle
    leftLeg: {
      x: circleCenterX,
      y: H - outlineWidth / 2,
    },
    // Right leg at the bottom of the stem
    rightLeg: {
      x: (rightStemLeftEdgeX + rightStemRightEdgeX) / 2,
      y: H - outlineWidth / 2,
    },
  };

  return {
    svg: svg,
    attachments: attachments,
  };
}

export default renderU_lowercase;
