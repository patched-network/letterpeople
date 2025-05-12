<template>
  <div class="example">
    <h1>Word Example</h1>
    
    <div class="control-section">
      <div class="text-input">
        <label>
          Word:
          <input type="text" v-model="word" />
        </label>
      </div>
      
      <div class="appearance-controls">
        <label>
          Color:
          <input type="color" v-model="letterOptions.color" />
        </label>
        
        <label>
          Border:
          <input type="color" v-model="letterOptions.borderColor" />
        </label>
        
        <label>
          Line Width:
          <input 
            type="range" 
            min="10" 
            max="40" 
            step="1" 
            v-model.number="letterOptions.lineWidth" 
          />
          {{ letterOptions.lineWidth }}px
        </label>
      </div>
      
      <div class="actions">
        <button @click="animateAll">Animate All</button>
        <button @click="animateSequential">Animate Sequential</button>
        <button @click="resetAll">Reset</button>
      </div>
    </div>
    
    <div class="word-display">
      <div class="letters">
        <template v-for="(char, index) in word" :key="index">
          <LetterPerson
            v-if="isSupportedLetter(char)"
            :letter="char"
            :options="letterOptions"
            :ref="el => setLetterRef(el, index)"
            class="letter"
          />
          <span v-else class="unsupported">{{ char }}</span>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onBeforeUpdate } from 'vue';
// Use aliased import that Vite handles
import LetterPerson, { type LetterPersonRef, type LetterOptions } from 'letterpeople/vue';

// State
const word = ref('HELLO');
const letterRefs = ref<(LetterPersonRef | null)[]>([]);

const letterOptions = reactive<LetterOptions>({
  color: '#add8e6',
  lineWidth: 25,
  borderColor: '#333333',
  borderWidth: 4,
  mouthParams: {
    openness: 0.1,
    mood: 0.7
  }
});

// Clear refs array before each update
onBeforeUpdate(() => {
  letterRefs.value = [];
});

// Helper to set refs in a loop
const setLetterRef = (el: any, index: number) => {
  if (el) {
    letterRefs.value[index] = el;
  }
};

// Animation methods
const animateAll = () => {
  letterRefs.value.forEach(letter => {
    if (letter) {
      letter.animateMouth();
      letter.blink();
      letter.wave();
    }
  });
};

const animateSequential = async () => {
  for (let i = 0; i < letterRefs.value.length; i++) {
    const letter = letterRefs.value[i];
    if (letter) {
      await new Promise<void>((resolve) => {
        Promise.all([
          letter.animateMouth() || Promise.resolve(),
          letter.blink() || Promise.resolve()
        ]).then(() => {
          setTimeout(resolve, 100);
        });
      });
    }
  }
};

const resetAll = () => {
  letterRefs.value.forEach(letter => {
    // Reset logic if needed
    if (letter) {
      const mouthParams = letterOptions.mouthParams || { openness: 0.1, mood: 0.7 };
      letter.updateMouthShape(mouthParams);
    }
  });
};

// Check if a letter is supported by the library
const isSupportedLetter = (char: string): boolean => {
  // This list should match the available letters in the library
  const supportedLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  return supportedLetters.includes(char);
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

.text-input, .appearance-controls, .actions {
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
  width: 200px;
  font-size: 16px;
  padding: 5px 10px;
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

.word-display {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  margin-top: 20px;
}

.letters {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 5px;
  align-items: flex-end;
}

.letter {
  display: inline-block;
}

.letter :deep(svg) {
  height: 120px;
  width: auto;
}

.unsupported {
  font-size: 80px;
  color: #ccc;
  margin: 0 5px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
</style>