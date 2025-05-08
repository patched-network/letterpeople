// src/letters/i-lowercase.ts
import type {
  LetterOptions,
  InternalLetterRenderResult,
  AttachmentList,
} from "../types";
import type { Point } from "../util/geometry";

// Define constants for our coordinate space
const VIEWBOX_WIDTH = 40; // Narrower than most letters
const VIEWBOX_HEIGHT = 100;
const DEFAULT_STEM_THICKNESS = 16; // Thickness of vertical stem
const DEFAULT_DOT_DIAMETER = 26; // Oversized dot to fit facial features
const DEFAULT_OUTLINE_WIDTH = 2; // Default width for the border/stroke
const DOT_GAP = 10; // Gap between dot and stem

/**
 * @internal
 * Renders the base shape and calculates attachment points for the lowercase letter 'i'.
 * The dot is oversized to accommodate facial features (eyes, mouth).
 * This function does NOT add attachments; that happens in the main createLetter function.
 *
 * @param options - Configuration options for the letter's appearance.
 * @returns An object containing the base SVG element and attachment coordinates.
 */
function renderI_lowercase(
  options?: LetterOptions,
): InternalLetterRenderResult {
  // --- SVG Setup ---
  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("viewBox", `0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`);
  svg.setAttribute("class", "letter-base letter-i-lowercase");

  // --- Options Processing ---
  const stemThickness = options?.lineWidth ?? DEFAULT_STEM_THICKNESS;
  const dotDiameter = options?.lineWidth ? options.lineWidth * 1.6 : DEFAULT_DOT_DIAMETER;
  const fillColor = options?.color ?? "currentColor";
  const outlineColor = options?.borderColor ?? "black";
  const outlineWidth = options?.borderWidth ?? DEFAULT_OUTLINE_WIDTH;

  // --- Group for the letter parts ---
  const group = document.createElementNS(svgNS, "g");

  // --- Calculate positions ---
  const W = VIEWBOX_WIDTH;
  const H = VIEWBOX_HEIGHT;
  
  // Center the stem horizontally
  const stemCenterX = W / 2;
  const stemLeft = stemCenterX - stemThickness / 2;
  const stemRight = stemCenterX + stemThickness / 2;
  
  // Dot is centered over the stem
  const dotRadius = dotDiameter / 2;
  const dotCenterX = stemCenterX;
  const dotCenterY = dotRadius + outlineWidth;
  
  // Stem starts below the dot with a gap
  const stemTop = dotCenterY + dotRadius + DOT_GAP;
  
  // --- Create the dot (circle) ---
  const dot = document.createElementNS(svgNS, "circle");
  dot.setAttribute("cx", String(dotCenterX));
  dot.setAttribute("cy", String(dotCenterY));
  dot.setAttribute("r", String(dotRadius));
  dot.setAttribute("fill", fillColor);
  dot.setAttribute("stroke", outlineColor);
  dot.setAttribute("stroke-width", String(outlineWidth));
  
  // --- Create the stem (rectangle) ---
  const stem = document.createElementNS(svgNS, "rect");
  stem.setAttribute("x", String(stemLeft));
  stem.setAttribute("y", String(stemTop));
  stem.setAttribute("width", String(stemThickness));
  stem.setAttribute("height", String(H - stemTop));
  stem.setAttribute("fill", fillColor);
  stem.setAttribute("stroke", outlineColor);
  stem.setAttribute("stroke-width", String(outlineWidth));
  
  // Add elements to group
  group.appendChild(dot);
  group.appendChild(stem);
  
  // Add group to the SVG
  svg.appendChild(group);

  // --- Attachment Points Calculation ---
  // For the 'i', we'll put facial features on the dot
  const attachments: AttachmentList = {
    // Eyes in the upper part of the dot
    leftEye: { x: dotCenterX - dotRadius * 0.3, y: dotCenterY - dotRadius * 0.2 },
    rightEye: { x: dotCenterX + dotRadius * 0.3, y: dotCenterY - dotRadius * 0.2 },
    
    // Mouth in the lower part of the dot
    mouth: { x: dotCenterX, y: dotCenterY + dotRadius * 0.3 },
    
    // Hat sits on top of the dot
    hat: { x: dotCenterX, y: dotCenterY - dotRadius - outlineWidth / 2 },
    
    // Arms at the middle of the stem
    leftArm: { x: stemLeft - outlineWidth / 2, y: stemTop + (H - stemTop) * 0.4 },
    rightArm: { x: stemRight + outlineWidth / 2, y: stemTop + (H - stemTop) * 0.4 },
    
    // Legs at the bottom of the stem
    leftLeg: { x: stemCenterX - stemThickness * 0.3, y: H - outlineWidth / 2 },
    rightLeg: { x: stemCenterX + stemThickness * 0.3, y: H - outlineWidth / 2 },
  };

  // Return the result conforming to InternalLetterRenderResult
  return {
    svg: svg,
    attachments: attachments,
  };
}

// Export the function
export default renderI_lowercase;