import type { LetterInstance, LetterOptions, MouthParameters } from '../types';

// Vue LetterPerson ref type for template refs
export interface LetterPersonRef {
  /**
   * Animate the mouth in a speaking motion
   * @param options Animation options
   * @returns Promise that resolves when animation completes
   */
  animateMouth: (options?: any) => Promise<void> | undefined;
  
  /**
   * Animate the eyes blinking
   * @param options Animation options
   * @returns Promise that resolves when animation completes
   */
  blink: (options?: any) => Promise<void> | undefined;
  
  /**
   * Animate the arms waving
   * @param options Animation options
   * @returns Promise that resolves when animation completes
   */
  wave: (options?: any) => Promise<void> | undefined;
  
  /**
   * Update the mouth shape
   * @param params Mouth shape parameters (openness and mood)
   */
  updateMouthShape: (params: Partial<MouthParameters>) => void | undefined;
  
  /**
   * Get the underlying LetterInstance
   * @returns The LetterInstance or null if not initialized
   */
  getLetter: () => LetterInstance | null;
}

// Emits interface for LetterPerson component
export interface LetterPersonEmits {
  (e: 'created', instance: LetterInstance): void;
  (e: 'destroyed'): void;
}

// Props interface for LetterPerson component
export interface LetterPersonProps {
  /**
   * The single letter to render
   * Must be a string of length 1
   */
  letter: string;
  
  /**
   * Options for rendering the letter
   */
  options?: LetterOptions;
}