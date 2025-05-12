// Vue integration entry point for LetterPeople
// This file exports Vue-specific components and utilities

import LetterPersonComponent from './LetterPerson.vue';
import type { LetterPersonRef, LetterPersonProps, LetterPersonEmits } from './types';

// Default export for typical component usage
export default LetterPersonComponent;

// Named exports for component and types
export { LetterPersonComponent };
export type { LetterPersonRef, LetterPersonProps, LetterPersonEmits };

// Re-export types from the main library that Vue users might need
export type { 
  LetterInstance, 
  LetterOptions, 
  MouthParameters, 
  MouthAppearanceOptions 
} from '../types';

// Future composables exports will be here
// export { useLetterPeople } from './composables/useLetterPeople';