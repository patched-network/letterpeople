// letterpeople/src/letters/L.ts
import { LetterOptions, LetterRender } from "../types";

// Define constants for our coordinate space
const VIEWBOX_WIDTH = 100;
const VIEWBOX_HEIGHT = 100;
const DEFAULT_LIMB_THICKNESS = 20; // How thick the vertical/horizontal parts are
const DEFAULT_OUTLINE_WIDTH = 2; // Default width for the border/stroke

function L(options?: LetterOptions): LetterRender {
  // --- SVG Setup ---
  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("viewBox", `0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`);
  svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
  svg.setAttribute("width", "100%");
  svg.setAttribute("height", "100%");

  // --- Options Processing ---
  // Use lineWidth for the thickness of the letter's parts
  const limbThickness = options?.lineWidth ?? DEFAULT_LIMB_THICKNESS;
  // Use color for the main fill
  const fillColor = options?.color ?? "currentColor"; // Default fill to text color
  // Use strokeColor for the outline
  const outlineColor = options?.strokeColor ?? "black"; // Default outline to black
  // Use strokeWidth for the outline's thickness
  const outlineWidth = options?.strokeWidth ?? DEFAULT_OUTLINE_WIDTH;

  // --- Path Definition (Filled Shape Outline) ---
  const path = document.createElementNS(svgNS, "path");

  // Calculate coordinates for the outer perimeter of the 'L' shape
  // M = Move To
  // H = Horizontal Line To
  // V = Vertical Line To
  // Z = Close Path
  const d = [
    `M 0 0`, // Start top-left
    `H ${limbThickness}`, // Move right to inner top edge
    `V ${VIEWBOX_HEIGHT - limbThickness}`, // Move down to top of horizontal bar
    `H ${VIEWBOX_WIDTH}`, // Move right to bottom-right outer corner
    `V ${VIEWBOX_HEIGHT}`, // Move down to absolute bottom-right
    `H 0`, // Move left to absolute bottom-left
    `Z`, // Close path back to 0,0
  ].join(" ");

  path.setAttribute("d", d);
  path.setAttribute("fill", fillColor);
  path.setAttribute("stroke", outlineColor);
  path.setAttribute("stroke-width", String(outlineWidth));
  // Use miter for sharper corners on the outline, round might look blobby
  path.setAttribute("stroke-linejoin", "miter");

  svg.appendChild(path);

  // --- Attachment Points (Relative to 0,0 of the viewBox) ---
  // Place these logically on the new filled shape
  const T = limbThickness; // Alias for easier reading
  const W = VIEWBOX_WIDTH;
  const H = VIEWBOX_HEIGHT;

  const attachments = {
    // Eyes and mouth on the upper part of the vertical stem
    leftEye: { x: T * 0.3, y: T * 0.8 },
    rightEye: { x: T * 0.7, y: T * 0.8 },
    mouth: { x: T / 2, y: T * 1.3 }, // Slightly lower than before

    // Hat sits centered on top
    hat: { x: T / 2, y: outlineWidth }, // Place slightly inside the top edge

    // Arms roughly mid-height
    leftArm: { x: 0, y: H * 0.6 }, // On the left edge
    rightArm: { x: T, y: H * 0.6 }, // On the right edge of the vertical stem

    // Legs at the bottom centers of the stems
    leftLeg: { x: T / 2, y: H }, // Bottom-center of vertical stem
    rightLeg: { x: T + (W - T) / 2, y: H }, // Bottom-center of horizontal stem
  };

  return {
    svg: svg,
    attachments: attachments,
  };
}

export default L;
