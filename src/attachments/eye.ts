// src/attachments/eye.ts

import { animate, AnimationParams, JSAnimation } from "animejs";
import type { EyeAttachment, EyesAttachment } from "./types";
import { BaseController } from "./BaseController";

const svgNS = "http://www.w3.org/2000/svg";

/**
 * Options for customizing the appearance of an eye attachment.
 */
export interface EyeOptions {
  /** Overall diameter of the eye's white part (sclera). Defaults to 10. */
  size?: number;
  /** Fill color of the sclera. Defaults to 'white'. */
  fillColor?: string;
  /** Fill color of the pupil. Defaults to 'black'. */
  pupilColor?: string;
  /** Ratio of pupil diameter to eye diameter (e.g., 0.4 means pupil is 40% of eye size). Defaults to 0.4. */
  pupilSizeRatio?: number;
  /** Optional outline color for the sclera. Defaults to 'grey'. Set to 'none' for no outline. */
  strokeColor?: string;
  /** Optional outline width for the sclera. Defaults to 0.5. */
  strokeWidth?: number;
  // Future: pupilPosition?: Point; // For controlling where the pupil looks
}

// --- Default values ---
const DEFAULT_EYE_SIZE = 10;
const DEFAULT_FILL_COLOR = "white";
const DEFAULT_PUPIL_COLOR = "black";
const DEFAULT_PUPIL_RATIO = 0.4;
const DEFAULT_STROKE_COLOR = "grey";
const DEFAULT_STROKE_WIDTH = 0.5;

/**
 * Creates SVG elements representing a simple eye.
 *
 * @param x - The desired center X coordinate for the eye.
 * @param y - The desired center Y coordinate for the eye.
 * @param options - Optional configuration for the eye's appearance.
 * @returns An SVGGElement containing the eye's parts (sclera and pupil).
 */
export function createEye(
  x: number,
  y: number,
  options?: EyeOptions,
): SVGGElement {
  // Process options with defaults
  const size = options?.size ?? DEFAULT_EYE_SIZE;
  const fillColor = options?.fillColor ?? DEFAULT_FILL_COLOR;
  const pupilColor = options?.pupilColor ?? DEFAULT_PUPIL_COLOR;
  const pupilRatio = options?.pupilSizeRatio ?? DEFAULT_PUPIL_RATIO;
  const strokeColor = options?.strokeColor ?? DEFAULT_STROKE_COLOR;
  const strokeWidth = options?.strokeWidth ?? DEFAULT_STROKE_WIDTH;

  // Calculate dimensions
  const radius = size / 2;
  const pupilRadius = radius * pupilRatio;

  // Create a group element to hold the eye parts
  const group = document.createElementNS(svgNS, "g");
  group.setAttribute("class", "letter-attachment letter-eye"); // Add classes for potential styling

  // Create the sclera (white part)
  const sclera = document.createElementNS(svgNS, "circle");
  sclera.setAttribute("cx", String(x));
  sclera.setAttribute("cy", String(y));
  sclera.setAttribute("r", String(radius));
  sclera.setAttribute("fill", fillColor);
  if (strokeColor !== "none" && strokeWidth > 0) {
    sclera.setAttribute("stroke", strokeColor);
    sclera.setAttribute("stroke-width", String(strokeWidth));
  }

  // Create the pupil
  const pupil = document.createElementNS(svgNS, "circle");
  // Center the pupil within the sclera
  pupil.setAttribute("cx", String(x));
  pupil.setAttribute("cy", String(y));
  pupil.setAttribute("r", String(pupilRadius));
  pupil.setAttribute("fill", pupilColor);

  // Add parts to the group
  group.appendChild(sclera);
  group.appendChild(pupil);

  return group;
}

// --- Eye Controller Implementation ---
class EyeControllerImpl extends BaseController implements EyeAttachment {
  readonly type = "eye";
  private _options: EyeOptions; // Store options for potential future use

  constructor(svgGroup: SVGGElement, options?: EyeOptions) {
    super(svgGroup, "eye");

    this._options = {
      // Store a merged copy of defaults and provided options
      size: options?.size ?? DEFAULT_EYE_SIZE,
      fillColor: options?.fillColor ?? DEFAULT_FILL_COLOR,
      pupilColor: options?.pupilColor ?? DEFAULT_PUPIL_COLOR,
      pupilSizeRatio: options?.pupilSizeRatio ?? DEFAULT_PUPIL_RATIO,
      strokeColor: options?.strokeColor ?? DEFAULT_STROKE_COLOR,
      strokeWidth: options?.strokeWidth ?? DEFAULT_STROKE_WIDTH,
      ...options,
    };
  }

  toString(): string {
    return `EyeAttachment: visible=${this.isVisible()}`;
  }

  // Example of a specific eye animation (can be expanded)
  async wink(options?: AnimationParams): Promise<void> {
    this.stopAnimations();
    const duration = options?.duration ?? 150; // Fast blink
    const ease = options?.ease ?? "inOutSine";

    // Simple wink: quickly scale Y to 0 and back
    // More complex blinks could involve eyelid paths
    const originalScaleY = this.element.style.transform.includes("scaleY")
      ? parseFloat(this.element.style.transform.split("scaleY(")[1])
      : 1;

    // Animate closing
    this._currentAnimation = animate(this.element, {
      scaleY: [originalScaleY, 0.05],
      duration: duration,
      ease: ease, // Use the same ease for closing part
      delay: 50,
    });
    await this._currentAnimation.then();

    if (!this._currentAnimation) return; // Animation might have been cancelled

    // Animate opening
    this._currentAnimation = animate(this.element, {
      scaleY: [0.05, originalScaleY],
      duration: duration,
      ease: ease, // Use the same ease for opening part
    });
    await this._currentAnimation.then();
    this._currentAnimation = null;
  }
}

// --- Eyes Group Controller Implementation ---
class EyesGroupControllerImpl implements EyesAttachment {
  public readonly left: EyeAttachment;
  public readonly right: EyeAttachment;

  constructor(leftEye: EyeAttachment, rightEye: EyeAttachment) {
    this.left = leftEye;
    this.right = rightEye;
  }

  async show(options?: AnimationParams): Promise<void> {
    await Promise.all([this.left.show(options), this.right.show(options)]);
  }

  async hide(options?: AnimationParams): Promise<void> {
    await Promise.all([this.left.hide(options), this.right.hide(options)]);
  }

  async blink(options?: AnimationParams): Promise<void> {
    await Promise.all([this.left.wink(options), this.right.wink(options)]);
  }

  isVisible(): boolean {
    // Considered visible if both eyes are visible
    return this.left.isVisible() && this.right.isVisible();
  }

  toString(): string {
    return `EyesGroup: Left Eye (${this.left.toString()}), Right Eye (${this.right.toString()})`;
  }

  isAnimating(): boolean {
    // Considered animating if either eye is animating
    const leftAnimating = this.left.isAnimating
      ? this.left.isAnimating()
      : false;
    const rightAnimating = this.right.isAnimating
      ? this.right.isAnimating()
      : false;
    return leftAnimating || rightAnimating;
  }

  stopAnimations(): void {
    this.left.stopAnimations?.();
    this.right.stopAnimations?.();
  }

  async blinkBoth(options?: AnimationParams): Promise<void> {
    // If EyeAttachment has a blink method:
    const leftBlink = (this.left as EyeControllerImpl).blink?.(options);
    const rightBlink = (this.right as EyeControllerImpl).blink?.(options);
    await Promise.all([leftBlink, rightBlink].filter((p) => p));
  }
}

// --- Factory Functions ---

/**
 * Creates an EyeController instance.
 */
export function createEyeController(
  svgGroup: SVGGElement,
  options?: EyeOptions,
): EyeAttachment {
  return new EyeControllerImpl(svgGroup, options);
}

/**
 * Creates an EyesGroupController instance.
 */
export function createEyesGroupController(
  leftEye: EyeAttachment,
  rightEye: EyeAttachment,
): EyesAttachment {
  return new EyesGroupControllerImpl(leftEye, rightEye);
}
