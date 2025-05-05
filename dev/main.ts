// letterpeople/dev/main.ts (Example modifications)
import { createLetter } from "../src/index";

console.log("Dev environment running");

document.addEventListener("DOMContentLoaded", () => {
  const container = document.createElement("div");
  container.id = "letter-container";
  container.style.width = "150px"; // Make it a bit bigger
  container.style.height = "150px";
  container.style.border = "1px solid #ccc";
  container.style.margin = "20px";
  document.body.appendChild(container);

  const letterInfo = createLetter("L", container, {
    color: "skyblue", // Set the fill color
    lineWidth: 25, // Make the letter parts thicker
    strokeColor: "#333", // Dark grey outline
    strokeWidth: 4, // Thicker outline
  });

  if (letterInfo) {
    console.log("Letter 'L' created:", letterInfo);
    console.log("SVG Element:", letterInfo.svg);
    console.log("Attachment points:", letterInfo.attachments);

    // Visualize attachment points (same code as before)
    const svg = letterInfo.svg;
    const svgNS = "http://www.w3.org/2000/svg";
    for (const key in letterInfo.attachments) {
      const point = letterInfo.attachments[key];
      const circle = document.createElementNS(svgNS, "circle");
      circle.setAttribute("cx", String(point.x));
      circle.setAttribute("cy", String(point.y));
      circle.setAttribute("r", "3");
      circle.setAttribute("fill", "red");
      svg.appendChild(circle);

      // Optional: Add text label near the point
      const text = document.createElementNS(svgNS, "text");
      text.setAttribute("x", String(point.x + 5)); // Offset slightly
      text.setAttribute("y", String(point.y + 5)); // Offset slightly
      text.setAttribute("font-size", "8");
      text.setAttribute("fill", "black");
      text.setAttribute("font-family", "sans-serif"); // Ensure readability
      text.textContent = key;
      svg.appendChild(text);
    }
  } else {
    console.error("Failed to create letter 'L'.");
  }

  // Create another one with defaults to see the difference
  const container2 = document.createElement("div");
  container2.style.width = "100px";
  container2.style.height = "100px";
  container2.style.border = "1px solid lightblue";
  container2.style.margin = "20px";
  // Set text color on parent to see 'currentColor' fill work
  container2.style.color = "green";
  document.body.appendChild(container2);

  createLetter("L", container2); // Uses defaults: currentColor fill, black outline
});
