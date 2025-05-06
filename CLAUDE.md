# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

LetterPeople is a TypeScript library that creates animated letter characters with facial features. The library renders letters as SVG elements with attachments like eyes and mouths that can be animated (blinking, speaking, etc.).

## Common Development Commands

```bash
# Start development server
yarn dev

# Build the library for production
yarn build
```

## Architecture

The project is structured as follows:

1. **Core Module (`src/index.ts`)**: Entry point that exports the `createLetter` function for creating letter instances with attachments.

2. **Letter Renderers (`src/letters/*.ts`)**: Each file defines how to render a specific letter (currently L-uppercase.ts), providing the SVG path and attachment points.

3. **Attachments (`src/attachments/*.ts`)**: 
   - `BaseController.ts`: Base class for all attachment controllers
   - `eye.ts`: Eye attachment implementation with wink/blink animations
   - `mouth.ts`: Mouth attachment with morphing capabilities (smile/frown/speak)
   - `types.ts`: Type definitions for attachments including BaseAttachment interface

4. **Type Definitions (`src/types.ts`)**: Core type definitions including LetterInstance, LetterOptions, and attachment coordinate types.

5. **Development Environment (`dev/`)**: Contains a test harness for visualizing and working with the letters.

## Key Components and Patterns

1. **Letter Instance**: Each rendered letter is represented by a `LetterInstance` object that provides access to the SVG element and attachment controllers.

2. **Attachment Controllers**: Controllers like `MouthAttachment` and `EyesAttachment` provide APIs for animating parts of the letter.

3. **Animation Flow**: The library uses `animejs` for animations, with each controller managing its own animation state.

## Important Implementation Details

1. **Attachment Points**: Letters define attachment coordinates for eyes, mouth, arms, legs, etc., which are used to position attachments.

2. **Animation System**: Uses anime.js for smooth animations with configurable parameters like duration, easing, etc.

3. **Morphing Mouth**: The mouth attachment uses Bezier curves to morph between different shapes based on openness and mood parameters.

4. **Eye System**: The eyes controller manages both individual eyes and provides coordinated animations like blinking.

5. **Controller Inheritance**: All attachment controllers extend the `BaseController` which provides common functionality for visibility, animation state, etc.