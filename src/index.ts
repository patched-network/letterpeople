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
  ArmsAttachment,
  // AttachmentAnimationOptions, // Not used directly in this file yet
  // attachmentTypes // Not used directly in this file yet
} from "./attachments/types";
import type { ArmAttachment } from "./attachments/arms";

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
import a from "./letters/a-lowercase";
import b from "./letters/b-lowercase";
import c from "./letters/c-lowercase";
import C from "./letters/C-uppercase";
import d from "./letters/d-lowercase";
import D from "./letters/D-uppercase";
import E from "./letters/E-uppercase";
import F from "./letters/F-uppercase";
import G from "./letters/G-uppercase";
import H from "./letters/H-uppercase";
import h from "./letters/h-lowercase";
import i from "./letters/i-lowercase";
import I from "./letters/I-uppercase";
import j from "./letters/j-lowercase";
import J from "./letters/J-uppercase";
import L from "./letters/L-uppercase";
import l from "./letters/l-lowercase";
import M from "./letters/M-uppercase";
import m from "./letters/m-lowercase";
import N from "./letters/N-uppercase";
import n from "./letters/n-lowercase";
import o from "./letters/o-lowercase";
import O from "./letters/O-uppercase";
import p from "./letters/p-lowercase";
import P from "./letters/P-uppercase";
import q from "./letters/q-lowercase";
import Q from "./letters/Q-uppercase";
import r from "./letters/r-lowercase";
import R from "./letters/R-uppercase";
import S from "./letters/S-uppercase";
import T from "./letters/T-uppercase";
import U from "./letters/U-uppercase";
import u from "./letters/u-lowercase";
import V from "./letters/V-uppercase";
import v from "./letters/v-lowercase";
import W from "./letters/W-uppercase";
import w from "./letters/w-lowercase";
import X from "./letters/X-uppercase";
import x from "./letters/x-lowercase";
import Y from "./letters/Y-uppercase";

// Import constants for descender calculation
import { VIEWBOX_HEIGHT, EFFECTIVE_LOWERCASE_HEIGHT } from "./letters/CONSTS";

// Map letters to their rendering functions
const letterRenderers: {
  [key: string]: (options?: LetterOptions) => InternalLetterRenderResult;
} = {
  A: A,
  a: a,
  b: b,
  c: c,
  C: C,
  d: d,
  D: D,
  E: E,
  F: F,
  G: G,
  h: h,
  i: i,
  I: I,
  j: j,
  J: J,
  H: H,
  L: L,
  l: l,
  M: M,
  m: m,
  N: N,
  n: n,
  o: o,
  O: O,
  p: p,
  P: P,
  q: q,
  Q: Q,
  r: r,
  R: R,
  S: S,
  T: T,
  U: U,
  u: u,
  V: V,
  v: v,
  W: W,
  w: w,
  X: X,
  x: x,
  Y: Y,
};

// Default parameters for the mouth if not provided
const DEFAULT_MOUTH_PARAMS: MouthParameters = {
  openness: 0.2,
  mood: 0.7,
};

// Define which lowercase letters are descenders
const DESCENDER_LETTERS = new Set(["g", "j", "p", "q", "y"]);

// Constants for viewBox calculations
const DESCENDER_DEPTH = VIEWBOX_HEIGHT - EFFECTIVE_LOWERCASE_HEIGHT; // Should be 35
const EXTENDED_VIEWBOX_HEIGHT = VIEWBOX_HEIGHT + DESCENDER_DEPTH; // Should be 135
const SVG_NS = "http://www.w3.org/2000/svg";

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
    const originalSvg = internalResult.svg;
    const attachmentCoords = internalResult.attachments;

    // 2. Extract the width from the original SVG's viewBox
    const originalViewBox = originalSvg.getAttribute("viewBox");
    if (!originalViewBox) {
      throw new Error(`Letter "${letter}" SVG has no viewBox attribute.`);
    }

    const viewBoxParts = originalViewBox.split(" ");
    const originalWidth = parseFloat(viewBoxParts[2]);

    // 3. Create a new SVG element with extended height for consistent vertical space
    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute(
      "viewBox",
      `0 0 ${originalWidth} ${EXTENDED_VIEWBOX_HEIGHT}`,
    );
    svg.setAttribute(
      "class",
      originalSvg.getAttribute("class") || "letter-base",
    );

    // 4. Create a content group for all letter parts and attachments
    const contentGroup = document.createElementNS(SVG_NS, "g");

    // 5. For descender letters, apply a transform to shift the content down
    const isDescender = DESCENDER_LETTERS.has(letter);
    if (isDescender) {
      contentGroup.setAttribute(
        "transform",
        `translate(0, ${DESCENDER_DEPTH})`,
      );
    }

    // 6. Move all original SVG content to the content group
    while (originalSvg.firstChild) {
      contentGroup.appendChild(originalSvg.firstChild);
    }

    // 7. Add the content group to the new SVG
    svg.appendChild(contentGroup);

    // 7b. Add the debug visualization of the descender baseline if requested
    if (options?.debug) {
      const baselineLine = document.createElementNS(SVG_NS, "line");
      baselineLine.setAttribute("x1", "0");
      baselineLine.setAttribute("y1", String(VIEWBOX_HEIGHT));
      baselineLine.setAttribute("x2", String(originalWidth));
      baselineLine.setAttribute("y2", String(VIEWBOX_HEIGHT));
      baselineLine.setAttribute("stroke", "red");
      baselineLine.setAttribute("stroke-width", "1");
      baselineLine.setAttribute("stroke-dasharray", "4");

      // Create a debug group to hold these elements
      const debugGroup = document.createElementNS(SVG_NS, "g");
      debugGroup.setAttribute("class", "letter-debug");
      debugGroup.appendChild(baselineLine);

      svg.appendChild(debugGroup);
    }

    // 8. Create Attachment SVG Elements AND their Controllers
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
    contentGroup.appendChild(mouthSvgElement); // Add the mouth's SVG to the content group

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
    contentGroup.appendChild(leftEyeSvgElement);
    leftEyeCtrl = createEyeController(leftEyeSvgElement, {
      size: options?.eyeSize,
    }, attachmentCoords.leftEye);

    let rightEyeCtrl: EyeAttachment;

    const rightEyeSvgElement = createEye(
      attachmentCoords.rightEye.x,
      attachmentCoords.rightEye.y,
      { size: options?.eyeSize },
    );
    contentGroup.appendChild(rightEyeSvgElement);
    rightEyeCtrl = createEyeController(rightEyeSvgElement, {
      size: options?.eyeSize,
    }, attachmentCoords.rightEye);

    // Create the eyes group controller
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
    contentGroup.appendChild(leftArmSvgElement);
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
    contentGroup.appendChild(rightArmSvgElement);
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

    // 9. Append the complete SVG to the target container
    target.appendChild(svg);

    // 10. Create and return the LetterInstance object
    const instance: LetterInstance = {
      svgElement: svg,
      attachmentCoords: attachmentCoords, // Still useful for reference
      character: letter,
      parentElement: target,

      // Assign the created controller instances
      mouth: mouthController,
      eyes: eyesController,
      arms: armsController,

      destroy: (): void => {
        svg.remove();
        // If attachment controllers have their own destroy methods for cleanup
        // (e.g., removing event listeners they set up), call them here:
        // mouthController.destroy?.();
        // eyesController.destroy?.();
      },
    };

    return instance;
  } catch (error) {
    console.error(`Error rendering letter "${letter}":`, error);
    return null;
  }
}
