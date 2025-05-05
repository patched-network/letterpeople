// letterpeople/src/index.ts
import { LetterOptions, LetterRender } from "./types";

// Import letter implementations
// import A from './letters/A'; // Keep commented until implemented
import L from "./letters/L";
// import a from './letters/a'; // Keep commented until implemented

// Map letters to their rendering functions
// Use uppercase for consistency internally
const letterRenderers: {
  [key: string]: (options?: LetterOptions) => LetterRender;
} = {
  // 'A': A,
  L: L,
  // 'a': a, // Example if lowercase is distinct
};

// The single PUBLIC function
export function createLetter(
  letter: string,
  target: Element,
  options?: LetterOptions,
): LetterRender | null {
  const upperCaseLetter = letter.toUpperCase(); // Or handle case sensitivity as needed

  const renderer = letterRenderers[upperCaseLetter];

  if (renderer) {
    try {
      const result = renderer(options);

      // Append the generated SVG to the target element
      target.appendChild(result.svg);

      return result; // Return the SVG element and attachment points
    } catch (error) {
      console.error(`Error rendering letter "${letter}":`, error);
      return null;
    }
  } else {
    console.warn(`Letter renderer for "${letter}" not found.`); // Use warn instead of error
    return null;
  }
}
