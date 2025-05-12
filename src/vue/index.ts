// Vue integration entry point for LetterPeople
// This file exports Vue-specific components and utilities

// Component exports
import LetterPersonComponent from './LetterPerson.vue';

// Export the Vue component as default export
export default LetterPersonComponent;

// Named exports for component
export { LetterPersonComponent };

// Export types
export * from './types';

// Re-export types from the main library that Vue users might need
export type {
  LetterInstance,
  LetterOptions,
  MouthParameters,
  MouthAppearanceOptions
} from '../types';