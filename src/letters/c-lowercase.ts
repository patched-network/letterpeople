// letterpeople/src/letters/c-lowercase.ts
import type {
  LetterOptions,
  InternalLetterRenderResult,
  AttachmentList,
} from "../types";
import {
  VIEWBOX_HEIGHT as GLOBAL_VIEWBOX_HEIGHT,
  EFFECTIVE_LOWERCASE_HEIGHT,
} from "./CONSTS";

// Define constants for our coordinate space
const VIEWBOX_WIDTH = 70; // Narrower for lowercase
const VIEWBOX_HEIGHT = GLOBAL_VIEWBOX_HEIGHT; // Consistent height
const DEFAULT_LIMB_THICKNESS = 16; // Thinner for lowercase
const DEFAULT_OUTLINE_WIDTH = 2;
const DEFAULT_OPENING_ANGLE_DEG = 40; // Same opening as uppercase C

// Factor for positioning within the viewBox (consistent with other lowercase letters)
const O_BOTTOM_PADDING_FACTOR = 0.05;

/**
 * @internal
 * Renders the base shape and calculates attachment points for the lowercase letter 'c'.
 *
 * @param options - Configuration options for the letter's appearance.
 * @returns An object containing the base SVG element and attachment coordinates.
 */
function renderC_lowercase(
  options?: LetterOptions,
): InternalLetterRenderResult {
  // --- SVG Setup ---
  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("viewBox", `0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`);
  svg.setAttribute("class", "letter-base letter-c-lowercase");

  // --- Options Processing ---
  const limbThickness = options?.lineWidth ?? DEFAULT_LIMB_THICKNESS;
  const fillColor = options?.color ?? "currentColor";
  const outlineColor = options?.borderColor ?? "black";
  const outlineWidth = options?.borderWidth ?? DEFAULT_OUTLINE_WIDTH;
  const openingAngleDeg = DEFAULT_OPENING_ANGLE_DEG;

  // --- Calculate lowercase 'c' body dimensions and position ---
  const char_width = VIEWBOX_WIDTH;
  const char_height = EFFECTIVE_LOWERCASE_HEIGHT;

  const y_baseline =
    GLOBAL_VIEWBOX_HEIGHT -
    GLOBAL_VIEWBOX_HEIGHT * O_BOTTOM_PADDING_FACTOR -
    outlineWidth / 2;
  const y_top_char = y_baseline - char_height;

  const cx_char = char_width / 2;
  const cy_char = y_top_char + char_height / 2;

  // --- Path Definition ---
  const pathEl = document.createElementNS(svgNS, "path");

  // Radii for the character's body
  const outerRx_char = (char_width - outlineWidth) / 2;
  const outerRy_char = (char_height - outlineWidth) / 2;

  const minInnerRadius = 1;
  let innerRx_char = outerRx_char - limbThickness;
  let innerRy_char = outerRy_char - limbThickness;

  innerRx_char = Math.max(minInnerRadius, innerRx_char);
  innerRy_char = Math.max(minInnerRadius, innerRy_char);

  // Calculate angles for the opening points
  const angleTopOpenRad = (-openingAngleDeg * Math.PI) / 180;
  const angleBottomOpenRad = (openingAngleDeg * Math.PI) / 180;

  // Calculate key points for the path based on character dimensions
  const pOuterTopOpen_char = {
    x: cx_char + outerRx_char * Math.cos(angleTopOpenRad),
    y: cy_char + outerRy_char * Math.sin(angleTopOpenRad),
  };
  const pOuterBottomOpen_char = {
    x: cx_char + outerRx_char * Math.cos(angleBottomOpenRad),
    y: cy_char + outerRy_char * Math.sin(angleBottomOpenRad),
  };
  const pInnerTopOpen_char = {
    x: cx_char + innerRx_char * Math.cos(angleTopOpenRad),
    y: cy_char + innerRy_char * Math.sin(angleTopOpenRad),
  };
  const pInnerBottomOpen_char = {
    x: cx_char + innerRx_char * Math.cos(angleBottomOpenRad),
    y: cy_char + innerRy_char * Math.sin(angleBottomOpenRad),
  };

  const d = [
    `M ${pOuterTopOpen_char.x.toFixed(3)} ${pOuterTopOpen_char.y.toFixed(3)}`,
    `A ${outerRx_char.toFixed(3)} ${outerRy_char.toFixed(3)} 0 1 0 ${pOuterBottomOpen_char.x.toFixed(3)} ${pOuterBottomOpen_char.y.toFixed(3)}`,
    `L ${pInnerBottomOpen_char.x.toFixed(3)} ${pInnerBottomOpen_char.y.toFixed(3)}`,
    `A ${innerRx_char.toFixed(3)} ${innerRy_char.toFixed(3)} 0 1 1 ${pInnerTopOpen_char.x.toFixed(3)} ${pInnerTopOpen_char.y.toFixed(3)}`,
    `Z`,
  ].join(" ");

  pathEl.setAttribute("d", d);
  pathEl.setAttribute("fill", fillColor);
  pathEl.setAttribute("stroke", outlineColor);
  pathEl.setAttribute("stroke-width", String(outlineWidth));
  pathEl.setAttribute("stroke-linejoin", "round"); // Softer corners for lowercase

  svg.appendChild(pathEl);

  // --- Attachment Points Calculation ---
  const attachments: AttachmentList = {
    leftEye: {
      x: cx_char - innerRx_char * 0.6,
      y: cy_char - (innerRy_char + outerRy_char) / 2,
    },
    rightEye: {
      x: cx_char + innerRx_char * 0.5,
      y: cy_char - (innerRy_char + outerRy_char) / 2,
    },
    mouth: {
      x: cx_char - innerRx_char * 0.1,
      y: cy_char + (innerRy_char + outerRy_char) / 2,
    },

    hat: { x: cx_char, y: y_top_char - outlineWidth / 2 },

    leftArm: {
      x: cx_char - outerRx_char - outlineWidth / 2,
      y: cy_char,
    },
    rightArm: {
      x: (pOuterTopOpen_char.x + pInnerTopOpen_char.x) / 2,
      y: (pOuterTopOpen_char.y + pInnerTopOpen_char.y) / 2,
    },

    leftLeg: {
      x: cx_char - outerRx_char * 0.5,
      y: y_baseline + outlineWidth / 2,
    },
    rightLeg: {
      x: (pOuterBottomOpen_char.x + pInnerBottomOpen_char.x) / 2,
      y: (pOuterBottomOpen_char.y + pInnerBottomOpen_char.y) / 2,
    },
  };

  return {
    svg: svg,
    attachments: attachments,
  };
}

export default renderC_lowercase;
