import type { EyeOptions } from "./attachments/eye"; // Import attachment options if needed elsewhere
// Assuming a similar mouth.ts exists or will be created:
// import type { MouthOptions } from './attachments/mouth';

// Basic point type (already exists, good)
export interface Point {
  x: number;
  y: number;
}

// Options for creating the base letter shape
export interface LetterOptions {
  color?: string;
  strokeColor?: string;
  strokeWidth?: number;
  lineWidth?: number;
  style?: "sans-serif" | "serif";
  // --- NEW: Options for default attachments ---
  // We could nest options for specific attachments if needed
  // eyeOptions?: EyeOptions;
  // mouthOptions?: MouthOptions;
  // For simplicity now, let's assume attachments use defaults or simple overrides
  eyeSize?: number; // Example simple override
  // Add other simple attachment overrides if desired
}

// --- NEW: Structure for rendered attachment elements ---
// Holds references to the actual SVG elements of key attachments
export interface AttachmentElements {
  leftEye?: SVGGElement; // Group containing left eye parts
  rightEye?: SVGGElement; // Group containing right eye parts
  mouth?: SVGGElement; // Group containing mouth parts
  // Add others like hatElement, armElements etc. if they need direct manipulation
}

// --- NEW: Animation options (example) ---
export interface AnimationOptions {
  duration?: number; // e.g., duration of mouth movement
  // Add other animation parameters as needed (easing, delay, etc.)
}

// --- REVISED: The main return type ---
// Represents a fully constructed and controllable letter character
export interface LetterInstance {
  /** The root <svg> element of the letter */
  svgElement: SVGElement;

  /** Map of logical attachment point names to their coordinates relative to the SVG origin */
  attachmentCoords: { [key: string]: Point }; // Renamed from 'attachments' for clarity

  /** References to the actual rendered SVG elements for key attachments */
  attachmentElements: AttachmentElements;

  /** The letter character this instance represents (e.g., 'L') */
  readonly character: string;

  /** Reference to the container element this letter was added to */
  readonly parentElement: Element;

  // --- NEW: Control Methods ---

  /**
   * Triggers a 'speaking' animation, primarily affecting the mouth.
   * @param options Optional parameters for the animation.
   */
  animateMouth(options?: AnimationOptions): Promise<void>; // Return Promise for async animations

  /**
   * Removes the letter's SVG element from the DOM.
   */
  destroy(): void;

  // --- Potential Future Methods ---
  // updateOptions(newOptions: Partial<LetterOptions>): void;
  // setPosition(x: number, y: number): void; // If managing position outside CSS
  // wiggle(options?: AnimationOptions): void;
}

// --- REMOVED or INTERNALIZED ---
// LetterRender is replaced by LetterInstance.
// The internal result from a specific letter renderer (like L.ts) might look different.
// Let's define an internal type for what L.ts should return:
/** @internal Result from an internal letter shape renderer */
export interface InternalLetterRenderResult {
  svg: SVGElement; // The base SVG element with the letter path
  attachments: { [key: string]: Point }; // The calculated attachment coordinates
}
