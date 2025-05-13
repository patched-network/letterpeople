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
   * Make the eyes look in a specific direction
   * @param direction Either an angle in degrees or {x, y} coordinates
   * @param options Animation options
   * @returns Promise that resolves when animation completes
   */
  lookAt: (direction: { x: number, y: number } | number, options?: any) => Promise<void> | undefined;
  
  /**
   * Start tracking cursor with eyes
   * @param options Tracking options like intensity
   */
  startEyeTracking: (options?: { intensity?: number, ease?: string }) => void;
  
  /**
   * Stop tracking cursor with eyes
   */
  stopEyeTracking: () => void;
  
  /**
   * Toggle eye tracking state
   * @param options Tracking options to use if enabling
   * @returns Current tracking state after toggle
   */
  toggleEyeTracking: (options?: { intensity?: number, ease?: string }) => boolean;
  
  /**
   * Check if eyes are currently tracking the cursor
   */
  isTracking: { value: boolean };
  
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
  (e: 'trackingChanged', isTracking: boolean): void;
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
  options?: LetterOptions & {
    /**
     * Whether the eyes should track the cursor
     */
    eyeTracking?: boolean;
    
    /**
     * Intensity of eye tracking (0-1)
     */
    eyeTrackingIntensity?: number;
  };
}