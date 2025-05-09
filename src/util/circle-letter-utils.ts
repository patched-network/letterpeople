import { pointAtAngle, midpoint, Circle } from "./geometry";

export function placeFaceFeatures(
  inner: Circle,
  outer: Circle,
  separation: number = 45,
  mouthOffset?: number = 0,
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
