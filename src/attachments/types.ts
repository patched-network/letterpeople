/**
 * @file Defines common types for LetterPeople attachments.
 */

import type { AnimationParams } from "animejs";

export type attachmentTypes = "eyes-group" | "eye" | "mouth" | "arm" | "arms-group";

/**
 * Represents a generic, controllable attachment part of a LetterInstance.
 * Specific attachment types (e.g., EyeAttachment, MouthAttachment) will implement
 * this interface, potentially adding their own specific methods.
 */
export interface BaseAttachment {
  /**
   * A read-only reference to the root SVG group (<g>) element for this attachment.
   * This element contains all visual parts of the attachment.
   */
  readonly element: SVGGElement;

  /**
   * A read-only string identifying the type of attachment (e.g., 'eye', 'mouth', 'eyebrow').
   */
  readonly type: attachmentTypes;

  /**
   * Makes the attachment visible, potentially with an animation.
   * @param options Optional animation parameters for the transition.
   * @returns A Promise that resolves when the show animation completes (or immediately if no animation).
   */
  show(options?: AnimationParams): Promise<void>;

  /**
   * Makes the attachment invisible, potentially with an animation.
   * @param options Optional animation parameters for the transition.
   * @returns A Promise that resolves when the hide animation completes (or immediately if no animation).
   */
  hide(options?: AnimationParams): Promise<void>;

  /**
   * Checks if the attachment is currently considered visible (or transitioning to visible).
   * This might check CSS classes, display style, or internal state.
   * @returns True if visible, false otherwise.
   */
  isVisible(): boolean;

  /**
   * Formats the state of the attachment for debugging purposes.
   * @returns A description of the current state of the attachment .
   */
  toString(): string;

  /**
   * Optional: Checks if the attachment is currently undergoing an animation controlled by its methods.
   * @returns True if animating, false otherwise.
   */
  isAnimating?(): boolean;

  /**
   * Optional: Immediately stops any ongoing animations controlled by this attachment.
   */
  stopAnimations?(): void;

  // Note: A 'destroy' method isn't included here, as the attachment's SVG element
  // is typically removed when the parent LetterInstance is destroyed. If attachments
  // need more complex cleanup (e.g., removing global event listeners), a destroy
  // method could be added.
}

// Example of a more specific attachment interface (defined elsewhere, e.g., mouth.ts)

import type { MouthParameters } from "./mouth"; // Assuming this is where MouthParameters is defined

export interface MouthAttachment extends BaseAttachment {
  readonly type: "mouth";

  // Method to update the mouth shape, potentially animated
  updateShape(
    params: Partial<MouthParameters>,
    options?: AnimationParams,
  ): Promise<void>;

  // Method to get current shape parameters
  getCurrentShapeParams(): MouthParameters;

  // Specific animation like speaking
  animateSpeak(speakOptions?: AnimationParams): Promise<void>;
}

export interface EyesAttachment {
  // expose individual eyes
  left: EyeAttachment;
  right: EyeAttachment;

  // and helper fcns that apply actions to both eyes - eg, blink, scowl, etc
  blink(blinkOptions?: AnimationParams): Promise<void>;
  
  /**
   * Make both eyes look in the specified direction
   * @param direction The direction to look in as {x, y} coordinates or angle in degrees
   * @param options Optional animation parameters for the eye movement
   */
  lookAt(direction: { x: number, y: number } | number, options?: AnimationParams): Promise<void>;
  
  /**
   * Start tracking the mouse cursor with both eyes
   * @param options Options for tracking behavior
   */
  startTracking(options?: {
    intensity?: number;  // How strongly the eyes follow (0-1), defaults to 0.5
    ease?: string;       // Easing function for tracking movement
  }): void;
  
  /**
   * Stop tracking the cursor with both eyes
   */
  stopTracking(): void;
  
  /**
   * Check if eyes are currently tracking the cursor
   */
  isTracking(): boolean;
}

export interface EyeAttachment extends BaseAttachment {
  readonly type: "eye";

  /**
   * Causes the eye to quickly close and reopen
   * @param blinkOptions Optional animation parameters for the wink.
   */
  wink(blinkOptions?: AnimationParams): Promise<void>;
  
  /**
   * Makes the pupil look in a specific direction
   * @param direction The direction to look in as {x, y} coordinates or angle in degrees.
   * @param options Optional animation parameters for the eye movement.
   */
  lookAt(direction: { x: number, y: number } | number, options?: AnimationParams): Promise<void>;
  
  /**
   * Returns the current position of the pupil as an offset from center
   */
  getPupilPosition(): { x: number, y: number };
  
  /**
   * Start tracking the mouse cursor with the pupil
   * @param options Options for tracking behavior
   */
  startTracking(options?: {
    intensity?: number;  // How strongly the eyes follow (0-1), defaults to 0.5
    ease?: string;       // Easing function for tracking movement
  }): void;
  
  /**
   * Stop tracking the cursor
   */
  stopTracking(): void;
  
  /**
   * Check if this eye is currently tracking the cursor
   */
  isTracking(): boolean;
}

export interface ArmsAttachment {
  // expose individual arms
  left: ArmAttachment;
  right: ArmAttachment;

  // helper functions that apply to both arms
  wave(options?: AnimationParams): Promise<void>;
  
  // common interface methods
  show(options?: AnimationParams): Promise<void>;
  hide(options?: AnimationParams): Promise<void>;
  isVisible(): boolean;
  isAnimating(): boolean;
  stopAnimations(): void;
  toString(): string;
}

export interface ArmAttachment extends BaseAttachment {
  readonly type: "arm";

  rotateTo(angle: number, options?: AnimationParams): Promise<void>;
  wave(options?: AnimationParams): Promise<void>;
  setLength(newLength: number, options?: AnimationParams): Promise<void>;
  getCurrentAngle(): number;
}
