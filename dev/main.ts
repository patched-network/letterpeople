import { createLetter, LetterOptions, LetterRender } from "../src/index"; // Import types

console.log("Dev environment running");

// --- DOM Element References ---
const textInput = document.getElementById(
  "text-input",
) as HTMLInputElement | null;
const fillColorInput = document.getElementById(
  "fill-color-input",
) as HTMLInputElement | null;
const lineWidthInput = document.getElementById(
  "line-width-input",
) as HTMLInputElement | null;
const strokeColorInput = document.getElementById(
  "stroke-color-input",
) as HTMLInputElement | null;
const strokeWidthInput = document.getElementById(
  "stroke-width-input",
) as HTMLInputElement | null;
const showAttachmentsCheckbox = document.getElementById(
  "show-attachments-checkbox",
) as HTMLInputElement | null;
const sizeSlider = document.getElementById(
  "size-slider",
) as HTMLInputElement | null;
const sizeValueDisplay = document.getElementById(
  "size-value-display",
) as HTMLSpanElement | null;
const displayArea = document.getElementById(
  "letter-display-area",
) as HTMLDivElement | null;

// --- State ---
let currentText: string = "L";
let currentOptions: LetterOptions = {
  color: "#add8e6",
  lineWidth: 25,
  strokeColor: "#333333",
  strokeWidth: 4,
};
let showAttachments: boolean = true; // Default based on checkbox 'checked'
let letterSize: number = 80; // Default based on slider value

// --- Helper: Visualize Attachment Points ---
const svgNS = "http://www.w3.org/2000/svg";
function visualizeAttachments(
  svg: SVGElement,
  attachments: LetterRender["attachments"],
) {
  for (const key in attachments) {
    const point = attachments[key];

    // Draw circle
    const circle = document.createElementNS(svgNS, "circle");
    circle.setAttribute("cx", String(point.x));
    circle.setAttribute("cy", String(point.y));
    circle.setAttribute("r", "3"); // Fixed radius for visibility
    circle.setAttribute("class", "attachment-point"); // Use CSS class
    svg.appendChild(circle);

    // Draw label
    const text = document.createElementNS(svgNS, "text");
    text.setAttribute("x", String(point.x + 5)); // Offset slightly
    text.setAttribute("y", String(point.y + 5)); // Offset slightly
    text.setAttribute("class", "attachment-label"); // Use CSS class
    text.textContent = key;
    svg.appendChild(text);
  }
}

// --- Rendering Function ---
function renderLetters() {
  if (!displayArea) {
    console.error("Display area not found!");
    return;
  }

  // Update CSS variable for letter size
  document.documentElement.style.setProperty(
    "--letter-size",
    `${letterSize}px`,
  );

  // Clear previous letters
  displayArea.innerHTML = "";

  const textToRender = currentText.toUpperCase();

  for (const char of textToRender) {
    const wrapper = document.createElement("div");
    wrapper.className = "letter-wrapper";

    const letterInfo = createLetter(char, wrapper, currentOptions);

    if (letterInfo) {
      // Visualize attachments if enabled
      if (showAttachments) {
        visualizeAttachments(letterInfo.svg, letterInfo.attachments);
      }
      displayArea.appendChild(wrapper);
    } else {
      console.warn(`Renderer for letter "${char}" not found.`);
      const placeholder = document.createElement("div");
      placeholder.className = "placeholder";
      placeholder.textContent = char;
      displayArea.appendChild(placeholder);
    }
  }
}

// --- Event Listeners ---
function setupEventListeners() {
  if (
    !textInput ||
    !fillColorInput ||
    !lineWidthInput ||
    !strokeColorInput ||
    !strokeWidthInput ||
    !showAttachmentsCheckbox ||
    !sizeSlider ||
    !sizeValueDisplay
  ) {
    console.error("One or more control inputs are missing!");
    return;
  }

  // Text Input
  textInput.addEventListener("input", (event) => {
    currentText = (event.target as HTMLInputElement).value;
    renderLetters();
  });

  // Options Inputs
  fillColorInput.addEventListener("input", (event) => {
    currentOptions.color = (event.target as HTMLInputElement).value;
    renderLetters();
  });
  lineWidthInput.addEventListener("input", (event) => {
    currentOptions.lineWidth = parseInt(
      (event.target as HTMLInputElement).value,
      10,
    );
    renderLetters();
  });
  strokeColorInput.addEventListener("input", (event) => {
    currentOptions.strokeColor = (event.target as HTMLInputElement).value;
    renderLetters();
  });
  strokeWidthInput.addEventListener("input", (event) => {
    currentOptions.strokeWidth = parseFloat(
      (event.target as HTMLInputElement).value,
    );
    renderLetters();
  });

  // Show Attachments Checkbox
  showAttachmentsCheckbox.addEventListener("change", (event) => {
    showAttachments = (event.target as HTMLInputElement).checked;
    renderLetters(); // Re-render to add/remove points
  });

  // Size Slider
  sizeSlider.addEventListener("input", (event) => {
    letterSize = parseInt((event.target as HTMLInputElement).value, 10);
    // Update the display value next to the slider
    if (sizeValueDisplay) {
      sizeValueDisplay.textContent = `${letterSize}px`;
    }
    renderLetters(); // Re-render with new size (via CSS variable)
  });
}

// --- Initialization ---
document.addEventListener("DOMContentLoaded", () => {
  // Check if all elements exist before proceeding
  if (
    textInput &&
    fillColorInput &&
    lineWidthInput &&
    strokeColorInput &&
    strokeWidthInput &&
    showAttachmentsCheckbox &&
    sizeSlider &&
    sizeValueDisplay &&
    displayArea
  ) {
    // Set initial state from HTML values
    currentText = textInput.value;
    currentOptions = {
      color: fillColorInput.value,
      lineWidth: parseInt(lineWidthInput.value, 10),
      strokeColor: strokeColorInput.value,
      strokeWidth: parseFloat(strokeWidthInput.value),
    };
    showAttachments = showAttachmentsCheckbox.checked;
    letterSize = parseInt(sizeSlider.value, 10);

    // Set initial display value for slider
    sizeValueDisplay.textContent = `${letterSize}px`;

    setupEventListeners();
    renderLetters(); // Initial render
  } else {
    console.error(
      "Failed to initialize: Could not find all control or display elements.",
    );
  }
});
