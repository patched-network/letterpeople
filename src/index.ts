import type {
  LetterInstance,
  // No longer need AttachmentElements from here
  Point,
  // AnimationOptions, // Keep for future high-level methods
  LetterOptions,
  InternalLetterRenderResult,
  MouthParameters,
  MouthAppearanceOptions,
} from "./types";

// Import the new attachment controller INTERFACES
import type {
  MouthAttachment,
  EyesAttachment,
  EyeAttachment,
  // AttachmentAnimationOptions, // Not used directly in this file yet
  // attachmentTypes // Not used directly in this file yet
} from "./attachments/types";

// Import SVG element creators (these are still needed)
import {
  createEye,
  EyeOptions,
  createEyeController,
  createEyesGroupController,
} from "./attachments/eye";
import {
  createMorphingMouth,
  createMorphingMouthController,
} from "./attachments/mouth";

// Import letter implementations
import L from "./letters/L-uppercase";

// Map letters to their rendering functions
const letterRenderers: {
  [key: string]: (options?: LetterOptions) => InternalLetterRenderResult;
} = {
  L: L,
};

// Default parameters for the mouth if not provided (still relevant for initial creation)
const DEFAULT_MOUTH_PARAMS: MouthParameters = {
  openness: 0.2,
  mood: 0.7,
};

export function createLetter(
  letter: string,
  target: Element,
  options?: LetterOptions,
): LetterInstance | null {
  const renderer = letterRenderers[letter];
  if (!renderer) {
    console.warn(`Renderer for letter "${letter}" not found.`);
    return null;
  }

  try {
    // 1. Get base SVG and attachment coordinates
    const internalResult: InternalLetterRenderResult = renderer(options);
    const svg = internalResult.svg;
    const attachmentCoords = internalResult.attachments;

    // 2. Create Attachment SVG Elements AND their Controllers
    let mouthController: MouthAttachment;

    const initialMouthParams: MouthParameters = {
      ...DEFAULT_MOUTH_PARAMS,
      ...(options?.mouthParams || {}),
    };

    const mouthSvgElement = createMorphingMouth(
      // Creates the <g> element for the mouth
      attachmentCoords.mouth.x,
      attachmentCoords.mouth.y,
      initialMouthParams,
      options?.mouthAppearance,
    );
    svg.appendChild(mouthSvgElement); // Add the mouth's SVG to the main letter SVG

    // Now, create the controller for this mouth element
    mouthController = createMorphingMouthController(
      mouthSvgElement,
      initialMouthParams,
      options?.mouthAppearance,
      attachmentCoords.mouth, // Pass the coordinate for potential re-creation logic
    );

    let leftEyeCtrl: EyeAttachment;
    const leftEyeSvgElement = createEye(
      attachmentCoords.leftEye.x,
      attachmentCoords.leftEye.y,
      { size: options?.eyeSize },
    );
    svg.appendChild(leftEyeSvgElement);
    leftEyeCtrl = createEyeController(leftEyeSvgElement, {
      size: options?.eyeSize,
    });

    let rightEyeCtrl: EyeAttachment;

    const rightEyeSvgElement = createEye(
      attachmentCoords.rightEye.x,
      attachmentCoords.rightEye.y,
      { size: options?.eyeSize },
    );
    svg.appendChild(rightEyeSvgElement);
    rightEyeCtrl = createEyeController(rightEyeSvgElement, {
      size: options?.eyeSize,
    });

    // Create the eyes group controller
    // It's non-optional in LetterInstance, so always create one.
    // The createEyesGroupController can decide if it's "active" based on its children.
    const eyesController: EyesAttachment = createEyesGroupController(
      leftEyeCtrl,
      rightEyeCtrl,
    );

    // If EyesGroupController itself had a wrapping <g>, it would be appended here.
    // For now, it's assumed to be a logical grouping of the individual eye controllers.

    // ... Instantiate other attachment controllers similarly ...

    // 3. Append the complete SVG to the target container
    target.appendChild(svg);

    // 4. Create and return the LetterInstance object
    const instance: LetterInstance = {
      svgElement: svg,
      attachmentCoords: attachmentCoords, // Still useful for reference
      character: letter,
      parentElement: target,

      // Assign the created controller instances
      mouth: mouthController,
      eyes: eyesController,
      // ... assign other attachment controllers ...

      destroy: (): void => {
        svg.remove();
        // If attachment controllers have their own destroy methods for cleanup
        // (e.g., removing event listeners they set up), call them here:
        // mouthController.destroy?.();
        // eyesController.destroy?.(); // Or eyesController.left.destroy?.(); eyesController.right.destroy?.();
      },
    };

    return instance;
  } catch (error) {
    console.error(`Error rendering letter "${letter}":`, error);
    return null;
  }
}
