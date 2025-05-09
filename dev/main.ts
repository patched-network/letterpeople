// Import LetterInstance and LetterOptions, remove unused LetterRender
import { createLetter } from "../src/index";
import { LetterOptions, LetterInstance, AnimationOptions } from "../src/types";

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
// Mouth controls
const mouthOpennessSlider = document.getElementById(
  "mouth-openness-slider",
) as HTMLInputElement | null;
const mouthOpennessValue = document.getElementById(
  "mouth-openness-value",
) as HTMLSpanElement | null;
const mouthMoodSlider = document.getElementById(
  "mouth-mood-slider",
) as HTMLInputElement | null;
const mouthMoodValue = document.getElementById(
  "mouth-mood-value",
) as HTMLSpanElement | null;
// Arm controls
const leftArmAngleSlider = document.getElementById(
  "left-arm-angle-slider",
) as HTMLInputElement | null;
const leftArmAngleValue = document.getElementById(
  "left-arm-angle-value",
) as HTMLSpanElement | null;
const rightArmAngleSlider = document.getElementById(
  "right-arm-angle-slider",
) as HTMLInputElement | null;
const rightArmAngleValue = document.getElementById(
  "right-arm-angle-value",
) as HTMLSpanElement | null;
const armLengthSlider = document.getElementById(
  "arm-length-slider",
) as HTMLInputElement | null;
const armLengthValue = document.getElementById(
  "arm-length-value",
) as HTMLSpanElement | null;
// Other controls
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
const animateMouthButton = document.getElementById(
  "animate-mouth-button",
) as HTMLButtonElement | null;
const blinkButton = document.getElementById(
  "blink-button",
) as HTMLButtonElement | null;
const waveArmsButton = document.getElementById(
  "wave-arms-button",
) as HTMLButtonElement | null;

// --- State ---
let currentText: string =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZLabcdefghijklmnopqrstuvwxyz";
// Updated LetterOptions structure
let currentOptions: LetterOptions = {
  color: "#add8e6",
  lineWidth: 25,
  borderColor: "#333333",
  borderWidth: 4,
  // Initialize mouth params from default slider values
  mouthParams: {
    openness: 0.1,
    mood: 0.7,
  },
  // Arm options
  armLength: 15,
  armThickness: 3,
  armColor: "#333333",
  // Example: Set mouth appearance options if needed
  // mouthAppearance: {
  //     fillColor: 'red',
  //     strokeColor: 'black',
  //     strokeWidth: 0.5
  // }
};
let showAttachments: boolean = true;
let letterSize: number = 80;
let renderedInstances: LetterInstance[] = []; // Store rendered instances

// --- Helper: Visualize Attachment Points ---
const svgNS = "http://www.w3.org/2000/svg";
function visualizeAttachments(
  svg: SVGElement,
  attachments: LetterInstance["attachmentCoords"], // Use correct type
) {
  // Remove previous points first if re-visualizing
  svg
    .querySelectorAll(".attachment-point, .attachment-label")
    .forEach((el) => el.remove());

  for (const key in attachments) {
    const point = attachments[key];
    // Draw circle
    const circle = document.createElementNS(svgNS, "circle");
    circle.setAttribute("cx", String(point.x));
    circle.setAttribute("cy", String(point.y));
    circle.setAttribute("r", "3");
    circle.setAttribute("class", "attachment-point");
    svg.appendChild(circle);
    // Draw label
    const text = document.createElementNS(svgNS, "text");
    text.setAttribute("x", String(point.x + 5));
    text.setAttribute("y", String(point.y + 5));
    text.setAttribute("class", "attachment-label");
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

  // Clean up old instances first
  renderedInstances.forEach((instance) => instance.destroy());
  renderedInstances = [];
  displayArea.innerHTML = ""; // Clear display area completely

  // Update CSS variable for letter size
  document.documentElement.style.setProperty(
    "--letter-size",
    `${letterSize}px`,
  );

  for (const char of currentText) {
    const wrapper = document.createElement("div");
    wrapper.className = "letter-wrapper";

    // Pass the *full* currentOptions, including mouthParams
    const letterInstance = createLetter(char, wrapper, currentOptions);

    if (letterInstance) {
      renderedInstances.push(letterInstance); // Store the instance
      // Visualize attachments if enabled
      if (showAttachments) {
        visualizeAttachments(
          letterInstance.svgElement,
          letterInstance.attachmentCoords,
        );
      }
      displayArea.appendChild(wrapper);
    } else {
      // console.warn(`Renderer for letter "${char}" not found.`); // Already logged in createLetter
      const placeholder = document.createElement("div");
      placeholder.className = "placeholder";
      placeholder.textContent = char;
      displayArea.appendChild(placeholder);
    }
  }
}

// --- Update Mouth Function (called by sliders) ---
function updateMouthShapes() {
  if (!currentOptions.mouthParams) return; // Should exist, but safety check

  const paramsToUpdate = {
    openness: currentOptions.mouthParams.openness,
    mood: currentOptions.mouthParams.mood,
  };

  // Update all rendered instances
  renderedInstances.forEach((instance) => {
    instance.mouth.updateShape(paramsToUpdate);
    // Re-visualize attachments if needed (updateMouth replaces the element)
    if (showAttachments) {
      visualizeAttachments(instance.svgElement, instance.attachmentCoords);
    }
  });
}

// --- Update Left Arm Angle Function ---
function updateLeftArmAngle(angle: number) {
  renderedInstances.forEach((instance) => {
    instance.arms.left.rotateTo(angle);
  });
}

// --- Update Right Arm Angle Function ---
function updateRightArmAngle(angle: number) {
  renderedInstances.forEach((instance) => {
    instance.arms.right.rotateTo(angle);
  });
}

// --- Update Arm Length Function ---
function updateArmLength(length: number) {
  currentOptions.armLength = length;
  renderedInstances.forEach((instance) => {
    instance.arms.left.setLength(length);
    instance.arms.right.setLength(length);
  });
}

// --- Event Listeners ---
function setupEventListeners() {
  // Check all elements exist
  if (
    !textInput ||
    !fillColorInput ||
    !lineWidthInput ||
    !strokeColorInput ||
    !strokeWidthInput ||
    !mouthOpennessSlider ||
    !mouthOpennessValue ||
    !mouthMoodSlider ||
    !mouthMoodValue ||
    !showAttachmentsCheckbox ||
    !sizeSlider ||
    !sizeValueDisplay ||
    !animateMouthButton ||
    !blinkButton
  ) {
    console.error("One or more control inputs are missing!");
    return;
  }

  // Text Input
  textInput.addEventListener("input", (event) => {
    currentText = (event.target as HTMLInputElement).value;
    renderLetters(); // Full re-render for new text
  });

  // Base Options Inputs (trigger full re-render)
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
    currentOptions.borderColor = (event.target as HTMLInputElement).value;
    renderLetters();
  });
  strokeWidthInput.addEventListener("input", (event) => {
    currentOptions.borderWidth = parseFloat(
      (event.target as HTMLInputElement).value,
    );
    renderLetters();
  });

  // Mouth Openness Slider (trigger mouth update)
  mouthOpennessSlider.addEventListener("input", (event) => {
    const value = parseFloat((event.target as HTMLInputElement).value);
    currentOptions.mouthParams!.openness = value; // Update state
    mouthOpennessValue.textContent = value.toFixed(2); // Update display
    updateMouthShapes(); // Update existing mouths
  });

  // Mouth Mood Slider (trigger mouth update)
  mouthMoodSlider.addEventListener("input", (event) => {
    const value = parseFloat((event.target as HTMLInputElement).value);
    currentOptions.mouthParams!.mood = value; // Update state
    mouthMoodValue.textContent = value.toFixed(2); // Update display
    updateMouthShapes(); // Update existing mouths
  });

  // Show Attachments Checkbox
  showAttachmentsCheckbox.addEventListener("change", (event) => {
    showAttachments = (event.target as HTMLInputElement).checked;
    // Re-render or just toggle visibility
    if (showAttachments) {
      renderedInstances.forEach((instance) =>
        visualizeAttachments(instance.svgElement, instance.attachmentCoords),
      );
    } else {
      renderedInstances.forEach((instance) => {
        instance.svgElement
          .querySelectorAll(".attachment-point, .attachment-label")
          .forEach((el) => el.remove());
      });
    }
  });

  // Size Slider (trigger full re-render)
  sizeSlider.addEventListener("input", (event) => {
    letterSize = parseInt((event.target as HTMLInputElement).value, 10);
    sizeValueDisplay.textContent = `${letterSize}px`;
    renderLetters();
  });

  // Animate Mouth Button
  animateMouthButton.addEventListener("click", () => {
    renderedInstances.forEach((i) => {
      i.mouth.animateSpeak!({}).catch((err) =>
        console.error("Animation failed:", err),
      );
    });
  });

  blinkButton.addEventListener("click", () => {
    renderedInstances.forEach((i) => {
      i.eyes.blink().catch((err) => console.error("Blink failed:", err));
    });
  });
  
  // Wave Arms Button
  waveArmsButton?.addEventListener("click", () => {
    renderedInstances.forEach((i) => {
      i.arms.wave().catch((err) => console.error("Wave failed:", err));
    });
  });
  
  // Left Arm Angle Slider
  leftArmAngleSlider?.addEventListener("input", (event) => {
    const value = parseFloat((event.target as HTMLInputElement).value);
    if (leftArmAngleValue) leftArmAngleValue.textContent = value.toFixed(0) + "°";
    updateLeftArmAngle(value);
  });
  
  // Right Arm Angle Slider
  rightArmAngleSlider?.addEventListener("input", (event) => {
    const value = parseFloat((event.target as HTMLInputElement).value);
    if (rightArmAngleValue) rightArmAngleValue.textContent = value.toFixed(0) + "°";
    updateRightArmAngle(value);
  });
  
  // Arm Length Slider
  armLengthSlider?.addEventListener("input", (event) => {
    const value = parseFloat((event.target as HTMLInputElement).value);
    if (armLengthValue) armLengthValue.textContent = value.toFixed(1);
    updateArmLength(value);
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
    mouthOpennessSlider &&
    mouthOpennessValue &&
    mouthMoodSlider &&
    mouthMoodValue &&
    showAttachmentsCheckbox &&
    sizeSlider &&
    sizeValueDisplay &&
    displayArea &&
    animateMouthButton, // Add button check
    waveArmsButton,
    leftArmAngleSlider,
    leftArmAngleValue,
    rightArmAngleSlider,
    rightArmAngleValue,
    armLengthSlider,
    armLengthValue
  ) {
    // Set initial state from HTML values
    currentText = textInput.value;
    currentOptions = {
      color: fillColorInput.value,
      lineWidth: parseInt(lineWidthInput.value, 10),
      borderColor: strokeColorInput.value,
      borderWidth: parseFloat(strokeWidthInput.value),
      mouthParams: {
        // Initialize from sliders
        openness: parseFloat(mouthOpennessSlider.value),
        mood: parseFloat(mouthMoodSlider.value),
      },
      // mouthAppearance: { ... } // Initialize if needed
      armLength: parseFloat(armLengthSlider.value),
      armThickness: 3, // Default value
      armColor: "#333333", // Default value
    };
    showAttachments = showAttachmentsCheckbox.checked;
    letterSize = parseInt(sizeSlider.value, 10);

    // Set initial display values for sliders
    sizeValueDisplay.textContent = `${letterSize}px`;
    mouthOpennessValue.textContent =
      currentOptions.mouthParams!.openness!.toFixed(2);
    mouthMoodValue.textContent = currentOptions.mouthParams!.mood!.toFixed(2);
    
    // Set initial display values for arm controls
    if (leftArmAngleValue) leftArmAngleValue.textContent = "150°";
    if (rightArmAngleValue) rightArmAngleValue.textContent = "30°";
    if (armLengthValue) armLengthValue.textContent = currentOptions.armLength!.toFixed(1);

    setupEventListeners();
    renderLetters(); // Initial render
  } else {
    console.error(
      "Failed to initialize: Could not find all control or display elements.",
    );
  }
});
