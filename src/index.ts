import type {
  LetterInstance,
  // No longer need AttachmentElements from here
  // AnimationOptions, // Keep for future high-level methods
  LetterOptions,
  InternalLetterRenderResult,
  MouthParameters,
  MouthAppearanceOptions,
} from "./types";
import type { Point } from "./util/geometry";

// Import the new attachment controller INTERFACES
import type {
  MouthAttachment,
  EyesAttachment,
  EyeAttachment,
  ArmAttachment,
  ArmsAttachment,
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
import {
  createArm,
  createArmController,
  createArmsGroupController,
} from "./attachments/arms";

// Import letter implementations
import A from "./letters/A-uppercase";
import c from "./letters/c-lowercase";
import C from "./letters/C-uppercase";
import E from "./letters/E-uppercase";
import F from "./letters/F-uppercase";
import G from "./letters/G-uppercase";
import H from "./letters/H-uppercase";
import i from "./letters/i-lowercase";
import I from "./letters/I-uppercase";
import L from "./letters/L-uppercase";
import l from "./letters/l-lowercase";
import O from "./letters/O-uppercase";
import D from "./letters/D-uppercase";
import M from "./letters/M-uppercase";
import N from "./letters/N-uppercase";
import P from "./letters/P-uppercase";
import W from "./letters/W-uppercase";
import X from "./letters/X-uppercase";
import Y from "./letters/Y-uppercase";
import o from "./letters/o-lowercase";
import Q from "./letters/Q-uppercase";
import R from "./letters/R-uppercase";
import S from "./letters/S-uppercase";
import T from "./letters/T-uppercase";
import V from "./letters/V-uppercase";
import v from "./letters/v-lowercase";
import w from "./letters/w-lowercase";
import x from "./letters/x-lowercase";

// Map letters to their rendering functions
const letterRenderers: {
  [key: string]: (options?: LetterOptions) => InternalLetterRenderResult;
} = {
  A: A,
  c: c,
  C: C,
  E: E,
  F: F,
  G: G,
  i: i,
  I: I,
  H: H,
  D: D,
  L: L,
  M: M,
  N: N,
  P: P,
  W: W,
  X: X,
  Y: Y,
  l: l,
  O: O,
  o: o,
  Q: Q,
  R: R,
  S: S,
  T: T,
  V: V,
  v: v,
  w: w,
  x: x,
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

    // Create arm controllers
    let leftArmCtrl: ArmAttachment;
    const leftArmSvgElement = createArm({
      x: attachmentCoords.leftArm.x,
      y: attachmentCoords.leftArm.y,
      length: options?.armLength || 15,
      thickness: options?.armThickness || 3,
      fillColor: options?.armColor || options?.color || "black",
      angle: 150, // Default angle pointing outward left
    });
    svg.appendChild(leftArmSvgElement);
    leftArmCtrl = createArmController(leftArmSvgElement, {
      x: attachmentCoords.leftArm.x,
      y: attachmentCoords.leftArm.y,
      length: options?.armLength || 15,
      thickness: options?.armThickness || 3,
      fillColor: options?.armColor || options?.color || "black",
      angle: 150,
    });

    let rightArmCtrl: ArmAttachment;
    const rightArmSvgElement = createArm({
      x: attachmentCoords.rightArm.x,
      y: attachmentCoords.rightArm.y,
      length: options?.armLength || 15,
      thickness: options?.armThickness || 3,
      fillColor: options?.armColor || options?.color || "black",
      angle: 30, // Default angle pointing outward right
    });
    svg.appendChild(rightArmSvgElement);
    rightArmCtrl = createArmController(rightArmSvgElement, {
      x: attachmentCoords.rightArm.x,
      y: attachmentCoords.rightArm.y,
      length: options?.armLength || 15,
      thickness: options?.armThickness || 3,
      fillColor: options?.armColor || options?.color || "black",
      angle: 30,
    });

    // Create arms group controller
    const armsController: ArmsAttachment = createArmsGroupController(
      leftArmCtrl,
      rightArmCtrl,
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
      arms: armsController,
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
