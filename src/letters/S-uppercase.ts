// letterpeople/src/letters/S-uppercase.ts
import type {
  LetterOptions,
  InternalLetterRenderResult,
  AttachmentList,
  // Point, // Not used directly if path is predefined
} from "../types";

// Define constants for our coordinate space, matching the provided SVG
const VIEWBOX_WIDTH = 100;
const VIEWBOX_HEIGHT = 100;
// DEFAULT_LIMB_THICKNESS is part of options, but the path itself defines the thickness.
// We still need a default for options processing if other parts of the system use it.
const DEFAULT_LIMB_THICKNESS = 20; // Typical default, though less relevant for this path's visual thickness.
const DEFAULT_OUTLINE_WIDTH = 2;

// The SVG path data provided by the user
const SVG_PATH_DATA_S_UPPERCASE =
  "m 86.705057,7.0449427 c 1.091705,0.4888297 -3.896964,12.5210563 -5.589399,11.7534383 -6.021369,-2.731042 -12.79124,-3.53072 -19.35157,-4.353852 -5.424155,-0.680575 -10.957274,-1.041193 -16.39347,-0.464642 -2.829265,0.300066 -5.805144,0.642929 -8.291443,2.026077 -2.603798,1.448514 -5.313078,3.477631 -6.381756,6.258976 -1.222999,3.182981 -0.954177,7.189719 0.628043,10.210261 1.666847,3.182099 5.298539,4.973518 8.465799,6.668391 6.030987,3.227318 13.073028,4.047304 19.507668,6.367606 5.173701,1.865613 10.594462,3.293541 15.342776,6.068646 4.294925,2.510127 8.874137,5.231893 11.593689,9.397365 2.118898,3.245464 3.003666,7.33995 3.069468,11.215312 0.07194,4.236825 -0.82509,8.694918 -2.937561,12.368245 -2.036241,3.540772 -5.497155,6.154738 -8.880233,8.443433 -3.367743,2.27832 -7.203743,3.884909 -11.090707,5.0782 -4.023061,1.235073 -8.26124,1.693547 -12.450859,2.090431 -3.015659,0.28567 -6.056391,0.25303 -9.085169,0.20494 -4.812202,-0.0764 -9.620666,-0.387524 -14.417143,-0.783681 -2.921609,-0.241306 -5.848922,-0.490564 -8.741024,-0.96991 -2.355494,-0.390407 -4.705272,-0.866912 -6.993366,-1.54911 -1.479419,-0.441091 -5.7543603,-1.253677 -5.707157,-2.263424 0.2048603,-4.382259 0.783414,-8.182777 1.329113,-12.53575 0.113221,-0.903151 6.519099,1.738456 9.806779,2.491175 4.247719,0.972522 8.485868,2.065259 12.808697,2.614868 3.573873,0.454386 7.190936,0.56325 10.793573,0.55684 3.392284,-0.006 6.813475,-0.0138 10.161423,-0.560492 3.310226,-0.540532 6.689139,-1.195293 9.701345,-2.670551 1.85731,-0.909636 3.644112,-2.12757 4.968202,-3.716225 1.177492,-1.412766 2.043615,-3.148668 2.454662,-4.941273 0.328529,-1.432739 0.284271,-2.977011 -0.04519,-4.409536 C 70.530093,69.683392 69.671312,67.752016 68.403719,66.194164 67.178721,64.688661 65.434322,63.661614 63.756385,62.68607 60.865337,61.00523 57.683428,59.864679 54.542047,58.717898 49.73976,56.964793 44.675197,56.001447 39.860633,54.282345 35.631888,52.772417 31.297951,51.383572 27.414339,49.129747 23.238297,46.706212 18.886942,44.101239 15.963968,40.258185 13.90489,37.550961 12.805394,34.142443 12.095297,30.81609 11.421453,27.659562 10.93491,24.250987 11.787665,21.138023 12.859928,17.223752 15.419562,13.70119 18.322323,10.864776 21.004772,8.2436386 24.506982,6.5274992 27.952922,5.0471637 31.895027,3.3536815 36.13653,2.3671183 40.364527,1.6376587 43.838449,1.0383003 47.386523,0.89123046 50.911631,0.85990746 c 4.293584,-0.0381514 8.593958,0.24233024 12.861185,0.71887224 4.203556,0.4694316 8.404296,1.1013258 12.513389,2.104126 3.545242,0.8651958 7.08821,1.8706846 10.418852,3.362037 z";

/**
 * @internal
 * Renders the base shape and calculates attachment points for the uppercase letter 'S'.
 * The path data is taken directly from a user-provided SVG.
 *
 * @param options - Configuration options for the letter's appearance.
 * @returns An object containing the base SVG element and attachment coordinates.
 */
function renderS_uppercase(
  options?: LetterOptions,
): InternalLetterRenderResult {
  // --- SVG Setup ---
  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("viewBox", `0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`);
  svg.setAttribute("class", "letter-base letter-S-uppercase");

  // --- Options Processing ---
  // Note: options.lineWidth (limbThickness) is not used to define the S-shape itself,
  // as that's fixed by the SVG_PATH_DATA_S_UPPERCASE.
  // It's processed here for consistency with the LetterOptions type.
  // const limbThickness = options?.lineWidth ?? DEFAULT_LIMB_THICKNESS;
  const fillColor = options?.color ?? "currentColor";
  const outlineColor = options?.borderColor ?? "black";
  const outlineWidth = options?.borderWidth ?? DEFAULT_OUTLINE_WIDTH;

  // --- Path Definition ---
  const pathEl = document.createElementNS(svgNS, "path");
  pathEl.setAttribute("d", SVG_PATH_DATA_S_UPPERCASE);
  pathEl.setAttribute("fill", fillColor);
  pathEl.setAttribute("stroke", outlineColor);
  pathEl.setAttribute("stroke-width", String(outlineWidth));
  // The provided path data contains two subpaths (M...Z M...Z),
  // which typically defines an outer shape and an inner hole.
  // The default fill-rule "nonzero" should correctly render this.
  // "round" stroke-linejoin is generally aesthetically pleasing for curved letters like 'S'.
  pathEl.setAttribute("stroke-linejoin", "round");

  svg.appendChild(pathEl);

  // --- Attachment Points Calculation (Relative to 0,0 of the viewBox) ---
  // These are general estimates for an 'S' shape and may require fine-tuning
  // once the letter is visually rendered with its specific path.
  const W = VIEWBOX_WIDTH; // 100 for this 'S'
  const H = VIEWBOX_HEIGHT; // 100 for this 'S'
  const ow = outlineWidth; // shorthand for outlineWidth

  const attachments: AttachmentList = {
    // Eyes positioned in the upper curve of the 'S'
    leftEye: { x: W * 0.4, y: 8.5 },
    rightEye: { x: W * 0.7, y: 8.5 }, // Slightly higher and more to the right

    // Mouth positioned in the central part of the 'S'
    mouth: { x: W * 0.5, y: H * 0.5 }, // Centered

    // Hat sits centered on the top of the 'S's visual bounds.
    // The provided path starts near y=0 (specifically y=-0.14), so ow/2 is a good y for the hat.
    hat: { x: W / 2, y: ow / 2 },

    // Arms positioned on the outer curves of the 'S'
    leftArm: { x: W * 0.15, y: H * 0.45 }, // Mid-upper part of the left curve
    rightArm: { x: W * 0.85, y: H * 0.55 }, // Mid-lower part of the right curve

    // Legs positioned on the lower curves of the 'S'
    // The path's lowest points are near H (e.g., y=98.59 in the path data).
    leftLeg: { x: W * 0.25, y: H * 0.85 }, // On the lower-left curve
    rightLeg: { x: W * 0.75, y: H * 0.8 }, // On the lower-right curve
  };

  return {
    svg: svg,
    attachments: attachments,
  };
}

export default renderS_uppercase;
