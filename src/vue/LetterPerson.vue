<template>
  <div ref="letterContainer" class="letter-container"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
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
});

// Clean up on unmount
onBeforeUnmount(() => {
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

// Expose methods to parent components
defineExpose({
  animateMouth,
  blink,
  wave,
  updateMouthShape,
  getLetter: () => letterInstance.value
});
</script>

<style scoped>
.letter-container {
  display: inline-block;
  vertical-align: bottom; /* Aligns letters along the baseline */
}
</style>