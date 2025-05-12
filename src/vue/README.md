# Vue Integration for LetterPeople

This directory contains Vue 3 integration components for the LetterPeople library. These components make it easy to use animated letters in your Vue applications.

## Installation

First, install the `letterpeople` package:

```bash
# npm
npm install letterpeople

# yarn
yarn add letterpeople

# pnpm
pnpm add letterpeople
```

## Usage

### Using the LetterPerson Component

Import the component from the Vue entry point:

```vue
<template>
  <div>
    <LetterPerson
      letter="L"
      :options="letterOptions"
      ref="letterRef"
      @created="onLetterCreated"
    />
    <button @click="animateLetter">Animate</button>
  </div>
</template>

<script setup>
import LetterPerson from 'letterpeople/vue';
import { ref, reactive } from 'vue';

// Access the component's methods via template ref
const letterRef = ref(null);

// Configure letter options
const letterOptions = reactive({
  color: '#add8e6',
  lineWidth: 25,
  borderColor: '#333333',
  borderWidth: 4,
  mouthParams: {
    openness: 0.2,
    mood: 0.7
  }
});

// Event handler when letter is created
const onLetterCreated = (instance) => {
  console.log('Letter instance created', instance);
};

// Animation function
const animateLetter = () => {
  letterRef.value?.animateMouth();
  letterRef.value?.blink();
};
</script>
```

### TypeScript Support

For TypeScript users, you can import the types:

```vue
<script setup lang="ts">
import LetterPerson, { 
  type LetterPersonRef, 
  type LetterOptions 
} from 'letterpeople/vue';
import { ref, reactive } from 'vue';

const letterRef = ref<LetterPersonRef | null>(null);
const letterOptions = reactive<LetterOptions>({
  // options...
});
</script>
```

## API Reference

### LetterPerson Component

#### Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `letter` | `string` | (required) | The letter to display (must be a single character) |
| `options` | `LetterOptions` | `{}` | Configuration options for the letter |

#### Events

| Name | Payload | Description |
|------|--------|-------------|
| `created` | `LetterInstance` | Emitted when the letter instance is created |
| `destroyed` | - | Emitted when the letter instance is destroyed |

#### Exposed Methods

| Method | Parameters | Return | Description |
|--------|------------|--------|-------------|
| `animateMouth` | `options?: object` | `Promise<void>` | Animates the mouth speaking |
| `blink` | `options?: object` | `Promise<void>` | Animates the eyes blinking |
| `wave` | `options?: object` | `Promise<void>` | Animates the arms waving |
| `updateMouthShape` | `{ openness?: number, mood?: number }` | `void` | Updates the mouth shape |
| `getLetter` | - | `LetterInstance \| null` | Gets the underlying letter instance |

## Examples

See the `examples/vue` directory for more usage examples.