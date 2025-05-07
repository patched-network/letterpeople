// letterpeople/src/util/geometry.ts

// --- Constants ---
const EPSILON = 1e-9; // A small epsilon for floating point comparisons

// --- Type Definitions ---

/** That which has no parts. */
export interface Point {
  x: number;
  y: number;
}

/** Represents a line defined by two points, often treated as an infinite line for intersections. */
export interface Line {
  p1: Point;
  p2: Point;
}

/** Represents a finite line segment. */
export interface LineSegment {
  p1: Point;
  p2: Point;
}

// --- Point Operations ---

/**
 * Adds two points (vectors).
 * @param p1 - The first point.
 * @param p2 - The second point.
 * @returns A new point representing the sum.
 */
export function addPoints(p1: Point, p2: Point): Point {
  return { x: p1.x + p2.x, y: p1.y + p2.y };
}

/**
 * Subtracts the second point (vector) from the first. (p1 - p2)
 * @param p1 - The first point.
 * @param p2 - The point to subtract.
 * @returns A new point representing the difference.
 */
export function subtractPoints(p1: Point, p2: Point): Point {
  return { x: p1.x - p2.x, y: p1.y - p2.y };
}

/**
 * Scales a point (vector) by a scalar value.
 * @param p - The point to scale.
 * @param s - The scalar value.
 * @returns A new, scaled point.
 */
export function scalePoint(p: Point, s: number): Point {
  return { x: p.x * s, y: p.y * s };
}

/**
 * Calculates the magnitude (length) of a vector from the origin to the point.
 * @param p - The point representing the vector.
 * @returns The magnitude of the vector.
 */
export function magnitude(p: Point): number {
  return Math.sqrt(p.x * p.x + p.y * p.y);
}

/**
 * Calculates the squared magnitude of a vector. Useful for comparisons to avoid sqrt.
 * @param p - The point representing the vector.
 * @returns The squared magnitude.
 */
export function magnitudeSq(p: Point): number {
  return p.x * p.x + p.y * p.y;
}

/**
 * Calculates the distance between two points.
 * @param p1 - The first point.
 * @param p2 - The second point.
 * @returns The distance between p1 and p2.
 */
export function distance(p1: Point, p2: Point): number {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculates the squared distance between two points.
 * @param p1 - The first point.
 * @param p2 - The second point.
 * @returns The squared distance.
 */
export function distanceSq(p1: Point, p2: Point): number {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return dx * dx + dy * dy;
}

/**
 * Normalizes a vector (makes its magnitude 1).
 * @param p - The point representing the vector.
 * @returns A new, normalized point (vector), or {0,0} if magnitude is 0.
 */
export function normalize(p: Point): Point {
  const mag = magnitude(p);
  if (mag < EPSILON) {
    return { x: 0, y: 0 };
  }
  return { x: p.x / mag, y: p.y / mag };
}

/**
 * Calculates the dot product of two vectors.
 * @param p1 - The first vector.
 * @param p2 - The second vector.
 * @returns The dot product.
 */
export function dotProduct(p1: Point, p2: Point): number {
  return p1.x * p2.x + p1.y * p2.y;
}

/**
 * Calculates the 2D cross product (magnitude of the 3D cross product).
 * (p1.x * p2.y) - (p1.y * p2.x)
 * Useful for determining orientation (e.g., if p2 is to the left or right of p1 relative to origin).
 * @param p1 - The first vector.
 * @param p2 - The second vector.
 * @returns The 2D cross product value.
 */
export function crossProduct2D(p1: Point, p2: Point): number {
  return p1.x * p2.y - p1.y * p2.x;
}

/**
 * Linearly interpolates between two points.
 * @param p1 - The starting point (t=0).
 * @param p2 - The ending point (t=1).
 * @param t - The interpolation parameter (usually between 0 and 1).
 * @returns The interpolated point.
 */
export function lerpPoints(p1: Point, p2: Point, t: number): Point {
  return {
    x: p1.x + (p2.x - p1.x) * t,
    y: p1.y + (p2.y - p1.y) * t,
  };
}

/**
 * Calculates the weighted average of two points.
 * result = p1 * weightP1 + p2 * (1 - weightP1)
 * @param p1 - The first point.
 * @param p2 - The second point.
 * @param weightP1 - The weight for the first point (typically between 0 and 1).
 * @returns The weighted average point.
 */
export function weightedAverage(p1: Point, p2: Point, weightP1: number): Point {
  return {
    x: p1.x * weightP1 + p2.x * (1 - weightP1),
    y: p1.y * weightP1 + p2.y * (1 - weightP1),
  };
}

/**
 * Calculates the midpoint between two points.
 * @param p1 - The first point.
 * @param p2 - The second point.
 * @returns The midpoint.
 */
export function midpoint(p1: Point, p2: Point): Point {
  return {
    x: (p1.x + p2.x) / 2,
    y: (p1.y + p2.y) / 2,
  };
}

/**
 * Rotates a point around an origin.
 * @param p - The point to rotate.
 * @param angleRad - The angle of rotation in radians.
 * @param origin - The point to rotate around (defaults to {0,0}).
 * @returns The new, rotated point.
 */
export function rotatePoint(
  p: Point,
  angleRad: number,
  origin: Point = { x: 0, y: 0 },
): Point {
  const s = Math.sin(angleRad);
  const c = Math.cos(angleRad);

  // Translate point back to origin:
  const translatedX = p.x - origin.x;
  const translatedY = p.y - origin.y;

  // Rotate point
  const rotatedX = translatedX * c - translatedY * s;
  const rotatedY = translatedX * s + translatedY * c;

  // Translate point back:
  return {
    x: rotatedX + origin.x,
    y: rotatedY + origin.y,
  };
}

// --- Line Operations ---

/**
 * Calculates the intersection point of two infinite lines.
 * Each line is defined by two points (p1, p2).
 * @param line1 - The first line.
 * @param line2 - The second line.
 * @returns The intersection point, or null if lines are parallel or coincident.
 */
export function getLineIntersection(line1: Line, line2: Line): Point | null {
  const { p1: l1p1, p2: l1p2 } = line1;
  const { p1: l2p1, p2: l2p2 } = line2;

  const d =
    (l1p1.x - l1p2.x) * (l2p1.y - l2p2.y) -
    (l1p1.y - l1p2.y) * (l2p1.x - l2p2.x);

  if (Math.abs(d) < EPSILON) {
    // Lines are parallel or coincident
    return null;
  }

  const t =
    ((l1p1.x - l2p1.x) * (l2p1.y - l2p2.y) -
      (l1p1.y - l2p1.y) * (l2p1.x - l2p2.x)) /
    d;
  // const u = // Parameter for line2, can be calculated if needed
  //   -((l1p1.x - l1p2.x) * (l1p1.y - l2p1.y) -
  //     (l1p1.y - l1p2.y) * (l1p1.x - l2p1.x)) /
  //   d;

  return {
    x: l1p1.x + t * (l1p2.x - l1p1.x),
    y: l1p1.y + t * (l1p2.y - l1p1.y),
  };
}

/**
 * Creates a line segment parallel to a given segment (defined by p1 and p2),
 * offset by a specified distance to the left or right.
 * The returned segment has the same length as the original.
 * @param p1 - The starting point of the original segment.
 * @param p2 - The ending point of the original segment.
 * @param distance - The perpendicular distance to offset.
 * @param side - "left" or "right" side relative to the direction p1 -> p2.
 * @returns A new Line (segment) parallel to the original.
 */
export function getParallelLineSegment(
  p1: Point,
  p2: Point,
  offsetDistance: number,
  side: "left" | "right",
): Line {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const L = Math.sqrt(dx * dx + dy * dy);

  if (L < EPSILON) {
    // p1 and p2 are essentially the same point
    // Behavior for zero-length segment: offset perpendicular to an arbitrary axis (e.g., y-axis)
    // Or simply return the original points if offsetDistance is also zero.
    // For simplicity, let's offset along x-axis if side is 'right', y-axis if 'left' (arbitrary choice)
    if (side === "right") {
      return {
        p1: { x: p1.x + offsetDistance, y: p1.y },
        p2: { x: p2.x + offsetDistance, y: p2.y },
      };
    } else {
      // left
      return {
        p1: { x: p1.x, y: p1.y + offsetDistance },
        p2: { x: p2.x, y: p2.y + offsetDistance },
      };
    }
  }

  let nx = -dy / L; // Normal vector component (points "left" of p1->p2 vector)
  let ny = dx / L;

  if (side === "right") {
    nx = -nx; // Flip normal to point "right"
    ny = -ny;
  }

  return {
    p1: { x: p1.x + offsetDistance * nx, y: p1.y + offsetDistance * ny },
    p2: { x: p2.x + offsetDistance * nx, y: p2.y + offsetDistance * ny },
  };
}

/**
 * Calculates the length of a line segment.
 * @param segment - The line segment.
 * @returns The length of the segment.
 */
export function segmentLength(segment: LineSegment): number {
  return distance(segment.p1, segment.p2);
}

/**
 * Finds a point on a line segment at a fractional distance t from p1.
 * @param segment - The line segment.
 * @param t - The fraction along the segment (0 for p1, 1 for p2).
 * @returns The point at the fractional distance.
 */
export function pointOnSegment(segment: LineSegment, t: number): Point {
  return lerpPoints(segment.p1, segment.p2, t);
}

/**
 * Projects a point onto an infinite line defined by lineStart and lineEnd.
 * @param p - The point to project.
 * @param lineStart - The start point of the line.
 * @param lineEnd - The end point of the line.
 * @returns The projected point on the infinite line.
 */
export function projectPointOntoLine(
  p: Point,
  lineStart: Point,
  lineEnd: Point,
): Point {
  const l2 = distanceSq(lineStart, lineEnd);
  if (l2 < EPSILON) return { ...lineStart }; // lineStart and lineEnd are the same
  const t =
    dotProduct(
      subtractPoints(p, lineStart),
      subtractPoints(lineEnd, lineStart),
    ) / l2;
  return lerpPoints(lineStart, lineEnd, t);
}

/**
 * Projects a point onto a line segment. If projection falls outside segment, clamps to nearest endpoint.
 * @param p - The point to project.
 * @param segment - The line segment.
 * @returns The projected point on the segment.
 */
export function projectPointOntoSegment(p: Point, segment: LineSegment): Point {
  const { p1, p2 } = segment;
  const l2 = distanceSq(p1, p2);
  if (l2 < EPSILON) return { ...p1 }; // Segment is a point

  let t = dotProduct(subtractPoints(p, p1), subtractPoints(p2, p1)) / l2;
  t = Math.max(0, Math.min(1, t)); // Clamp t to [0, 1]
  return lerpPoints(p1, p2, t);
}

// --- Angle Operations ---

/**
 * Converts degrees to radians.
 * @param degrees - Angle in degrees.
 * @returns Angle in radians.
 */
export function degToRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Converts radians to degrees.
 * @param radians - Angle in radians.
 * @returns Angle in degrees.
 */
export function radToDeg(radians: number): number {
  return radians * (180 / Math.PI);
}

/**
 * Calculates the angle of a line segment relative to the positive X-axis.
 * @param segment - The line segment.
 * @returns Angle in radians.
 */
export function segmentAngle(segment: LineSegment): number {
  return Math.atan2(segment.p2.y - segment.p1.y, segment.p2.x - segment.p1.x);
}

// --- Curve Operations ---

/**
 * Calculates a point on a quadratic Bezier curve.
 * B(t) = (1-t)^2 * p0 + 2 * (1-t) * t * p1 + t^2 * p2
 * @param p0 - Start point.
 * @param p1 - Control point.
 * @param p2 - End point.
 * @param t - Parameter, 0 <= t <= 1.
 * @returns Point on the curve at t.
 */
export function quadraticBezierPoint(
  p0: Point,
  p1: Point,
  p2: Point,
  t: number,
): Point {
  const mt = 1 - t;
  const mt2 = mt * mt;
  const t2 = t * t;

  return {
    x: mt2 * p0.x + 2 * mt * t * p1.x + t2 * p2.x,
    y: mt2 * p0.y + 2 * mt * t * p1.y + t2 * p2.y,
  };
}

/**
 * Calculates a point on a cubic Bezier curve.
 * B(t) = (1-t)^3 * p0 + 3 * (1-t)^2 * t * p1 + 3 * (1-t) * t^2 * p2 + t^3 * p3
 * @param p0 - Start point.
 * @param p1 - First control point.
 * @param p2 - Second control point.
 * @param p3 - End point.
 * @param t - Parameter, 0 <= t <= 1.
 * @returns Point on the curve at t.
 */
export function cubicBezierPoint(
  p0: Point,
  p1: Point,
  p2: Point,
  p3: Point,
  t: number,
): Point {
  const mt = 1 - t;
  const mt2 = mt * mt;
  const mt3 = mt2 * mt;
  const t2 = t * t;
  const t3 = t2 * t;

  return {
    x: mt3 * p0.x + 3 * mt2 * t * p1.x + 3 * mt * t2 * p2.x + t3 * p3.x,
    y: mt3 * p0.y + 3 * mt2 * t * p1.y + 3 * mt * t2 * p2.y + t3 * p3.y,
  };
}

/**
 * Calculates a point on an elliptical arc.
 * This is for a standard ellipse centered at (cx, cy) with radii rx, ry.
 * The angle is measured from the positive x-axis of the ellipse.
 * @param cx - Center x of the ellipse.
 * @param cy - Center y of the ellipse.
 * @param rx - Radius along the x-axis.
 * @param ry - Radius along the y-axis.
 * @param angleRad - Angle in radians to the point on the ellipse.
 * @param xAxisRotationRad - Rotation of the ellipse's x-axis (default 0).
 * @returns Point on the elliptical arc.
 */
export function ellipticalArcPoint(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  angleRad: number,
  xAxisRotationRad: number = 0,
): Point {
  const cosAngle = Math.cos(angleRad);
  const sinAngle = Math.sin(angleRad);

  // Point on unrotated ellipse
  let x = rx * cosAngle;
  let y = ry * sinAngle;

  // Rotate if xAxisRotationRad is non-zero
  if (Math.abs(xAxisRotationRad) > EPSILON) {
    const cosRot = Math.cos(xAxisRotationRad);
    const sinRot = Math.sin(xAxisRotationRad);
    const newX = x * cosRot - y * sinRot;
    const newY = x * sinRot + y * cosRot;
    x = newX;
    y = newY;
  }

  // Translate to center
  return {
    x: cx + x,
    y: cy + y,
  };
}

// --- Utility ---

/**
 * Clamps a number between a minimum and maximum value.
 * @param value The number to clamp.
 * @param min The minimum value.
 * @param max The maximum value.
 * @returns The clamped number.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
