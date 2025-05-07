# GitHub Pages for LetterPeople

This document describes the GitHub Pages setup for the LetterPeople project.

## Overview

We use GitHub Pages to host a demo version of the LetterPeople library. This demo is automatically built and deployed whenever changes are pushed to the `main` branch.

## Configuration

The GitHub Pages deployment is configured via:

1. A specialized Vite config (`vite.config.demo.ts`) that builds the demo app
2. GitHub Actions workflow (`.github/workflows/deploy.yml`) that handles CI/CD

## How It Works

1. When code is pushed to the `main` branch, the GitHub Actions workflow is triggered
2. The workflow builds both the library (`yarn build`) and the demo (`yarn build:demo`)
3. The demo build output (`demo-dist` directory) is deployed to GitHub Pages
4. The demo is accessible at `https://<username>.github.io/letterpeople/`

## Local Development

To build and preview the demo locally:

```bash
# Install dependencies
yarn install

# Build the library first
yarn build

# Build the demo
yarn build:demo

# Preview the demo (requires a local server)
# Example using npx serve:
npx serve demo-dist
```

## Customization

If you need to change the deployment configuration:

- To modify the base URL path, update the `base` property in `vite.config.demo.ts`
- To change the build output directory, update the `outDir` property in `vite.config.demo.ts` and the artifact path in `.github/workflows/deploy.yml`
- To deploy from a different branch, update the `branches` list in the `on.push` section of `.github/workflows/deploy.yml`

## Troubleshooting

If the deployment fails:

1. Check the GitHub Actions logs for errors
2. Verify that the `demo-dist` directory is being created correctly
3. Make sure the GitHub Pages settings in the repository are configured to deploy from GitHub Actions