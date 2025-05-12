# LetterPeople

LetterPeople is a TypeScript library that creates animated letter characters with facial features. The library renders letters as SVG elements with attachments like eyes and mouths that can be animated (blinking, speaking, etc.).

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
```

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
