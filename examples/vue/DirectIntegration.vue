<template>
  <div class="direct-integration">
    <h2>Direct Integration with Core Library</h2>
    <p>This example shows how to directly integrate the core library within a Vue component without using the LetterPerson wrapper.</p>
    
    <div class="controls">
      <div class="input-group">
        <label>Letter:</label>
        <select v-model="currentLetter">
          <option v-for="letter in availableLetters" :key="letter" :value="letter">{{ letter }}</option>
        </select>
      </div>
      
      <button @click="animateLetter">Animate</button>
    </div>
    
    <div ref="letterContainer" class="letter-container"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import { createLetter, LetterInstance } from 'letterpeople';

// State
const letterContainer = ref<HTMLElement | null>(null);
const letterInstance = ref<LetterInstance | null>(null);
const currentLetter = ref('L');
const availableLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

// Initial render
onMounted(() => {
  createLetterInstance();
});

// Clean up on unmount
onBeforeUnmount(() => {
  if (letterInstance.value) {
    letterInstance.value.destroy();
  }
});

// Watch for letter changes
watch(currentLetter, () => {
  createLetterInstance();
});

// Create the letter instance directly using the core library
function createLetterInstance() {
  if (letterInstance.value) {
    letterInstance.value.destroy();
    letterInstance.value = null;
  }
  
  if (letterContainer.value) {
    letterInstance.value = createLetter(currentLetter.value, letterContainer.value, {
      color: '#ff9500',
      lineWidth: 25,
      borderColor: '#333333',
      borderWidth: 4,
      mouthParams: {
        openness: 0.2,
        mood: 0.8
      }
    });
  }
}

// Animation function
function animateLetter() {
  if (letterInstance.value) {
    // Animate using the core library APIs
    letterInstance.value.mouth.animateSpeak();
    letterInstance.value.eyes.blink();
    letterInstance.value.arms.wave();
  }
}
</script>

<style scoped>
.direct-integration {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  padding: 20px;
  border-radius: 8px;
  background-color: #f9f9f9;
}

.controls {
  margin-bottom: 20px;
  display: flex;
  gap: 20px;
  align-items: center;
}

.input-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

select {
  padding: 8px;
  font-size: 16px;
  border-radius: 4px;
  border: 1px solid #ccc;
}

button {
  background-color: #ff9500;
  border: none;
  color: white;
  padding: 10px 15px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

button:hover {
  background-color: #e67e00;
}

.letter-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 250px;
  background-color: #fff;
  border: 1px dashed #ccc;
  border-radius: 8px;
}

:deep(svg) {
  height: 200px;
  width: auto;
}
</style>