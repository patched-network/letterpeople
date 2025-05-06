// Import attachment controller interfaces and their specific options/params
import type {
  MouthAttachment,
  EyesAttachment, // Assuming this will be the group controller for eyes
  // EyeAttachment, // Individual eye controller, might be used by EyesAttachment internally
} from "./attachments/types"; // Import the new attachment controller types

import type {
  MouthParameters,
  MouthAppearanceOptions,
} from "./attachments/mouth"; // Keep these for LetterOptions

// Re-export for convenience if needed by consumers of the library for options
export type { MouthParameters, MouthAppearanceOptions };

// Import options for individual attachments if they are directly configurable via LetterOptions
// For example, if EyeOptions were still used directly in LetterOptions:
// import type { EyeOptions } from "./attachments/eye";

// Basic point type
export interface Point {
  x: number;
  y: number;
}

// Options for creating the base letter shape AND its attachments
export interface LetterOptions {
  // Base letter appearance
  color?: string;
  lineWidth?: number;
  // Renamed strokeColor and strokeWidth for consistency with other parts of the project
  borderColor?: string;
  borderWidth?: number;
  style?: "sans-serif" | "serif";

  // --- Attachment Options ---
  // These options are for the *initial creation* of attachments.
  // The attachment controller instances will handle their own state and updates later.

  // Example: Options for individual eyes if EyesAttachment doesn't fully encapsulate them
  // or if they need distinct initial settings.
  // leftEyeOptions?: Partial<EyeOptions>; // Assuming EyeOptions is defined for individual eye appearance
  // rightEyeOptions?: Partial<EyeOptions>;
  eyeSize?: number; // Simple override, could be part of a more complex EyeOptions

  // Nested options for the morphing mouth
  mouthParams?: Partial<MouthParameters>;
  mouthAppearance?: Partial<MouthAppearanceOptions>;

  // Add other attachment-specific initial options here as new attachments are developed
  // e.g., eyebrowOptions?: Partial<EyebrowAppearanceOptions>;
}

// General animation options, can be used by high-level LetterInstance methods
export interface AnimationOptions {
  duration?: number;
  easing?: string;
  delay?: number;
  // Add other animation parameters as needed
}

// The main return type - Represents a fully constructed and controllable letter character
export interface LetterInstance {
  /** The root <svg> element of the letter */
  readonly svgElement: SVGElement;

  /**
   * Map of logical attachment point names to their coordinates relative to the SVG origin.
   * Still useful for initial placement and debugging.
   */
  readonly attachmentCoords: AttachmentList;

  /** The letter character this instance represents (e.g., 'L') */
  readonly character: string;

  /** Reference to the container element this letter was added to */
  readonly parentElement: Element;

  // --- Direct Accessors to Attachment Controllers ---
  readonly mouth: MouthAttachment;
  readonly eyes: EyesAttachment;
  // readonly leftEyebrow?: EyebrowAttachment; // Example for future
  // readonly rightEyebrow?: EyebrowAttachment; // Example for future
  // ... other attachments

  /**
   * Removes the letter's SVG element from the DOM and performs any necessary cleanup.
   */
  destroy(): void;

  // --- High-Level Expression/Action Methods (Examples - to be implemented later) ---
  /**
   * Makes the letter express a specific emotion.
   * This method will coordinate animations across multiple attachments.
   * @param emotion The emotion to express (e.g., 'happy', 'sad', 'shocked', 'neutral').
   * @param options Optional animation parameters for the transition.
   * @returns A Promise that resolves when the expression animation completes.
   */
  // express(emotion: string, options?: AnimationOptions): Promise<void>;

  /**
   * Triggers a brief "speak" animation, typically a quick mouth movement.
   * @param options Optional animation parameters.
   * @returns A Promise that resolves when the speak animation completes.
   */
  // speakPulse(options?: AnimationOptions): Promise<void>;

  // --- Potential Future General Methods ---
  // updateBaseAppearance(newOptions: Partial<Pick<LetterOptions, 'color' | 'lineWidth' | ...>>): void;
  // setPosition(x: number, y: number): void; // If managing position outside CSS
  // wiggle(options?: AnimationOptions): void;
}

/**
 * @internal
 * Result from an internal letter shape renderer (e.g., L-uppercase.ts).
 * This remains unchanged as it defines the raw output of the letter's path and attachment points.
 */
export interface InternalLetterRenderResult {
  svg: SVGElement; // The base SVG element with the letter path
  attachments: AttachmentList; // The calculated attachment coordinates
}

export interface AttachmentList {
  mouth: Point;
  leftEye: Point;
  rightEye: Point;
  leftLeg: Point;
  rightLeg: Point;
  leftArm: Point;
  rightArm: Point;
  hat: Point;
}
