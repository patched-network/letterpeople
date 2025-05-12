import { EFFECTIVE_LOWERCASE_HEIGHT, VIEWBOX_HEIGHT } from "../letters/CONSTS";
import { pointAtAngle, midpoint, Circle, Point } from "./geometry";

export function placeFaceFeatures(
  inner: Circle,
  outer: Circle,
  separation: number = 45,
  mouthOffset: number = 0,
): {
  left: Point;
  right: Point;
  mouth: Point;
} {
  return {
    left: midpoint(
      pointAtAngle(270 - separation / 2, inner),
      pointAtAngle(270 - separation / 2, outer),
    ),
    right: midpoint(
      pointAtAngle(270 + separation / 2, inner),
      pointAtAngle(270 + separation / 2, outer),
    ),
    mouth: midpoint(pointAtAngle(90, inner), pointAtAngle(90, outer)),
  };
}

/**
 *
 * @returns The outer circle used to define rounded shapes in lowercase letters such as o, n, r, or b.
 */
function lowerCaseGreatCircle(): Circle {
  return {
    x: EFFECTIVE_LOWERCASE_HEIGHT / 2,
    y: VIEWBOX_HEIGHT - EFFECTIVE_LOWERCASE_HEIGHT / 2,
    r: EFFECTIVE_LOWERCASE_HEIGHT / 2,
  };
}

/**
 *
 * @param limbThickness
 * @returns The outer and inner circles used to define rounded shapes in lowercase letters such as o, n, r, or b.
 */
export function lowerCaseCircles(limbThickness: number): {
  inner: Circle;
  outer: Circle;
} {
  const outer = lowerCaseGreatCircle();
  return {
    outer,
    inner: {
      x: outer.x,
      y: outer.y,
      r: outer.r - limbThickness,
    },
  };
}
