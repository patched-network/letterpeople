// src/letters/H-uppercase.ts
import type {
  LetterOptions,
  InternalLetterRenderResult,
  Point,
  AttachmentList,
} from "../types";

// Define constants for our coordinate space
const VIEWBOX_WIDTH = 80;
const VIEWBOX_HEIGHT = 100;
const DEFAULT_LIMB_THICKNESS = 20; // How thick the vertical and horizontal parts are
const DEFAULT_OUTLINE_WIDTH = 2; // Default width for the border/stroke

/**
 * @internal
 * Renders the base shape and calculates attachment points for the uppercase letter 'H'.
 * This function does NOT add attachments like eyes/mouth; that happens in the main createLetter function.
 *
 * @param options - Configuration options for the letter's appearance.
 * @returns An object containing the base SVG element and attachment coordinates.
 */
function renderH_uppercase(
  options?: LetterOptions,
): InternalLetterRenderResult {
  // --- SVG Setup ---
  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("viewBox", `0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`);
  svg.setAttribute("class", "letter-base letter-H-uppercase");

  // --- Options Processing ---
  const limbThickness = options?.lineWidth ?? DEFAULT_LIMB_THICKNESS;
  const fillColor = options?.color ?? "currentColor";
  const outlineColor = options?.borderColor ?? "black";
  const outlineWidth = options?.borderWidth ?? DEFAULT_OUTLINE_WIDTH;

  // --- Group for the letter parts ---
  const group = document.createElementNS(svgNS, "g");
  
  // --- Calculate positions ---
  const W = VIEWBOX_WIDTH;
  const H = VIEWBOX_HEIGHT;
  const T = limbThickness;
  
  // Left vertical bar
  const leftBar = document.createElementNS(svgNS, "rect");
  leftBar.setAttribute("x", "0");
  leftBar.setAttribute("y", "0");
  leftBar.setAttribute("width", String(T));
  leftBar.setAttribute("height", String(H));
  leftBar.setAttribute("fill", fillColor);
  leftBar.setAttribute("stroke", outlineColor);
  leftBar.setAttribute("stroke-width", String(outlineWidth));
  
  // Right vertical bar
  const rightBar = document.createElementNS(svgNS, "rect");
  rightBar.setAttribute("x", String(W - T));
  rightBar.setAttribute("y", "0");
  rightBar.setAttribute("width", String(T));
  rightBar.setAttribute("height", String(H));
  rightBar.setAttribute("fill", fillColor);
  rightBar.setAttribute("stroke", outlineColor);
  rightBar.setAttribute("stroke-width", String(outlineWidth));
  
  // Horizontal crossbar, positioned at the middle
  const crossBar = document.createElementNS(svgNS, "rect");
  crossBar.setAttribute("x", "0");
  crossBar.setAttribute("y", String((H - T) / 2));
  crossBar.setAttribute("width", String(W));
  crossBar.setAttribute("height", String(T));
  crossBar.setAttribute("fill", fillColor);
  crossBar.setAttribute("stroke", outlineColor);
  crossBar.setAttribute("stroke-width", String(outlineWidth));
  
  // Add elements to group
  group.appendChild(leftBar);
  group.appendChild(rightBar);
  group.appendChild(crossBar);
  
  // Add group to the SVG
  svg.appendChild(group);

  // --- Attachment Points Calculation ---
  // Center point (where facial features will go)
  const centerX = W / 2;
  const centerY = H / 2;
  
  const attachments: AttachmentList = {
    // Eyes and mouth in the center of the crossbar
    leftEye: { x: centerX - T * 0.5, y: centerY - T * 0.2 },
    rightEye: { x: centerX + T * 0.5, y: centerY - T * 0.2 },
    mouth: { x: centerX, y: centerY + T * 0.3 },
    
    // Hat sits centered on top of the crossbar
    hat: { x: centerX, y: outlineWidth / 2 },
    
    // Arms at the outer ends of the horizontal bars
    leftArm: { x: outlineWidth / 2, y: (H - T) / 2 + T / 2 }, // Left side, middle of crossbar
    rightArm: { x: W - outlineWidth / 2, y: (H - T) / 2 + T / 2 }, // Right side, middle of crossbar
    
    // Legs at the bottom of the vertical bars
    leftLeg: { x: T / 2, y: H - outlineWidth / 2 }, // Bottom of left bar
    rightLeg: { x: W - T / 2, y: H - outlineWidth / 2 }, // Bottom of right bar
  };

  // Return the result
  return {
    svg: svg,
    attachments: attachments,
  };
}

// Export the function
export default renderH_uppercase;