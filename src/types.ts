import type { EyeOptions } from "./attachments/eye";
// Import the new mouth types
import type {
  MouthParameters,
  MouthAppearanceOptions,
} from "./attachments/mouth";

export type { MouthParameters, MouthAppearanceOptions };

// Basic point type
export interface Point {
  x: number;
  y: number;
}

// Options for creating the base letter shape AND its attachments
export interface LetterOptions {
  // Base letter appearance
  color?: string;
  strokeColor?: string;
  strokeWidth?: number;
  lineWidth?: number;
  style?: "sans-serif" | "serif";

  // --- Attachment Options ---
  // Simple override for eye size (can be expanded)
  eyeSize?: number;
  // Nested options for the morphing mouth
  mouthParams?: Partial<MouthParameters>; // Allow partial overrides
  mouthAppearance?: Partial<MouthAppearanceOptions>; // Allow partial overrides
}

// Structure for rendered attachment elements
export interface AttachmentElements {
  leftEye?: SVGGElement;
  rightEye?: SVGGElement;
  mouth?: SVGGElement; // This will now hold the morphing mouth group
  // Add others like hatElement, armElements etc. if they need direct manipulation
}

// Animation options (example)
export interface AnimationOptions {
  duration?: number;
  // Add other animation parameters as needed (easing, delay, etc.)
}

// The main return type - Represents a fully constructed and controllable letter character
export interface LetterInstance {
  /** The root <svg> element of the letter */
  svgElement: SVGElement;
  /** Map of logical attachment point names to their coordinates relative to the SVG origin */
  attachmentCoords: { [key: string]: Point };
  /** References to the actual rendered SVG elements for key attachments */
  attachmentElements: AttachmentElements;
  /** The letter character this instance represents (e.g., 'L') */
  readonly character: string;
  /** Reference to the container element this letter was added to */
  readonly parentElement: Element;

  // --- Control Methods ---
  /**
   * Triggers a 'speaking' animation, primarily affecting the mouth.
   * @param options Optional parameters for the animation.
   */
  animateMouth(options?: AnimationOptions): Promise<void>; // Return Promise for async animations

  /**
   * Removes the letter's SVG element from the DOM.
   */
  destroy(): void;

  // --- NEW (Potential): Method to update mouth shape ---
  /**
   * Updates the mouth's shape based on new parameters.
   * @param params New parameters for the mouth shape.
   */
  updateMouth(params: Partial<MouthParameters>): void; // Added for dynamic control

  // --- Potential Future Methods ---
  // updateOptions(newOptions: Partial<LetterOptions>): void;
  // setPosition(x: number, y: number): void;
  // wiggle(options?: AnimationOptions): void;
}

/** @internal Result from an internal letter shape renderer */
export interface InternalLetterRenderResult {
  svg: SVGElement; // The base SVG element with the letter path
  attachments: { [key: string]: Point }; // The calculated attachment coordinates
}
