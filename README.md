# LetterPeople

Animated letter characters with facial features.

Renders letters as SVG elements with attachments like eyes and mouths that can be animated (blinking, looking, speaking, etc.).

## Demo

You can see LetterPeople in action on our [GitHub Pages demo site](https://username.github.io/letterpeople/).

## Installation

```bash
yarn add letterpeople
```

### Vue Integration

LetterPeople includes a Vue 3 integration. Import Vue components from the `/vue` subpath:

```js
import LetterPerson from 'letterpeople/vue';
```

See the [examples directory](./examples) for Vue usage examples.

## Usage

```typescript
import { createLetter } from 'letterpeople';

// Create a container element
const container = document.createElement('div');
document.body.appendChild(container);

// Create an animated letter
const letterL = createLetter('L', container, {
  color: '#add8e6',
  lineWidth: 25,
  borderColor: '#333333',
  borderWidth: 4,
  mouthParams: {
    openness: 0.1,
    mood: 0.7
  }
});

// Animate the letter
letterL.mouth.animateSpeak();
letterL.eyes.blink();
letterL.eyes.lookAt(45); // Look at 45 degree angle
letterL.eyes.lookAt({x: 5, y: -2}); // Look at specific coordinates
letterL.eyes.startTracking({intensity: 0.7}); // Follow the cursor with 70% intensity
letterL.eyes.stopTracking(); // Stop following the cursor
```

## Features

- SVG-based letter rendering with clean scaling
- Animated facial features (eyes, mouth)
- Interactive eye tracking that follows the cursor
- Arm animations
- Vue 3 component integration
- Typescript support

## Development

```bash
# Install dependencies
yarn install

# Start the development server
yarn dev

# Build for production
yarn build

# Run Vue examples
yarn examples
```

## GitHub Pages

This project is set up with GitHub Pages deployment. See [GITHUB-PAGES.md](GITHUB-PAGES.md) for details.
