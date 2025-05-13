// src/attachments/eye.ts

import { animate, AnimationParams, JSAnimation, Timer } from "animejs";
import type { EyeAttachment, EyesAttachment } from "./types";
import { BaseController } from "./BaseController";
import type { Point } from "../util/geometry";

// Declare mouse position variables without modifying global Window
let globalMouseX = 0;
let globalMouseY = 0;

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
  /** Maximum distance the pupil can move from center (as a ratio of eye radius). Defaults to 0.3. */
  pupilMobilityRatio?: number;
}

// --- Default values ---
const DEFAULT_EYE_SIZE = 10;
const DEFAULT_FILL_COLOR = "white";
const DEFAULT_PUPIL_COLOR = "black";
const DEFAULT_PUPIL_RATIO = 0.4;
const DEFAULT_STROKE_COLOR = "grey";
const DEFAULT_STROKE_WIDTH = 0.5;
const DEFAULT_PUPIL_MOBILITY_RATIO = 0.6; // How far the pupil can move from center (60% of radius)

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

  // stransformations relative to eye's center
  group.style.transformOrigin = `${x}px ${y}px`;

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
  pupil.setAttribute("class", "letter-eye-pupil");

  // Add parts to the group
  group.appendChild(sclera);
  group.appendChild(pupil);

  return group;
}

// --- Eye Controller Implementation ---
class EyeControllerImpl extends BaseController implements EyeAttachment {
  readonly type = "eye";
  private _options: EyeOptions; // Store options for potential future use
  private _eyeCenter: Point;
  private _currentPupilOffset: Point = { x: 0, y: 0 }; // Offset from center
  private _maxPupilOffset: number;
  private _isTracking: boolean = false;
  private _trackingRAF: number | null = null;
  private _trackingIntensity: number = 0.5;
  private _trackingEase: string = "easeOutQuad";

  // Event handler for mouse position
  private _updateMousePosition = (e: MouseEvent) => {
    globalMouseX = e.clientX;
    globalMouseY = e.clientY;
  };

  constructor(svgGroup: SVGGElement, options?: EyeOptions, center?: Point) {
    super(svgGroup, "eye");

    this._options = {
      // Store a merged copy of defaults and provided options
      size: options?.size ?? DEFAULT_EYE_SIZE,
      fillColor: options?.fillColor ?? DEFAULT_FILL_COLOR,
      pupilColor: options?.pupilColor ?? DEFAULT_PUPIL_COLOR,
      pupilSizeRatio: options?.pupilSizeRatio ?? DEFAULT_PUPIL_RATIO,
      strokeColor: options?.strokeColor ?? DEFAULT_STROKE_COLOR,
      strokeWidth: options?.strokeWidth ?? DEFAULT_STROKE_WIDTH,
      pupilMobilityRatio:
        options?.pupilMobilityRatio ?? DEFAULT_PUPIL_MOBILITY_RATIO,
      ...options,
    };

    // Find eye center if not provided
    if (center) {
      this._eyeCenter = { ...center };
    } else {
      // Extract from the sclera element's cx/cy attributes
      const sclera = this.element.querySelector(
        "circle:not(.letter-eye-pupil)",
      );
      if (sclera) {
        this._eyeCenter = {
          x: parseFloat(sclera.getAttribute("cx") || "0"),
          y: parseFloat(sclera.getAttribute("cy") || "0"),
        };
      } else {
        // Fallback using element's bounding box
        const bbox = this.element.getBoundingClientRect();
        this._eyeCenter = {
          x: bbox.width / 2,
          y: bbox.height / 2,
        };
      }
    }

    // Calculate max pupil movement distance
    const eyeSize = this._options.size ?? DEFAULT_EYE_SIZE;
    const mobilityRatio =
      this._options.pupilMobilityRatio ?? DEFAULT_PUPIL_MOBILITY_RATIO;
    this._maxPupilOffset = (eyeSize / 2) * mobilityRatio;
  }

  toString(): string {
    return `EyeAttachment: visible=${this.isVisible()}, tracking=${this._isTracking}`;
  }

  // Eye animation: wink by scaling vertically
  async wink(options?: AnimationParams): Promise<void> {
    this.stopAnimations();
    const duration = options?.duration ?? 150; // Fast blink
    const ease = options?.ease ?? "inOutSine";

    // Simple wink: quickly scale Y to 0 and back
    // More complex blinks could involve eyelid paths
    const originalScaleY = this.element.style.transform.includes("scaleY")
      ? parseFloat(this.element.style.transform.split("scaleY(")[1])
      : 1;

    // Store pupil position before wink
    const prevPupilPos = this.getPupilPosition();

    try {
      // Animate closing
      this._currentAnimation = animate(this.element, {
        scaleY: [originalScaleY, 0.05],
        duration: duration as number,
        ease: ease, // Use the same ease for closing part
        delay: 50,
      });
      
      // Wait for animation to finish using promise based approach
      await new Promise((resolve) => {
        setTimeout(resolve, (duration as number) + 50);
      });

      // Animation might have been cancelled
      if (this._isVisibleState === false) return; 

      // Animate opening
      this._currentAnimation = animate(this.element, {
        scaleY: [0.05, originalScaleY],
        duration: duration as number,
        ease: ease, // Use the same ease for opening part
      });
      
      // Wait for animation to finish using promise based approach
      await new Promise((resolve) => {
        setTimeout(resolve, duration as number);
      });
    } catch (err) {
      console.error("Wink animation error:", err);
    } finally {
      this._currentAnimation = null;
    }

    // Restore pupil position if it was moved
    if (prevPupilPos.x !== 0 || prevPupilPos.y !== 0) {
      this.lookAt(prevPupilPos);
    }
  }

  /**
   * Makes the pupil look in a specific direction
   */
  async lookAt(
    direction: { x: number; y: number } | number,
    options?: AnimationParams,
  ): Promise<void> {
    // Stop any tracking while we manually position
    const wasTracking = this._isTracking;
    if (wasTracking) {
      this.stopTracking();
    }

    // If we're animating the pupil, stop that animation
    if (this._currentAnimation && this._currentAnimation.completed === false) {
      this._currentAnimation.pause();
      this._currentAnimation = null;
    }

    let targetX: number = 0;
    let targetY: number = 0;

    // Calculate target position based on input type
    if (typeof direction === "number") {
      // Direction is an angle in degrees
      const angleInRadians = (direction * Math.PI) / 180;
      targetX = Math.cos(angleInRadians) * this._maxPupilOffset;
      targetY = Math.sin(angleInRadians) * this._maxPupilOffset;
    } else {
      // Direction is a point, normalize to max offset
      const magnitude = Math.sqrt(
        direction.x * direction.x + direction.y * direction.y,
      );
      if (magnitude > 0) {
        const scale = Math.min(magnitude, this._maxPupilOffset) / magnitude;
        targetX = direction.x * scale;
        targetY = direction.y * scale;
      }
    }

    // Get the pupil element
    const pupil = this.element.querySelector(
      ".letter-eye-pupil",
    ) as SVGCircleElement;
    if (!pupil) return Promise.resolve();

    // Determine animation params
    const duration = options?.duration ?? 150;
    const ease = options?.ease ?? "easeOutQuad";

    if (typeof duration === 'number' && duration > 0) {
      // Animate pupil to target position
      const startX = this._currentPupilOffset.x;
      const startY = this._currentPupilOffset.y;

      // Use a simple object to track properties
      const animObj = { x: startX, y: startY };
      
      try {
        // Create the animation
        this._currentAnimation = animate(animObj, {
          x: targetX,
          y: targetY,
          duration: duration as number,
          ease: ease,
          update: () => {
            if (pupil) {
              // Use the animated object directly
              pupil.setAttribute("cx", String(this._eyeCenter.x + animObj.x));
              pupil.setAttribute("cy", String(this._eyeCenter.y + animObj.y));
              this._currentPupilOffset = { x: animObj.x, y: animObj.y };
            }
          },
        });

        // Wait for animation to finish using setTimeout instead of the animation promise
        await new Promise<void>(resolve => {
          setTimeout(() => {
            // Update final position
            if (pupil) {
              pupil.setAttribute("cx", String(this._eyeCenter.x + targetX));
              pupil.setAttribute("cy", String(this._eyeCenter.y + targetY));
              this._currentPupilOffset = { x: targetX, y: targetY };
            }
            resolve();
          }, duration as number);
        });
        
        // Clean up
        this._currentAnimation = null;
      } catch (err) {
        console.error("Eye lookAt animation error:", err);
        this._currentAnimation = null;
      } finally {
        // Resume tracking if it was active before
        if (wasTracking) {
          this.startTracking({
            intensity: this._trackingIntensity,
            ease: this._trackingEase,
          });
        }
      }
      
      return;
    } else {
      // Immediately set position without animation
      pupil.setAttribute("cx", String(this._eyeCenter.x + targetX));
      pupil.setAttribute("cy", String(this._eyeCenter.y + targetY));
      this._currentPupilOffset = { x: targetX, y: targetY };

      // Resume tracking if it was active before
      if (wasTracking) {
        this.startTracking({
          intensity: this._trackingIntensity,
          ease: this._trackingEase,
        });
      }

      return;
    }
  }

  /**
   * Get current pupil position as offset from center
   */
  getPupilPosition(): { x: number; y: number } {
    return { ...this._currentPupilOffset };
  }

  /**
   * Start tracking the mouse cursor
   */
  startTracking(options?: { intensity?: number; ease?: string }): void {
    if (this._isTracking) return; // Already tracking

    // Update tracking parameters
    this._trackingIntensity = options?.intensity ?? 0.5;
    this._trackingEase = options?.ease ?? "easeOutQuad";

    this._isTracking = true;

    // Start tracking loop
    const trackingLoop = () => {
      if (!this._isTracking) return; // Exit if tracking stopped

      // Get current mouse position
      const mouseX = globalMouseX;
      const mouseY = globalMouseY;

      // Get element position relative to viewport
      const svgElement = this.element.closest("svg");
      if (!svgElement) return;

      // Get SVG's position and scale
      const svgRect = svgElement.getBoundingClientRect();
      const svgScale = svgRect.width / svgElement.viewBox.baseVal.width || 1;

      // Get eye position in viewport coordinates
      const eyeRectX = this._eyeCenter.x * svgScale + svgRect.left;
      const eyeRectY = this._eyeCenter.y * svgScale + svgRect.top;

      // Calculate direction vector from eye to mouse
      const dirX = mouseX - eyeRectX;
      const dirY = mouseY - eyeRectY;

      // Calculate distance
      const distance = Math.sqrt(dirX * dirX + dirY * dirY);

      if (distance > 0) {
        // Normalize and scale by intensity and max offset
        const scale =
          (Math.min(distance, this._maxPupilOffset) / distance) *
          this._trackingIntensity;
        const targetX = dirX * scale;
        const targetY = dirY * scale;

        // Get the pupil element
        const pupil = this.element.querySelector(
          ".letter-eye-pupil",
        ) as SVGCircleElement;
        if (pupil) {
          // Apply movement with easing
          const newX = this._eyeCenter.x + targetX;
          const newY = this._eyeCenter.y + targetY;
          pupil.setAttribute("cx", String(newX));
          pupil.setAttribute("cy", String(newY));
          this._currentPupilOffset = { x: targetX, y: targetY };
        }
      }

      // Continue tracking loop
      this._trackingRAF = requestAnimationFrame(trackingLoop);
    };

    // Setup mouse position tracking if not already set up
    document.removeEventListener("mousemove", this._updateMousePosition);
    document.addEventListener("mousemove", this._updateMousePosition);

    // Start the tracking loop
    this._trackingRAF = requestAnimationFrame(trackingLoop);
  }

  /**
   * Stop tracking the cursor
   */
  stopTracking(): void {
    this._isTracking = false;
    if (this._trackingRAF !== null) {
      cancelAnimationFrame(this._trackingRAF);
      this._trackingRAF = null;
    }
    // Remove event listener when tracking stops
    document.removeEventListener("mousemove", this._updateMousePosition);
  }

  /**
   * Check if tracking is active
   */
  isTracking(): boolean {
    return this._isTracking;
  }

  /**
   * Override the parent stopAnimations to include tracking
   */
  stopAnimations(): void {
    super.stopAnimations();
    this.stopTracking();
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

  async lookAt(
    direction: { x: number; y: number } | number,
    options?: AnimationParams,
  ): Promise<void> {
    await Promise.all([
      this.left.lookAt(direction, options),
      this.right.lookAt(direction, options),
    ]);
  }

  startTracking(options?: { intensity?: number; ease?: string }): void {
    this.left.startTracking(options);
    this.right.startTracking(options);
  }

  stopTracking(): void {
    this.left.stopTracking();
    this.right.stopTracking();
  }

  isTracking(): boolean {
    return this.left.isTracking() || this.right.isTracking();
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
}

// --- Factory Functions ---

/**
 * Creates an EyeController instance.
 */
export function createEyeController(
  svgGroup: SVGGElement,
  options?: EyeOptions,
  center?: Point,
): EyeAttachment {
  return new EyeControllerImpl(svgGroup, options, center);
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
