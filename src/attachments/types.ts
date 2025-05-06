/**
 * @file Defines common types for LetterPeople attachments.
 */

import type { AnimateParams } from "animejs";

export type attachmentTypes = "eyes-group" | "eye" | "mouth";

/**
 * Common animation options for attachment methods.
 * Extends AnimeParams but allows for simpler overrides.
 */
export interface AttachmentAnimationOptions
  extends Omit<AnimeParams, "targets"> {
  duration?: number;
  easing?: string;
  delay?: number;
  // Add any other common animation parameters you foresee needing
}

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
  readonly type: attachmentType;

  /**
   * Makes the attachment visible, potentially with an animation.
   * @param options Optional animation parameters for the transition.
   * @returns A Promise that resolves when the show animation completes (or immediately if no animation).
   */
  show(options?: AttachmentAnimationOptions): Promise<void>;

  /**
   * Makes the attachment invisible, potentially with an animation.
   * @param options Optional animation parameters for the transition.
   * @returns A Promise that resolves when the hide animation completes (or immediately if no animation).
   */
  hide(options?: AttachmentAnimationOptions): Promise<void>;

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
    options?: AttachmentAnimationOptions,
  ): Promise<void>;

  // Method to get current shape parameters
  getCurrentShapeParams(): MouthParameters;

  // Specific animation like speaking
  animateSpeak?(speakOptions?: AttachmentAnimationOptions): Promise<void>;
}

export interface EyesAttachment {
  // expose individual eyes
  left: EyeAttachment;
  right: EyeAttachment;

  // and helper fcns that apply actions to both eyes - eg, blink, scowl, etc
}

export interface EyeAttachment extends BaseAttachment {
  readonly type: "eye";
}
