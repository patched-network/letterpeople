// src/letters/c-lowercase.ts
import type {
  LetterOptions,
  InternalLetterRenderResult,
  Point,
  AttachmentList,
} from "../types";

// Define constants for our coordinate space
const VIEWBOX_WIDTH = 70; // Wider than the 'i' to accommodate the curved shape
const VIEWBOX_HEIGHT = 100;
const DEFAULT_STROKE_THICKNESS = 20; // Thickness of the main stroke
const DEFAULT_OUTLINE_WIDTH = 2; // Default width for the border/stroke
const OPENING_ANGLE = 70; // Angle in degrees of the 'c' opening (from vertical)

/**
 * @internal
 * Renders the base shape and calculates attachment points for the lowercase letter 'c'.
 * Creates a curved 'c' shape with facial features on the right side.
 * This function does NOT add attachments; that happens in the main createLetter function.
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
  const strokeThickness = options?.lineWidth ?? DEFAULT_STROKE_THICKNESS;
  const fillColor = options?.color ?? "currentColor";
  const outlineColor = options?.borderColor ?? "black";
  const outlineWidth = options?.borderWidth ?? DEFAULT_OUTLINE_WIDTH;

  // --- Calculate dimensions and positions ---
  const W = VIEWBOX_WIDTH;
  const H = VIEWBOX_HEIGHT;
  
  // The 'c' will be positioned with its left edge a bit from the left margin
  const margin = strokeThickness * 0.25;
  const leftEdge = margin;
  
  // Center point of the 'c' arc
  const centerX = leftEdge + (W - leftEdge) * 0.4; // Positioned leftward of center
  const centerY = H / 2;
  
  // Outer and inner radii of the 'c' shape
  const outerRadius = Math.min((W - leftEdge) * 0.9, H / 2 - margin);
  const innerRadius = outerRadius - strokeThickness;
  
  // Opening angles (in degrees) - based on OPENING_ANGLE from vertical
  // Convert to start/end angles for the arc (0 degrees = 3 o'clock)
  const startAngle = 90 - OPENING_ANGLE;
  const endAngle = 90 + OPENING_ANGLE;
  
  // Convert angles to radians
  const startRad = (startAngle * Math.PI) / 180;
  const endRad = (endAngle * Math.PI) / 180;
  
  // Calculate points on the arcs
  // Start and end points of the outer arc
  const outerStartX = centerX + outerRadius * Math.cos(startRad);
  const outerStartY = centerY - outerRadius * Math.sin(startRad);
  const outerEndX = centerX + outerRadius * Math.cos(endRad);
  const outerEndY = centerY - outerRadius * Math.sin(endRad);
  
  // Start and end points of the inner arc
  const innerStartX = centerX + innerRadius * Math.cos(startRad);
  const innerStartY = centerY - innerRadius * Math.sin(startRad);
  const innerEndX = centerX + innerRadius * Math.cos(endRad);
  const innerEndY = centerY - innerRadius * Math.sin(endRad);
  
  // Right side center point (for facial features)
  const faceX = centerX + innerRadius * Math.cos(0); // At 0 degrees (3 o'clock)
  const faceY = centerY;
  
  // --- Create the 'c' shape ---
  const path = document.createElementNS(svgNS, "path");
  
  // Build the path:
  // 1. Move to start of outer arc
  // 2. Draw the outer arc
  // 3. Draw a line to the start of the inner arc
  // 4. Draw the inner arc in reverse direction
  // 5. Close the path
  const largeArcFlag = (endAngle - startAngle <= 180) ? "0" : "1";
  
  const d = [
    `M ${outerStartX} ${outerStartY}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${outerEndX} ${outerEndY}`,
    `L ${innerEndX} ${innerEndY}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerStartX} ${innerStartY}`,
    `L ${outerStartX} ${outerStartY}`,
    `Z`
  ].join(" ");
  
  path.setAttribute("d", d);
  path.setAttribute("fill", fillColor);
  path.setAttribute("stroke", outlineColor);
  path.setAttribute("stroke-width", String(outlineWidth));
  path.setAttribute("stroke-linejoin", "round");
  path.setAttribute("stroke-linecap", "round");
  
  // Add path to SVG
  svg.appendChild(path);
  
  // --- Attachment Points Calculation ---
  const attachments: AttachmentList = {
    // Eyes positioned on the right side of the 'c', slightly above/below center
    leftEye: { x: faceX - strokeThickness * 0.25, y: faceY - strokeThickness * 0.3 },
    rightEye: { x: faceX + strokeThickness * 0.25, y: faceY - strokeThickness * 0.3 },
    
    // Mouth on the right side, below eyes
    mouth: { x: faceX, y: faceY + strokeThickness * 0.3 },
    
    // Hat at the top of the 'c'
    hat: { x: centerX, y: centerY - outerRadius - outlineWidth / 2 },
    
    // Arms at the ends of the 'c'
    leftArm: { x: outerStartX, y: outerStartY },  // Top end
    rightArm: { x: outerEndX, y: outerEndY },     // Bottom end
    
    // Legs at the bottom of the 'c'
    leftLeg: { x: centerX - innerRadius * 0.5, y: centerY + outerRadius * 0.8 },
    rightLeg: { x: centerX + innerRadius * 0.5, y: centerY + outerRadius * 0.8 },
  };
  
  // Return the result
  return {
    svg: svg,
    attachments: attachments,
  };
}

// Export the function
export default renderC_lowercase;