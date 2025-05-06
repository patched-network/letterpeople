import type {
  LetterInstance,
  AttachmentElements,
  Point,
  AnimationOptions,
  LetterOptions,
  InternalLetterRenderResult,
  MouthParameters,
} from "./types";
// import { animate } from "animejs";

// Import letter implementations
import L from "./letters/L-uppercase";

// Import attachment creators
import { createEye } from "./attachments/eye";
// Import the new morphing mouth creator
import { createMorphingMouth } from "./attachments/mouth";

// Map letters to their rendering functions
const letterRenderers: {
  [key: string]: (options?: LetterOptions) => InternalLetterRenderResult;
} = {
  L: L,
};

// Default parameters for the mouth if not provided
const DEFAULT_MOUTH_PARAMS: MouthParameters = {
  openness: 0.1, // Start slightly open
  mood: 0.7, // Start slightly smiling
};

export function createLetter(
  letter: string,
  target: Element,
  options?: LetterOptions,
): LetterInstance | null {
  const renderer = letterRenderers[letter.toUpperCase()]; // Use uppercase lookup
  if (!renderer) {
    console.warn(`Renderer for letter "${letter}" not found.`);
    return null;
  }

  try {
    // 1. Get base SVG and attachment coordinates
    const internalResult: InternalLetterRenderResult = renderer(options);
    const svg = internalResult.svg;
    const attachmentCoords = internalResult.attachments;

    // 2. Create and append attachments
    const attachmentElements: AttachmentElements = {};

    // Eyes (as before)
    if (attachmentCoords.leftEye) {
      const eyeOptions = { size: options?.eyeSize };
      const leftEyeEl = createEye(
        attachmentCoords.leftEye.x,
        attachmentCoords.leftEye.y,
        eyeOptions,
      );
      svg.appendChild(leftEyeEl);
      attachmentElements.leftEye = leftEyeEl;
    }
    if (attachmentCoords.rightEye) {
      const eyeOptions = { size: options?.eyeSize };
      const rightEyeEl = createEye(
        attachmentCoords.rightEye.x,
        attachmentCoords.rightEye.y,
        eyeOptions,
      );
      svg.appendChild(rightEyeEl);
      attachmentElements.rightEye = rightEyeEl;
    }

    // Morphing Mouth
    if (attachmentCoords.mouth) {
      // Merge provided params with defaults
      const currentMouthParams: MouthParameters = {
        ...DEFAULT_MOUTH_PARAMS,
        ...(options?.mouthParams || {}),
      };

      const mouthEl = createMorphingMouth(
        attachmentCoords.mouth.x,
        attachmentCoords.mouth.y,
        currentMouthParams, // Pass the initial parameters
        options?.mouthAppearance, // Pass appearance options
      );
      svg.appendChild(mouthEl);
      attachmentElements.mouth = mouthEl;
    }
    // ... create/append other attachments ...

    // 3. Append the complete SVG to the target container
    target.appendChild(svg);

    // 4. Create and return the LetterInstance object
    const instance: LetterInstance & { _currentMouthParams: any } = {
      svgElement: svg,
      attachmentCoords: attachmentCoords,
      attachmentElements: attachmentElements,
      character: letter,
      parentElement: target,

      // Store current mouth params internally for updateMouth
      _currentMouthParams: {
        ...DEFAULT_MOUTH_PARAMS,
        ...(options?.mouthParams || {}),
      },

      animateMouth: async (animOptions?: AnimationOptions): Promise<void> => {
        const mouthElement =
          instance.attachmentElements.mouth?.querySelector("path"); // Target the path inside the group
        if (!mouthElement) return;

        const duration = animOptions?.duration ?? 300;

        // TODO: Refine animation - this basic scale is less effective now.
        // A better approach would be to animate the 'openness' parameter
        // using anime's ability to call a function on update, then redraw the path.
        // Or, directly animate the 'd' attribute if the structure is consistent.
        // For now, keep the simple scale as a placeholder.
        // await animate({
        //   targets: instance.attachmentElements.mouth, // Target the group for transform
        //   scaleY: [
        //     { value: 1.4, duration: duration * 0.4, easing: "easeOutQuad" },
        //     { value: 1.0, duration: duration * 0.6, easing: "easeInQuad" },
        //   ],
        //   // transformOrigin is set in createMorphingMouth
        // }).finished;
      },

      updateMouth: (newParams: Partial<MouthParameters>): void => {
        const mouthGroup = instance.attachmentElements.mouth;
        const mouthCoord = instance.attachmentCoords.mouth;
        if (!mouthGroup || !mouthCoord) return;

        // Update internal state
        instance._currentMouthParams = {
          ...instance._currentMouthParams,
          ...newParams,
        };

        // Re-create the mouth element with new parameters
        // Note: This replaces the existing mouth element entirely.
        // More efficient might be to update the 'd' attribute of the existing path,
        // but that requires recalculating 'd' here. Re-creating is simpler for now.
        const newMouthEl = createMorphingMouth(
          mouthCoord.x,
          mouthCoord.y,
          instance._currentMouthParams,
          options?.mouthAppearance, // Reuse original appearance options
        );

        // Replace the old mouth group with the new one
        mouthGroup.replaceWith(newMouthEl);
        // Update the reference in the instance
        instance.attachmentElements.mouth = newMouthEl;
      },

      destroy: (): void => {
        instance.svgElement.remove();
        // Clean up internal state if needed
      },
    };

    // Add internal state property dynamically (or define it properly in the interface/class)
    (instance as any)._currentMouthParams = {
      ...DEFAULT_MOUTH_PARAMS,
      ...(options?.mouthParams || {}),
    };

    return instance;
  } catch (error) {
    console.error(`Error rendering letter "${letter}":`, error);
    return null;
  }
}
