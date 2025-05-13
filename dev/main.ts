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
// Attachment toggles
const showEyesCheckbox = document.getElementById(
  "show-eyes-checkbox"
) as HTMLInputElement | null;
const showMouthCheckbox = document.getElementById(
  "show-mouth-checkbox"
) as HTMLInputElement | null;
const showArmsCheckbox = document.getElementById(
  "show-arms-checkbox"
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
// Eye controls
const eyeAngleSlider = document.getElementById(
  "eye-angle-slider"
) as HTMLInputElement | null;
const eyeAngleValue = document.getElementById(
  "eye-angle-value"
) as HTMLSpanElement | null;
const eyeDistanceSlider = document.getElementById(
  "eye-distance-slider"
) as HTMLInputElement | null;
const eyeDistanceValue = document.getElementById(
  "eye-distance-value"
) as HTMLSpanElement | null;
const trackCursorButton = document.getElementById(
  "track-cursor-button"
) as HTMLButtonElement | null;
const eyeTrackingCheckbox = document.getElementById(
  "eye-tracking-checkbox"
) as HTMLInputElement | null;
const trackingIntensitySlider = document.getElementById(
  "tracking-intensity-slider"
) as HTMLInputElement | null;
const trackingIntensityValue = document.getElementById(
  "tracking-intensity-value"
) as HTMLSpanElement | null;
// Debug controls
const showAttachmentsCheckbox = document.getElementById(
  "show-attachments-checkbox",
) as HTMLInputElement | null;
const showBaselineCheckbox = document.getElementById(
  "show-baseline-checkbox",
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

// Track mouse position globally
let globalMouseX = 0;
let globalMouseY = 0;
document.addEventListener("mousemove", (e) => {
  globalMouseX = e.clientX;
  globalMouseY = e.clientY;
});

// --- State ---
let currentText: string =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZLabcdefghijklmnopqrstuvwxyz";
// Updated LetterOptions structure
let currentOptions: LetterOptions = {
  color: "#add8e6",
  lineWidth: 25,
  borderColor: "#333333",
  borderWidth: 4,
  // Debug options
  debug: false,
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
let showEyes: boolean = true;
let showMouth: boolean = true;
let showArms: boolean = true;
let showBaseline: boolean = false;
let letterSize: number = 80;
let eyeTracking: boolean = false;
let trackingIntensity: number = 0.5;
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

  // Store previous tracking state
  const wasTracking = eyeTracking;

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
      
      // Apply visibility settings for attachments
      if (!showEyes && letterInstance.eyes) {
        letterInstance.eyes.hide();
      }
      if (!showMouth && letterInstance.mouth) {
        letterInstance.mouth.hide();
      }
      if (!showArms && letterInstance.arms) {
        letterInstance.arms.hide();
      }
      
      // Set up eye tracking if enabled
      if (eyeTracking && letterInstance.eyes) {
        letterInstance.eyes.startTracking({
          intensity: trackingIntensity
        });
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
    !blinkButton ||
    !eyeAngleSlider ||
    !eyeAngleValue ||
    !eyeDistanceSlider ||
    !eyeDistanceValue ||
    !trackCursorButton ||
    !eyeTrackingCheckbox ||
    !trackingIntensitySlider ||
    !trackingIntensityValue
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
  
  // Show Baseline Checkbox
  showBaselineCheckbox?.addEventListener("change", (event) => {
    showBaseline = (event.target as HTMLInputElement).checked;
    currentOptions.debug = showBaseline;
    renderLetters();
  });
  
  // Show Eyes Checkbox
  showEyesCheckbox?.addEventListener("change", (event) => {
    showEyes = (event.target as HTMLInputElement).checked;
    renderedInstances.forEach((instance) => {
      if (showEyes) {
        instance.eyes.show();
      } else {
        instance.eyes.hide();
      }
    });
  });
  
  // Show Mouth Checkbox
  showMouthCheckbox?.addEventListener("change", (event) => {
    showMouth = (event.target as HTMLInputElement).checked;
    renderedInstances.forEach((instance) => {
      if (showMouth) {
        instance.mouth.show();
      } else {
        instance.mouth.hide();
      }
    });
  });
  
  // Show Arms Checkbox
  showArmsCheckbox?.addEventListener("change", (event) => {
    showArms = (event.target as HTMLInputElement).checked;
    renderedInstances.forEach((instance) => {
      if (showArms) {
        instance.arms.show();
      } else {
        instance.arms.hide();
      }
    });
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
  
  // Eye angle slider - controls direction of pupil
  eyeAngleSlider?.addEventListener("input", (event) => {
    const angle = parseInt((event.target as HTMLInputElement).value, 10);
    if (eyeAngleValue) eyeAngleValue.textContent = `${angle}°`;
    
    // Update eye direction
    renderedInstances.forEach((instance) => {
      // Calculate distance too
      const distance = eyeDistanceSlider ? 
        parseInt(eyeDistanceSlider.value, 10) / 100 : 0.5;
      
      // If tracking is active, temporarily disable it
      const wasTracking = eyeTracking;
      if (wasTracking) {
        instance.eyes.stopTracking();
      }
      
      // Look at the angle with the specified distance
      instance.eyes.lookAt(angle, {
        duration: 150
      });
      
      // Restore tracking if it was active
      if (wasTracking) {
        setTimeout(() => {
          instance.eyes.startTracking({
            intensity: trackingIntensity
          });
        }, 200);
      }
    });
  });
  
  // Eye distance slider - controls how far the pupil moves
  eyeDistanceSlider?.addEventListener("input", (event) => {
    const distance = parseInt((event.target as HTMLInputElement).value, 10);
    if (eyeDistanceValue) eyeDistanceValue.textContent = `${distance}%`;
    
    // Use the current angle from the angle slider
    const angle = eyeAngleSlider ? 
      parseInt(eyeAngleSlider.value, 10) : 0;
    
    // Update all eyes
    renderedInstances.forEach((instance) => {
      // If tracking is active, temporarily disable it
      const wasTracking = eyeTracking;
      if (wasTracking) {
        instance.eyes.stopTracking();
      }
      
      // Look at the angle with the new distance
      instance.eyes.lookAt(angle, {
        duration: 150 
      });
      
      // Restore tracking if it was active
      if (wasTracking) {
        setTimeout(() => {
          instance.eyes.startTracking({
            intensity: trackingIntensity
          });
        }, 200);
      }
    });
  });
  
  // Track cursor button
  trackCursorButton?.addEventListener("click", () => {
    // Toggle eye tracking
    eyeTracking = !eyeTracking;
    
    // Update checkbox state
    if (eyeTrackingCheckbox) {
      eyeTrackingCheckbox.checked = eyeTracking;
    }
    
    // Enable/disable tracking intensity slider
    if (trackingIntensitySlider) {
      trackingIntensitySlider.disabled = !eyeTracking;
    }
    
    // Apply to all eyes
    renderedInstances.forEach((instance) => {
      if (eyeTracking) {
        instance.eyes.startTracking({
          intensity: trackingIntensity
        });
      } else {
        instance.eyes.stopTracking();
      }
    });
  });
  
  // Eye tracking checkbox 
  eyeTrackingCheckbox?.addEventListener("change", (event) => {
    eyeTracking = (event.target as HTMLInputElement).checked;
    
    // Enable/disable tracking intensity slider
    if (trackingIntensitySlider) {
      trackingIntensitySlider.disabled = !eyeTracking;
    }
    
    // Apply to all eyes
    renderedInstances.forEach((instance) => {
      if (eyeTracking) {
        instance.eyes.startTracking({
          intensity: trackingIntensity
        });
      } else {
        instance.eyes.stopTracking();
      }
    });
  });
  
  // Tracking intensity slider
  trackingIntensitySlider?.addEventListener("input", (event) => {
    const value = parseInt((event.target as HTMLInputElement).value, 10);
    trackingIntensity = value / 100;
    if (trackingIntensityValue) trackingIntensityValue.textContent = `${value}%`;
    
    // Update tracking intensity for active eyes
    if (eyeTracking) {
      renderedInstances.forEach((instance) => {
        // Need to restart tracking with new intensity
        instance.eyes.stopTracking();
        instance.eyes.startTracking({
          intensity: trackingIntensity
        });
      });
    }
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
    showBaselineCheckbox &&
    showEyesCheckbox &&
    showMouthCheckbox &&
    showArmsCheckbox &&
    sizeSlider &&
    sizeValueDisplay &&
    displayArea &&
    animateMouthButton &&
    blinkButton &&
    waveArmsButton &&
    leftArmAngleSlider &&
    leftArmAngleValue &&
    rightArmAngleSlider &&
    rightArmAngleValue &&
    armLengthSlider &&
    armLengthValue &&
    eyeAngleSlider &&
    eyeAngleValue &&
    eyeDistanceSlider &&
    eyeDistanceValue &&
    trackCursorButton &&
    eyeTrackingCheckbox &&
    trackingIntensitySlider &&
    trackingIntensityValue
  ) {
    // Set initial state from HTML values
    currentText = textInput.value;
    currentOptions = {
      color: fillColorInput.value,
      lineWidth: parseInt(lineWidthInput.value, 10),
      borderColor: strokeColorInput.value,
      borderWidth: parseFloat(strokeWidthInput.value),
      debug: showBaselineCheckbox?.checked || false,
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
    showEyes = showEyesCheckbox.checked;
    showMouth = showMouthCheckbox.checked;
    showArms = showArmsCheckbox.checked;
    showBaseline = showBaselineCheckbox?.checked || false;
    letterSize = parseInt(sizeSlider.value, 10);
    eyeTracking = eyeTrackingCheckbox?.checked || false;
    trackingIntensity = trackingIntensitySlider ? parseInt(trackingIntensitySlider.value, 10) / 100 : 0.5;

    // Set initial display values for sliders
    sizeValueDisplay.textContent = `${letterSize}px`;
    mouthOpennessValue.textContent =
      currentOptions.mouthParams!.openness!.toFixed(2);
    mouthMoodValue.textContent = currentOptions.mouthParams!.mood!.toFixed(2);
    
    // Set initial display values for arm controls
    if (leftArmAngleValue) leftArmAngleValue.textContent = "150°";
    if (rightArmAngleValue) rightArmAngleValue.textContent = "30°";
    if (armLengthValue) armLengthValue.textContent = currentOptions.armLength!.toFixed(1);
    
    // Set initial display values for eye controls
    if (eyeAngleValue) eyeAngleValue.textContent = "0°";
    if (eyeDistanceValue) eyeDistanceValue.textContent = "50%";
    if (trackingIntensityValue) trackingIntensityValue.textContent = "50%";
    
    // Enable/disable tracking intensity slider based on initial state
    if (trackingIntensitySlider) {
      trackingIntensitySlider.disabled = !eyeTracking;
    }

    setupEventListeners();
    renderLetters(); // Initial render
  } else {
    console.error(
      "Failed to initialize: Could not find all control or display elements.",
    );
  }
});
