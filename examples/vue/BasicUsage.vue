<template>
  <div class="example">
    <h1>Basic Usage Example</h1>
    
    <div class="control-section">
      <div class="letter-input">
        <label>
          Letter:
          <input type="text" v-model="currentLetter" maxlength="1" />
        </label>
      </div>
      
      <div class="color-controls">
        <label>
          Color:
          <input type="color" v-model="letterOptions.color" />
        </label>
        
        <label>
          Border:
          <input type="color" v-model="letterOptions.borderColor" />
        </label>
      </div>
      
      <div class="mouth-controls">
        <label>
          Mouth Openness:
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.05" 
            v-model.number="letterOptions.mouthParams.openness" 
          />
          {{ letterOptions.mouthParams.openness.toFixed(2) }}
        </label>
        
        <label>
          Mouth Mood:
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.05" 
            v-model.number="letterOptions.mouthParams.mood" 
          />
          {{ letterOptions.mouthParams.mood.toFixed(2) }}
        </label>
      </div>
      
      <div class="actions">
        <button @click="animateMouth">Speak</button>
        <button @click="blinkEyes">Blink</button>
        <button @click="waveArms">Wave</button>
      </div>
    </div>
    
    <div class="letter-display">
      <LetterPerson
        :letter="currentLetter"
        :options="letterOptions"
        ref="letterRef"
        @created="onLetterCreated"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
// Use aliased import that Vite handles
import LetterPerson, { type LetterPersonRef, type LetterOptions } from 'letterpeople/vue';

// State
const currentLetter = ref('L');
const letterRef = ref<LetterPersonRef | null>(null);
const letterOptions = reactive<LetterOptions>({
  color: '#add8e6',
  lineWidth: 25,
  borderColor: '#333333',
  borderWidth: 4,
  mouthParams: {
    openness: 0.2,
    mood: 0.7
  }
});

// Event handlers
const onLetterCreated = (instance: any) => {
  console.log('Letter instance created:', instance);
};

// Animation methods
const animateMouth = () => {
  letterRef.value?.animateMouth();
};

const blinkEyes = () => {
  letterRef.value?.blink();
};

const waveArms = () => {
  letterRef.value?.wave();
};
</script>

<style scoped>
.example {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.control-section {
  margin-bottom: 30px;
  padding: 15px;
  background-color: #f5f5f5;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.letter-input, .color-controls, .mouth-controls, .actions {
  display: flex;
  gap: 15px;
  align-items: center;
  flex-wrap: wrap;
}

label {
  display: flex;
  align-items: center;
  gap: 8px;
}

input[type="text"] {
  width: 40px;
  font-size: 20px;
  text-align: center;
  padding: 5px;
}

input[type="range"] {
  width: 150px;
}

button {
  background-color: #4CAF50;
  border: none;
  color: white;
  padding: 10px 15px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  margin: 4px 2px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

button:hover {
  background-color: #45a049;
}

.letter-display {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

.letter-display :deep(svg) {
  height: 200px;
  width: auto;
}
</style>