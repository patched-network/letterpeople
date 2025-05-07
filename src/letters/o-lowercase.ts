// letterpeople/src/letters/o-lowercase.ts
import type {
  LetterOptions,
  InternalLetterRenderResult,
  // Point, // Not directly used beyond types
  AttachmentList,
} from "../types";

// Define constants for our coordinate space
const VIEWBOX_WIDTH = 70; // Narrower than uppercase 'O', similar to 'c'
const VIEWBOX_HEIGHT = 100; // Standard height
const DEFAULT_LIMB_THICKNESS = 18; // Slightly thinner for lowercase
const DEFAULT_OUTLINE_WIDTH = 2;

// Constants for lowercase 'o' proportions and positioning
const O_EFFECTIVE_HEIGHT_FACTOR = 0.65; // 'o' body is 65% of the viewBox height (x-height)
const O_BOTTOM_PADDING_FACTOR = 0.05; // Small padding from the absolute bottom of the viewBox

/**
 * @internal
 * Renders the base shape and calculates attachment points for the lowercase letter 'o'.
 * Uses two elliptical paths, positioned and scaled for a lowercase appearance.
 *
 * @param options - Configuration options for the letter's appearance.
 * @returns An object containing the base SVG element and attachment coordinates.
 */
function renderO_lowercase(
  options?: LetterOptions,
): InternalLetterRenderResult {
  // --- SVG Setup ---
  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("viewBox", `0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`);
  svg.setAttribute("class", "letter-base letter-o-lowercase");

  // --- Options Processing ---
  const limbThickness = options?.lineWidth ?? DEFAULT_LIMB_THICKNESS;
  const fillColor = options?.color ?? "currentColor";
  const outlineColor = options?.borderColor ?? "black";
  const outlineWidth = options?.borderWidth ?? DEFAULT_OUTLINE_WIDTH;

  // --- Calculate 'o' body dimensions and position ---
  const W = VIEWBOX_WIDTH;
  const H = VIEWBOX_HEIGHT;

  const o_effective_height = H * O_EFFECTIVE_HEIGHT_FACTOR;
  // For a typically round lowercase 'o', effective width can be similar to effective height,
  // or slightly wider. Let's make it slightly wider than it is tall, relative to its own height.
  // Or, for simplicity, let its width be constrained by the new VIEWBOX_WIDTH.
  const o_effective_width = W - outlineWidth * 2; // Max width within viewBox, accounting for stroke

  const o_bottom_y = H - H * O_BOTTOM_PADDING_FACTOR - outlineWidth / 2;
  const o_top_y = o_bottom_y - o_effective_height;

  const cx = W / 2;
  const cy = o_top_y + o_effective_height / 2;

  // Outer ellipse radii
  // Ensure radii are positive
  const outerRx = Math.max(1, o_effective_width / 2);
  const outerRy = Math.max(1, o_effective_height / 2);

  // Inner ellipse radii (for the hole)
  const minInnerRadius = 1;
  let innerRx = outerRx - limbThickness;
  let innerRy = outerRy - limbThickness;

  innerRx = Math.max(minInnerRadius, innerRx);
  innerRy = Math.max(minInnerRadius, innerRy);

  // --- Path Definition ---
  const path = document.createElementNS(svgNS, "path");
  const d = [
    // Outer ellipse (clockwise)
    `M ${cx.toFixed(3)} ${(cy - outerRy).toFixed(3)}`,
    `A ${outerRx.toFixed(3)} ${outerRy.toFixed(3)} 0 1 1 ${cx.toFixed(3)} ${(cy + outerRy).toFixed(3)}`,
    `A ${outerRx.toFixed(3)} ${outerRy.toFixed(3)} 0 1 1 ${cx.toFixed(3)} ${(cy - outerRy).toFixed(3)}`,
    `Z`,
    // Inner ellipse (counter-clockwise)
    `M ${cx.toFixed(3)} ${(cy - innerRy).toFixed(3)}`,
    `A ${innerRx.toFixed(3)} ${innerRy.toFixed(3)} 0 1 0 ${cx.toFixed(3)} ${(cy + innerRy).toFixed(3)}`,
    `A ${innerRx.toFixed(3)} ${innerRy.toFixed(3)} 0 1 0 ${cx.toFixed(3)} ${(cy - innerRy).toFixed(3)}`,
    `Z`,
  ].join(" ");

  path.setAttribute("d", d);
  path.setAttribute("fill", fillColor);
  path.setAttribute("stroke", outlineColor);
  path.setAttribute("stroke-width", String(outlineWidth));
  path.setAttribute("stroke-linejoin", "round");

  svg.appendChild(path);

  // --- Attachment Points Calculation ---
  // Adjust facial features for the smaller 'o' and its limb thickness
  // Eyes on the upper part of the ring, mouth on the lower part.
  const eyeY = cy - 1.6 * innerRy;
  const mouthY = cy + 1.75 * innerRy;

  const attachments: AttachmentList = {
    leftEye: { x: cx - innerRx * 0.75, y: eyeY },
    rightEye: { x: cx + innerRx * 0.75, y: eyeY },
    mouth: { x: cx, y: mouthY },

    // Hat sits on top of the 'o's effective shape
    hat: { x: cx, y: o_top_y - outlineWidth / 2 },

    // Arms on the sides of the 'o' body
    leftArm: { x: cx - outerRx - outlineWidth / 2, y: cy },
    rightArm: { x: cx + outerRx + outlineWidth / 2, y: cy },

    // Legs at the bottom of the 'o' body
    leftLeg: { x: cx - outerRx * 0.5, y: o_bottom_y + outlineWidth / 2 },
    rightLeg: { x: cx + outerRx * 0.5, y: o_bottom_y + outlineWidth / 2 },
  };

  return {
    svg: svg,
    attachments: attachments,
  };
}

export default renderO_lowercase;
