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
const VIEWBOX_WIDTH = 130;

// TODO: These should ideally be imported from a shared constants file
const DEFAULT_LIMB_THICKNESS = 8;
const DEFAULT_OUTLINE_WIDTH = 1;

/**
 * Finds the higher intersection point between two circles with the same y-coordinate and radius.
 *
 * @param circle1 - First circle
 * @param circle2 - Second circle
 * @returns The higher of the two intersection points (the one with smaller y-coordinate)
 * @throws Error if the circles don't have the same y-coordinate, same radius, or don't intersect
 */
function getCircleCircleIntersection(circle1: Circle, circle2: Circle): Point {
  console.log(`Finding intersection between two circles:`, {
    circle1,
    circle2,
  });

  // Check that circles have the same y-coordinate
  if (Math.abs(circle1.y - circle2.y) !== 0) {
    console.error(
      `Circles have different y-coordinates: ${circle1.y} and ${circle2.y}`,
    );
    throw new Error(
      "Circles must have the same y-coordinate for their centers",
    );
  }
  console.log(`✓ Circles have same y-coordinate: ${circle1.y}`);

  // Check that circles have the same radius
  if (Math.abs(circle1.r - circle2.r) !== 0) {
    console.error(
      `Circles have different radii: ${circle1.r} and ${circle2.r}`,
    );
    throw new Error("Circles must have the same radius");
  }
  console.log(`✓ Circles have same radius: ${circle1.r}`);

  const d = Math.abs(circle1.x - circle2.x);
  console.log(`Distance between circle centers: ${d}`);

  // Check that circles intersect (d must be less than 2r but greater than 0)
  if (d > 2 * circle1.r) {
    console.error(
      `Circles are too far apart to intersect: distance ${d} > ${2 * circle1.r}`,
    );
    throw new Error("Circles must intersect");
  }
  console.log(
    `✓ Circles are close enough to intersect: distance ${d} <= ${2 * circle1.r}`,
  );

  // The x-coordinate of the intersection points is at the midpoint of the centers along x-axis
  const x = (circle1.x + circle2.x) / 2;
  console.log(`X-coordinate of intersection points: ${x}`);

  // Calculate y offset using the Pythagorean theorem
  const yOffset = Math.sqrt(Math.pow(circle1.r, 2) - Math.pow(d / 2, 2));
  console.log(`Y-offset from circle center: ${yOffset}`);

  // Return the higher intersection point (smaller y-coordinate)
  const result = { x, y: circle1.y - yOffset };
  console.log(`Returning higher intersection point:`, result);
  return result;
}

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

  const leftCircles = lowerCaseCircles(limbThickness);
  const rightCircles = {
    inner: {
      ...leftCircles.inner,
      x: 1.5 * EFFECTIVE_LOWERCASE_HEIGHT - limbThickness,
    },
    outer: {
      ...leftCircles.outer,
      x: 1.5 * EFFECTIVE_LOWERCASE_HEIGHT - limbThickness,
    },
  };

  const upperArcStemIntersection = getVerticalLineCircleIntersections(
    stemRightEdgeX,
    leftCircles.outer,
  ).upperIntersection!;
  const lowerArcStemIntersection = getVerticalLineCircleIntersections(
    stemRightEdgeX,
    leftCircles.inner,
  ).upperIntersection!;

  const arcArcIntersection = getCircleCircleIntersection(
    leftCircles.outer,
    rightCircles.outer,
  );

  const middleLegOutsideX = leftCircles.outer.r * 2;
  const middleLegInsideX = middleLegOutsideX - limbThickness;

  const outsideLegOutsideX = rightCircles.outer.x + rightCircles.outer.r;
  const outsideLegInsideX = outsideLegOutsideX - limbThickness;

  const legsTopY = leftCircles.outer.y;
  const legsBottomY = H;

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
    // arc to intersection of outer circles
    `A ${leftCircles.outer.r} ${leftCircles.outer.r} 0 0 1 ${arcArcIntersection.x} ${arcArcIntersection.y}`,
    // arc to top of outside leg
    `A ${leftCircles.outer.r} ${leftCircles.outer.r} 0 0 1 ${outsideLegOutsideX} ${legsTopY}`,
    // the outer leg
    `L ${outsideLegOutsideX} ${legsBottomY}`, // Line to the lower point of outside leg
    `L ${outsideLegInsideX} ${legsBottomY}`, // Line to the inside lower point of outside leg
    `L ${outsideLegInsideX} ${legsTopY}`, // Line up to the inside point of outside leg
    // arc back to middle leg
    `A ${leftCircles.inner.r} ${leftCircles.inner.r} 0 0 0 ${middleLegOutsideX} ${legsTopY}`,
    // the middle leg
    `L ${middleLegOutsideX} ${legsBottomY}`,
    `L ${middleLegInsideX} ${legsBottomY}`,
    `L ${middleLegInsideX} ${legsTopY}`,
    // arc back to stem
    `A ${leftCircles.inner.r} ${leftCircles.inner.r} 0 0 0 ${stemRightEdgeX} ${legsTopY}`,

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
  // For m, we'll place facial features on the hook arc

  const leftFeatures = placeFaceFeatures(
    leftCircles.inner,
    leftCircles.outer,
    10,
  );

  const rightFeatures = placeFaceFeatures(
    rightCircles.inner,
    rightCircles.outer,
    10,
  );

  const attachments: AttachmentList = {
    // Eyes positioned at either end of the arc
    leftEye: leftFeatures.left,
    rightEye: rightFeatures.right,

    // Mouth positioned at the curve of the arc
    mouth: {
      x: (middleLegInsideX + middleLegOutsideX) / 2,
      y: lowerArcStemIntersection.y + limbThickness / 2,
    },

    // Hat sits on top of the stem
    hat: { x: stemWidth / 2, y: stemTopY - outlineWidth / 2 },

    // Arms
    leftArm: { x: stemRightEdgeX, y: legsTopY }, // On the stem
    rightArm: { x: outsideLegInsideX, y: legsTopY }, // At the end of the arc

    // Legs at the bottom of the stem
    leftLeg: { x: stemWidth / 2, y: H - outlineWidth / 2 },
    rightLeg: { x: outsideLegInsideX + stemWidth / 2, y: H - outlineWidth / 2 },
  };

  return {
    svg: svg,
    attachments: attachments,
  };
}

export default renderR_lowercase;
