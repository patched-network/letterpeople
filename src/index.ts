// letterpeople/src/index.ts
import type {
  LetterInstance,
  AttachmentElements,
  Point,
  AnimationOptions,
  LetterOptions,
  InternalLetterRenderResult,
} from "./types";
import { animate } from "animejs";

// Import letter implementations
import L from "./letters/L-uppercase";

// Map letters to their rendering functions
// Use uppercase for consistency internally
const letterRenderers: {
  [key: string]: (options?: LetterOptions) => InternalLetterRenderResult;
} = {
  // 'A': A,
  L: L,
  // 'a': a, // Example if lowercase is distinct
};

import { createEye } from "./attachments/eye";
// import { createMouth } from './attachments/mouth'; // Assuming this exists

export function createLetter(
  letter: string,
  target: Element,
  options?: LetterOptions,
): LetterInstance | null {
  // ... (lookup renderer as before) ...
  const renderer = letterRenderers[letter];
  if (!renderer) {
    /* ... handle not found ... */ return null;
  }

  try {
    // 1. Get base SVG and attachment coordinates from the specific letter renderer
    const internalResult: InternalLetterRenderResult = renderer(options);
    const svg = internalResult.svg;
    const attachmentCoords = internalResult.attachments;

    // 2. Create and append default attachments (eyes, mouth)
    const attachmentElements: AttachmentElements = {};

    if (attachmentCoords.leftEye) {
      // Pass relevant options if LetterOptions includes them, e.g., options?.eyeOptions
      const eyeOptions = { size: options?.eyeSize /*, ... other options */ };
      const leftEyeEl = createEye(
        attachmentCoords.leftEye.x,
        attachmentCoords.leftEye.y,
        eyeOptions,
      );
      svg.appendChild(leftEyeEl);
      attachmentElements.leftEye = leftEyeEl;
    }
    if (attachmentCoords.rightEye) {
      const eyeOptions = { size: options?.eyeSize /*, ... */ };
      const rightEyeEl = createEye(
        attachmentCoords.rightEye.x,
        attachmentCoords.rightEye.y,
        eyeOptions,
      );
      svg.appendChild(rightEyeEl);
      attachmentElements.rightEye = rightEyeEl;
    }
    if (attachmentCoords.mouth) {
      // const mouthOptions = { ... };
      // const mouthEl = createMouth(attachmentCoords.mouth.x, attachmentCoords.mouth.y, mouthOptions);
      // svg.appendChild(mouthEl);
      // attachmentElements.mouth = mouthEl;
      // Placeholder: Add a simple circle for the mouth for now
      const mouthEl = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "g",
      );
      const mouthCircle = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle",
      );
      mouthCircle.setAttribute("cx", String(attachmentCoords.mouth.x));
      mouthCircle.setAttribute("cy", String(attachmentCoords.mouth.y));
      mouthCircle.setAttribute("r", "4"); // Example size
      mouthCircle.setAttribute("fill", "black");
      mouthEl.appendChild(mouthCircle);
      mouthEl.setAttribute("class", "letter-attachment letter-mouth");
      svg.appendChild(mouthEl);
      attachmentElements.mouth = mouthEl;
    }
    // ... create/append other default attachments ...

    // 3. Append the complete SVG to the target container
    target.appendChild(svg);

    // 4. Create and return the LetterInstance object
    const instance: LetterInstance = {
      svgElement: svg,
      attachmentCoords: attachmentCoords,
      attachmentElements: attachmentElements,
      character: letter,
      parentElement: target,

      animateMouth: async (animOptions?: AnimationOptions): Promise<void> => {
        const mouthElement = instance.attachmentElements.mouth;
        if (!mouthElement) return; // No mouth to animate

        const duration = animOptions?.duration ?? 300; // Default duration

        // Example animation: scale mouth vertically (simple open/close)
        // Ensure animejs types are installed: yarn add -D @types/animejs
        await animate({
          targets: mouthElement,
          scaleY: [
            { value: 1.4, duration: duration * 0.4, easing: "easeOutQuad" }, // Open
            { value: 1.0, duration: duration * 0.6, easing: "easeInQuad" }, // Close
          ],
          // transformOrigin: '50% 50%', // Ensure scaling is centered if needed
          // Add more complex path morphing or transforms later
        }).finished; // Return the promise from animejs
      },

      destroy: (): void => {
        instance.svgElement.remove();
        // Potentially clean up event listeners or other resources if added later
      },
    };

    return instance;
  } catch (error) {
    console.error(`Error rendering letter "${letter}":`, error);
    return null;
  }
}
