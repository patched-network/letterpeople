import type { Point } from "../types"; // For attachmentCoord
import { BaseController } from "./BaseController";
import type { MouthAttachment } from "./types";
import { animate, AnimationParams, JSAnimation, utils } from "animejs";

const svgNS = "http://www.w3.org/2000/svg";

// Helper function for linear interpolation
function lerp(a: number, b: number, t: number): number {
  return a * (1 - t) + b * t;
}

// Clamp a value between min and max
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(value, max));
}

/**
 * Parameters controlling the dynamic shape of the morphing mouth.
 */
export interface MouthParameters {
  /**
   * Controls the transition from a curve to a circle-like shape.
   * 0: Collapsed to a curve (mood determines smile/frown).
   * 1: Full circle-like shape.
   * Clamped between 0 and 1.
   */
  openness: number; // 0-1

  /**
   * Controls the curvature from frown to smile, most prominent when openness is low.
   * 0: Maximum frown.
   * 0.5: Neutral horizontal curve/ellipse-like shape.
   * 1: Maximum smile.
   * Clamped between 0 and 1.
   */
  mood: number; // 0-1
}

/**
 * Static options for customizing the appearance of the morphing mouth.
 */
export interface MouthAppearanceOptions {
  /** The maximum horizontal width of the mouth. Defaults to 20. */
  width?: number;
  /** Fill color for the mouth shape. Defaults to 'black'. Use 'none' for no fill. */
  fillColor?: string;
  /** Stroke color for the mouth outline. Defaults to 'none'. */
  strokeColor?: string;
  /** Stroke width for the mouth outline. Defaults to 1. Only visible if strokeColor is not 'none'. */
  strokeWidth?: number;
  /** Maximum curvature influence for mood (as ratio of width/2). Defaults to 0.8 (may need tuning for Beziers). */
  maxMoodInfluenceRatio?: number;
  /** Controls the "pointiness" of the Bezier curve. 1.0 is smooth, >1 makes it pointier. Defaults to 1.0. */
  bezierSharpness?: number; // New option for tuning Bezier shape
}

// --- Default values ---
const DEFAULT_MOUTH_WIDTH = 20;
const DEFAULT_FILL_COLOR = "black";
const DEFAULT_STROKE_COLOR = "none";
const DEFAULT_STROKE_WIDTH = 1;
const DEFAULT_MAX_MOOD_RATIO = 0.8; // Adjusted default for Bezier
const DEFAULT_BEZIER_SHARPNESS = 1.0; // Default to smooth quadratic curve

/**
 * Creates SVG elements representing a morphable mouth shape using Bezier curves.
 * The shape transitions between a curve (smile/frown) and a circle-like shape based on parameters.
 *
 * @param x - The desired center X coordinate for the mouth.
 * @param y - The desired center Y coordinate for the mouth baseline.
 * @param params - Dynamic parameters controlling the mouth shape (openness, mood).
 * @param options - Optional static configuration for the mouth's appearance.
 * @returns An SVGGElement containing the mouth path.
 */
export function createMorphingMouth(
  x: number,
  y: number,
  params: MouthParameters,
  options?: MouthAppearanceOptions,
): SVGGElement {
  // Process options with defaults
  const width = options?.width ?? DEFAULT_MOUTH_WIDTH;
  const fillColor = options?.fillColor ?? DEFAULT_FILL_COLOR;
  const strokeColor = options?.strokeColor ?? DEFAULT_STROKE_COLOR;
  const strokeWidth = options?.strokeWidth ?? DEFAULT_STROKE_WIDTH;
  const maxMoodRatio = options?.maxMoodInfluenceRatio ?? DEFAULT_MAX_MOOD_RATIO;
  const sharpness = options?.bezierSharpness ?? DEFAULT_BEZIER_SHARPNESS;

  // Clamp parameters for safety
  const openness = clamp(params.openness, 0, 1);
  const mood = clamp(params.mood, 0, 1);

  // --- Calculate Path Parameters ---
  const rx = Math.max(0.1, width / 2); // Horizontal radius

  // Minimum vertical extent (prevents complete collapse)
  const min_ry = Math.max(
    2,
    strokeColor !== "none" && strokeWidth > 0 ? strokeWidth / 2 : 0.5,
  );

  // Base vertical extent: interpolates from min_ry to rx based on openness
  const baseVerticalExtent = Math.max(min_ry, lerp(min_ry, rx, openness));

  // Mood influence: interpolates from -1 (frown) to +1 (smile)
  const moodFactor = lerp(-1, 1, mood);

  // Vertical offset caused by mood (strongest at openness=0)
  // This offset determines how much the top/bottom control points deviate from the base extent
  const moodVerticalOffset = moodFactor * (rx * maxMoodRatio) * (1 - openness);

  // Calculate the target vertical positions for the control points
  // Positive Y is down, Negative Y is up.
  const bottomControlPointYTarget = y + baseVerticalExtent + moodVerticalOffset;
  const topControlPointYTarget = y - baseVerticalExtent + moodVerticalOffset; // Note: mood offset applied symmetrically here

  // Apply sharpness factor to control points relative to the baseline 'y'
  // This pulls the control points further away (if sharpness > 1) making the curve peak sharper
  const bottomControlPointY = y + (bottomControlPointYTarget - y) * sharpness;
  const topControlPointY = y + (topControlPointYTarget - y) * sharpness;

  // --- Define the Path using Quadratic Bezier Curves (Q) ---
  // Format: Q controlX controlY endX endY
  const startX = x - rx;
  const startY = y; // Start and end on the baseline
  const endX = x + rx;
  const endY = y;

  // Control points are centered horizontally (at x)
  const controlBottomX = x;
  const controlTopX = x;

  const d = [
    `M ${startX.toFixed(3)} ${startY.toFixed(3)}`, // Move to start (left middle)
    // Bottom curve: Control point determines downward curve
    `Q ${controlBottomX.toFixed(3)} ${bottomControlPointY.toFixed(3)} ${endX.toFixed(3)} ${endY.toFixed(3)}`,
    // Top curve: Control point determines upward curve
    `Q ${controlTopX.toFixed(3)} ${topControlPointY.toFixed(3)} ${startX.toFixed(3)} ${startY.toFixed(3)}`,
    `Z`, // Close the path
  ].join(" ");

  // --- Debug Logging ---
  // if (Math.abs(mood - 0.5) < 0.01 || openness < 0.01 || openness > 0.99) {
  //     console.log(`Params: open=${openness.toFixed(2)} mood=${mood.toFixed(2)} | Calc: rx=${rx.toFixed(2)} baseExt=${baseVerticalExtent.toFixed(2)} moodOffset=${moodVerticalOffset.toFixed(2)} | Final CP: TopY=${topControlPointY.toFixed(2)} BotY=${bottomControlPointY.toFixed(2)}`);
  //     console.log("Path d:", d);
  // }
  // --- End Debug ---

  // --- Create SVG Elements ---
  const group = document.createElementNS(svgNS, "g");
  group.setAttribute(
    "class",
    "letter-attachment letter-mouth letter-mouth-bezier",
  );

  const path = document.createElementNS(svgNS, "path");
  path.setAttribute("d", d);
  path.setAttribute("fill", fillColor);

  if (strokeColor !== "none" && strokeWidth > 0) {
    path.setAttribute("stroke", strokeColor);
    path.setAttribute("stroke-width", String(strokeWidth));
    path.setAttribute("stroke-linejoin", "round");
    path.setAttribute("stroke-linecap", "round");
  } else {
    path.removeAttribute("stroke");
    path.removeAttribute("stroke-width");
  }

  group.appendChild(path);
  group.style.transformOrigin = `${x}px ${y}px`;

  return group;
}

class MouthControllerImpl extends BaseController implements MouthAttachment {
  readonly type = "mouth";
  private _currentParams: MouthParameters;
  private _appearanceOptions?: MouthAppearanceOptions;
  private _attachmentCoord: Point;

  constructor(
    svgGroup: SVGGElement,
    initialParams: MouthParameters,
    appearanceOptions: MouthAppearanceOptions | undefined,
    attachmentCoord: Point,
  ) {
    super(svgGroup, "mouth");

    this._currentParams = { ...initialParams };
    this._appearanceOptions = appearanceOptions;
    this._attachmentCoord = attachmentCoord;
  }

  async updateShape(
    params: Partial<MouthParameters>,
    animOptions?: AnimationParams,
  ): Promise<void> {
    this.stopAnimations(); // Now non-optional in this class

    const oldParams = { ...this._currentParams };
    const newParams: MouthParameters = { ...this._currentParams, ...params };

    this._currentParams = { ...newParams };

    if (animOptions && animOptions.duration) {
      const animationDefaults = {
        duration: 300,
        ease: "inOutQuad",
        delay: 0,
        ...animOptions,
      };

      const tweenState = { ...oldParams };

      // Corrected animate call
      this._currentAnimation = animate(tweenState, {
        ...newParams, // Target values for properties in tweenState
        duration: animationDefaults.duration,
        ease: animationDefaults.ease,
        delay: animationDefaults.delay,
        onUpdate: () => {
          const newPathD = createMorphingMouth(
            this._attachmentCoord.x,
            this._attachmentCoord.y,
            tweenState as MouthParameters,
            this._appearanceOptions,
          )
            .querySelector("path")
            ?.getAttribute("d");

          const currentPathEl = this.element.querySelector("path");
          if (currentPathEl && newPathD) {
            currentPathEl.setAttribute("d", newPathD);
          }
        },
        onComplete: () => {
          this._currentAnimation = null;
          const finalPathD = createMorphingMouth(
            this._attachmentCoord.x,
            this._attachmentCoord.y,
            this._currentParams,
            this._appearanceOptions,
          )
            .querySelector("path")
            ?.getAttribute("d");
          const currentPathEl = this.element.querySelector("path");
          if (currentPathEl && finalPathD) {
            currentPathEl.setAttribute("d", finalPathD);
          }
        },
        autoplay: true,
      });
      return this._currentAnimation.then();
    } else {
      const newMouthGroupContent = createMorphingMouth(
        this._attachmentCoord.x,
        this._attachmentCoord.y,
        this._currentParams,
        this._appearanceOptions,
      );
      this.element.innerHTML = newMouthGroupContent.innerHTML;
      this.element.style.transformOrigin =
        newMouthGroupContent.style.transformOrigin;
      return Promise.resolve();
    }
  }

  getCurrentShapeParams(): MouthParameters {
    return { ...this._currentParams };
  }

  toString(): string {
    return `MouthAttachment: visible=${this.isVisible()}, params=${JSON.stringify(this._currentParams)}`;
  }

  async animateSpeak(speakOptions?: AnimationParams): Promise<void> {
    this.stopAnimations(); // Now non-optional in this class
    const originalParams = this.getCurrentShapeParams();
    const openParams = {
      ...originalParams,
      openness: clamp(originalParams.openness + 0.4, 0, 1),
    };
    const duration = speakOptions?.duration ?? 200;
    const openEase = speakOptions?.ease ?? "outQuad";
    const closeEase = speakOptions?.ease ?? "inQuad";

    await this.updateShape(openParams, {
      ...speakOptions,
      ease: openEase,
      duration: duration,
    });
    await this.updateShape(originalParams, {
      ...speakOptions,
      ease: closeEase,
      duration: duration,
      delay: 0,
    });
  }
}

export function createMorphingMouthController(
  svgGroup: SVGGElement,
  initialParams: MouthParameters,
  appearanceOptions: MouthAppearanceOptions | undefined,
  attachmentCoord: Point,
): MouthAttachment {
  return new MouthControllerImpl(
    svgGroup,
    initialParams,
    appearanceOptions,
    attachmentCoord,
  );
}
