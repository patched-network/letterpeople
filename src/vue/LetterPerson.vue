<template>
  <div ref="letterContainer" class="letter-container"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue';
import { createLetter } from '../index';
import type { LetterInstance } from '../types';
import type { LetterPersonProps, LetterPersonEmits } from './types';

const props = defineProps<LetterPersonProps>();
const emit = defineEmits<LetterPersonEmits>();

const letterContainer = ref<HTMLElement | null>(null);
const letterInstance = ref<LetterInstance | null>(null);

// Create the letter instance
const createLetterInstance = () => {
  if (letterContainer.value) {
    // Remove any existing letter first
    if (letterInstance.value) {
      letterInstance.value.destroy();
      letterInstance.value = null;
    }

    // Create a new letter instance
    letterInstance.value = createLetter(props.letter, letterContainer.value, props.options);
    
    // Emit the created event with the letter instance
    if (letterInstance.value) {
      emit('created', letterInstance.value);
    }
  }
};

// Initialize on mount
onMounted(() => {
  createLetterInstance();
  
  // Initialize eye tracking if enabled in options
  if (props.options?.eyeTracking && letterInstance.value?.eyes) {
    startEyeTracking();
  }
});

// Clean up on unmount
onBeforeUnmount(() => {
  // Stop eye tracking first to clean up event listeners
  if (letterInstance.value?.eyes?.isTracking()) {
    letterInstance.value.eyes.stopTracking();
  }
  
  if (letterInstance.value) {
    letterInstance.value.destroy();
    emit('destroyed');
    letterInstance.value = null;
  }
});

// Re-render when letter or options change
watch([() => props.letter, () => props.options], () => {
  createLetterInstance();
}, { deep: true });

// Track whether eye tracking is enabled
const isEyeTrackingEnabled = ref(props.options?.eyeTracking || false);

// Computed property to check if we have active tracking
const isTracking = computed(() => {
  return letterInstance.value?.eyes?.isTracking() || false;
});

// Methods for animations and control
const animateMouth = (options = {}) => {
  return letterInstance.value?.mouth.animateSpeak(options);
};

const blink = (options = {}) => {
  return letterInstance.value?.eyes.blink(options);
};

const wave = (options = {}) => {
  return letterInstance.value?.arms.wave(options);
};

const updateMouthShape = (params: { openness?: number; mood?: number }) => {
  return letterInstance.value?.mouth.updateShape(params);
};

// Eye tracking methods
const lookAt = (direction: { x: number, y: number } | number, options = {}) => {
  return letterInstance.value?.eyes.lookAt(direction, options);
};

const startEyeTracking = (options = {}) => {
  if (letterInstance.value?.eyes) {
    letterInstance.value.eyes.startTracking(options);
    isEyeTrackingEnabled.value = true;
    emit('trackingChanged', true);
  }
};

const stopEyeTracking = () => {
  if (letterInstance.value?.eyes) {
    letterInstance.value.eyes.stopTracking();
    isEyeTrackingEnabled.value = false;
    emit('trackingChanged', false);
  }
};

const toggleEyeTracking = (options = {}) => {
  if (isTracking.value) {
    stopEyeTracking();
  } else {
    startEyeTracking(options);
  }
  return isTracking.value;
};

// Watch for changes in tracking prop
watch(() => props.options?.eyeTracking, (newValue) => {
  if (newValue && !isTracking.value) {
    startEyeTracking();
  } else if (newValue === false && isTracking.value) {
    stopEyeTracking();
  }
});

// Expose methods to parent components
defineExpose({
  animateMouth,
  blink,
  wave,
  updateMouthShape,
  lookAt,
  startEyeTracking,
  stopEyeTracking,
  toggleEyeTracking,
  isTracking,
  getLetter: () => letterInstance.value
});
</script>

<style scoped>
.letter-container {
  display: inline-block;
  vertical-align: bottom; /* Aligns letters along the baseline */
}
</style>