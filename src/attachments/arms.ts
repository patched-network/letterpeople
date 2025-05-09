import { BaseController } from "./BaseController";
import type { Point } from "../util/geometry";
import { animate, AnimationParams, JSAnimation } from "animejs";

const svgNS = "http://www.w3.org/2000/svg";

/**
 * Options for customizing the appearance of an arm attachment.
 */
export interface ArmOptions {
  /** The length of the arm. Defaults to 15. */
  length?: number;
  /** The thickness of the arm. Defaults to 3. */
  thickness?: number;
  /** Fill color of the arm. Defaults to 'black'. */
  fillColor?: string;
  /** Stroke color for the arm outline. Defaults to 'none'. */
  strokeColor?: string;
  /** Stroke width for the arm outline. Defaults to 1. */
  strokeWidth?: number;
  /** The angle of the arm in degrees (0 = straight right, 90 = straight down). Defaults to 45. */
  angle?: number;
  /** The starting X coordinate for the arm (at the shoulder). */
  x: number;
  /** The starting Y coordinate for the arm (at the shoulder). */
  y: number;
}

// --- Default values ---
const DEFAULT_ARM_LENGTH = 15;
const DEFAULT_ARM_THICKNESS = 3;
const DEFAULT_FILL_COLOR = "black";
const DEFAULT_STROKE_COLOR = "none";
const DEFAULT_STROKE_WIDTH = 1;
const DEFAULT_ARM_ANGLE = 45;

/**
 * Creates SVG elements representing an arm.
 *
 * @param options - Configuration for the arm's appearance and position.
 * @returns An SVGGElement containing the arm's SVG elements.
 */
export function createArm(options: ArmOptions): SVGGElement {
  // Process options with defaults
  const length = options.length ?? DEFAULT_ARM_LENGTH;
  const thickness = options.thickness ?? DEFAULT_ARM_THICKNESS;
  const fillColor = options.fillColor ?? DEFAULT_FILL_COLOR;
  const strokeColor = options.strokeColor ?? DEFAULT_STROKE_COLOR;
  const strokeWidth = options.strokeWidth ?? DEFAULT_STROKE_WIDTH;
  const angle = options.angle ?? DEFAULT_ARM_ANGLE;
  const x = options.x;
  const y = options.y;

  // Create a group element to hold the arm parts
  const group = document.createElementNS(svgNS, "g");
  group.setAttribute("class", "letter-attachment letter-arm");
  group.style.transformOrigin = `${x}px ${y}px`;

  // Calculate end position based on angle and length
  const angleInRadians = (angle * Math.PI) / 180;
  const endX = x + Math.cos(angleInRadians) * length;
  const endY = y + Math.sin(angleInRadians) * length;

  // Create a simple capsule-shaped arm with rounded ends
  const arm = document.createElementNS(svgNS, "path");

  // Calculate perpendicular direction for arm width
  const perpAngleInRadians = angleInRadians + Math.PI / 2;
  const halfWidth = thickness / 2;

  // Calculate offset vectors
  const offsetX = Math.cos(perpAngleInRadians) * halfWidth;
  const offsetY = Math.sin(perpAngleInRadians) * halfWidth;

  // Points for the rectangle part of the arm
  const p1x = x + offsetX;
  const p1y = y + offsetY;
  const p2x = x - offsetX;
  const p2y = y - offsetY;
  const p3x = endX - offsetX;
  const p3y = endY - offsetY;
  const p4x = endX + offsetX;
  const p4y = endY + offsetY;

  // Create a path with rounded ends using arcs (perfect semi-circles)
  const pathData = [
    // Start at top-left of shoulder
    `M ${p1x.toFixed(2)} ${p1y.toFixed(2)}`,

    // Draw line to top-right near hand
    `L ${p4x.toFixed(2)} ${p4y.toFixed(2)}`,

    // Draw semi-circle for hand end (clockwise)
    `A ${halfWidth.toFixed(2)} ${halfWidth.toFixed(2)} 0 1 1 ${p3x.toFixed(2)} ${p3y.toFixed(2)}`,

    // Draw line back to bottom-left near shoulder
    `L ${p2x.toFixed(2)} ${p2y.toFixed(2)}`,

    // Draw semi-circle for shoulder end (clockwise) - changed to go outward
    `A ${halfWidth.toFixed(2)} ${halfWidth.toFixed(2)} 0 1 0 ${p1x.toFixed(2)} ${p1y.toFixed(2)}`,

    // Close the path
    `Z`,
  ].join(" ");

  arm.setAttribute("d", pathData);
  arm.setAttribute("fill", fillColor);

  if (strokeColor !== "none" && strokeWidth > 0) {
    arm.setAttribute("stroke", strokeColor);
    arm.setAttribute("stroke-width", String(strokeWidth));
    arm.setAttribute("stroke-linejoin", "round");
    arm.setAttribute("stroke-linecap", "round");
  }

  // Add to the group
  group.appendChild(arm);

  // Add a hand/end cap to the arm
  const hand = document.createElementNS(svgNS, "circle");
  hand.setAttribute("cx", String(endX));
  hand.setAttribute("cy", String(endY));
  hand.setAttribute("r", String(thickness * 1.2)); // Hand size proportional to arm thickness
  hand.setAttribute("fill", fillColor);

  if (strokeColor !== "none" && strokeWidth > 0) {
    hand.setAttribute("stroke", strokeColor);
    hand.setAttribute("stroke-width", String(strokeWidth));
  }

  group.appendChild(hand);

  return group;
}

// --- Type definition for arms attachment ---

/**
 * Interface for arm attachment functionality.
 */
export interface ArmAttachment extends BaseController {
  readonly type: "arm";

  /**
   * Rotates the arm to a specific angle.
   * @param angle Angle in degrees (0 = straight right, 90 = straight down).
   * @param options Optional animation parameters for the transition.
   * @returns A Promise that resolves when the rotation animation completes.
   */
  rotateTo(angle: number, options?: AnimationParams): Promise<void>;

  /**
   * Animates the arm waving back and forth.
   * @param options Optional animation parameters for the wave.
   * @returns A Promise that resolves when the wave animation completes.
   */
  wave(options?: AnimationParams): Promise<void>;

  /**
   * Sets the length of the arm, potentially with animation.
   * @param newLength The new length for the arm.
   * @param options Optional animation parameters for the transition.
   * @returns A Promise that resolves when the length animation completes.
   */
  setLength(newLength: number, options?: AnimationParams): Promise<void>;

  /**
   * Gets the current angle of the arm in degrees.
   */
  getCurrentAngle(): number;
}

export interface ArmsAttachment {
  readonly left: ArmAttachment;
  readonly right: ArmAttachment;

  /**
   * Shows both arms, potentially with animation.
   * @param options Optional animation parameters for the transition.
   */
  show(options?: AnimationParams): Promise<void>;

  /**
   * Hides both arms, potentially with animation.
   * @param options Optional animation parameters for the transition.
   */
  hide(options?: AnimationParams): Promise<void>;

  /**
   * Animates both arms waving.
   * @param options Optional animation parameters for the wave.
   */
  wave(options?: AnimationParams): Promise<void>;

  /**
   * Checks if both arms are visible.
   */
  isVisible(): boolean;

  /**
   * Checks if either arm is currently animating.
   */
  isAnimating(): boolean;

  /**
   * Stops any ongoing animations on both arms.
   */
  stopAnimations(): void;

  /**
   * Returns a string representation of the arms group.
   */
  toString(): string;

  /**
   * Set the length of both arms simultaneously.
   * @param newLength The new length for both arms.
   * @param options Optional animation parameters for the transition.
   */
  setLength?(newLength: number, options?: AnimationParams): Promise<void>;
}

// --- Implementation ---

class ArmControllerImpl extends BaseController implements ArmAttachment {
  readonly type: "arm" = "arm";
  private _options: ArmOptions;
  private _currentAngle: number;
  private _currentLength: number;
  private _attachmentCoord: Point;

  constructor(svgGroup: SVGGElement, options: ArmOptions) {
    super(svgGroup, "arm"); // Type is now included in attachmentTypes

    this._options = { ...options };
    this._currentAngle = options.angle ?? DEFAULT_ARM_ANGLE;
    this._currentLength = options.length ?? DEFAULT_ARM_LENGTH;
    this._attachmentCoord = { x: options.x, y: options.y };
  }

  async rotateTo(angle: number, options?: AnimationParams): Promise<void> {
    this.stopAnimations();

    const startAngle = this._currentAngle;
    this._currentAngle = angle;

    if (options && options.duration) {
      this._currentAnimation = animate(this.element, {
        rotate: [startAngle, angle],
        duration: options.duration,
        easing: options.ease || "easeOutSine",
        delay: options.delay || 0,
      });

      return this._currentAnimation.then(() => {
        this._currentAnimation = null;
      });
    } else {
      this.element.style.transform = `rotate(${angle}deg)`;
      return Promise.resolve();
    }
  }

  async wave(options?: AnimationParams): Promise<void> {
    this.stopAnimations();

    const startAngle = this._currentAngle;
    const waveAngleRange = 30;
    const waveDuration = options?.duration || 500;
    const waveCount = options?.count || 3;

    // Apply any initial delay
    if (options?.delay) {
      await new Promise((resolve) => setTimeout(resolve, options.delay));
    }

    // Perform wave animation using sequential animations
    try {
      for (let i = 0; i < waveCount; i++) {
        // Wave to one side
        this._currentAnimation = animate(this.element, {
          rotate: startAngle - waveAngleRange / 2,
          duration: waveDuration / 2,
          easing: "easeOutSine",
        });
        await this._currentAnimation.then();

        // Wave to the other side
        this._currentAnimation = animate(this.element, {
          rotate: startAngle + waveAngleRange / 2,
          duration: waveDuration / 2,
          easing: "easeInOutSine",
        });
        await this._currentAnimation.then();
      }

      // Return to original position
      this._currentAnimation = animate(this.element, {
        rotate: startAngle,
        duration: waveDuration / 2,
        easing: "easeInSine",
      });

      await this._currentAnimation.then();
      this._currentAnimation = null;
      this._currentAngle = startAngle; // Ensure we reset to the original angle
    } catch (e) {
      // Handle animation interruptions
      this._currentAngle = startAngle;
      this.element.style.transform = `rotate(${startAngle}deg)`;
      this._currentAnimation = null;
      throw e;
    }
  }

  async setLength(newLength: number, options?: AnimationParams): Promise<void> {
    this.stopAnimations();

    const oldLength = this._currentLength;
    this._currentLength = newLength;

    // We need to recreate the arm with the new length
    const newOptions = {
      ...this._options,
      length: newLength,
      x: this._attachmentCoord.x,
      y: this._attachmentCoord.y,
      angle: this._currentAngle,
    };

    // If no animation, simply replace the arm
    if (!options || !options.duration) {
      const newArmGroup = createArm(newOptions);

      // Preserve rotation and other transforms
      newArmGroup.style.transform = this.element.style.transform;

      // Replace the old arm with the new one
      this.element.innerHTML = newArmGroup.innerHTML;
      return Promise.resolve();
    }

    // For animation, we'll use scaling
    // Calculate the scale factor
    const scaleFactor = newLength / oldLength;

    // Animate the scale
    this._currentAnimation = animate(this.element, {
      scaleX: scaleFactor,
      duration: options.duration,
      easing: options.ease || "easeOutQuad",
      delay: options.delay || 0,
    });

    return this._currentAnimation.then(() => {
      this._currentAnimation = null;

      // After animation completes, replace with correctly sized arm to avoid accumulated transforms
      const newArmGroup = createArm(newOptions);
      this.element.innerHTML = newArmGroup.innerHTML;
      this.element.style.transform = `rotate(${this._currentAngle}deg)`;
    });
  }

  getCurrentAngle(): number {
    return this._currentAngle;
  }

  toString(): string {
    return `ArmAttachment: visible=${this.isVisible()}, angle=${this._currentAngle}°, length=${this._currentLength}`;
  }
}

// --- Arms Group Controller Implementation ---
class ArmsGroupControllerImpl implements ArmsAttachment {
  public readonly left: ArmAttachment;
  public readonly right: ArmAttachment;

  constructor(leftArm: ArmAttachment, rightArm: ArmAttachment) {
    this.left = leftArm;
    this.right = rightArm;
  }

  async show(options?: AnimationParams): Promise<void> {
    await Promise.all([this.left.show(options), this.right.show(options)]);
  }

  async hide(options?: AnimationParams): Promise<void> {
    await Promise.all([this.left.hide(options), this.right.hide(options)]);
  }

  async wave(options?: AnimationParams): Promise<void> {
    // Stagger the wave animations slightly for a more natural effect
    const rightArmDelay = options?.delay || 0;
    const leftArmDelay = rightArmDelay + 150; // 150ms offset

    const rightOptions = { ...options, delay: rightArmDelay };
    const leftOptions = { ...options, delay: leftArmDelay };

    await Promise.all([
      this.left.wave(leftOptions),
      this.right.wave(rightOptions),
    ]);
  }

  async setLength(newLength: number, options?: AnimationParams): Promise<void> {
    await Promise.all([
      this.left.setLength(newLength, options),
      this.right.setLength(newLength, options),
    ]);
  }

  isVisible(): boolean {
    return this.left.isVisible() && this.right.isVisible();
  }

  isAnimating(): boolean {
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

  toString(): string {
    return `ArmsGroup: Left Arm (${this.left.toString()}), Right Arm (${this.right.toString()})`;
  }
}

// --- Factory Functions ---

/**
 * Creates an ArmController instance.
 */
export function createArmController(
  svgGroup: SVGGElement,
  options: ArmOptions,
): ArmAttachment {
  return new ArmControllerImpl(svgGroup, options);
}

/**
 * Creates an ArmsGroupController instance.
 */
export function createArmsGroupController(
  leftArm: ArmAttachment,
  rightArm: ArmAttachment,
): ArmsAttachment {
  return new ArmsGroupControllerImpl(leftArm, rightArm);
}
