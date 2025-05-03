import { defineConfig } from "vite";
import path from "path";
import dts from "vite-plugin-dts"; // You might need: yarn add -D vite-plugin-dts

export default defineConfig({
  plugins: [
    dts({
      // Generates .d.ts files correctly in dist
      insertTypesEntry: true,
    }),
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "AnimatedLetters", // Global variable name for UMD build
      fileName: (format) => `animated-letters.${format}.js`,
      formats: ["es", "umd"], // Output formats
    },
    rollupOptions: {
      // Make sure to externalize deps that shouldn't be bundled
      // into your library (if any, e.g., if animejs is a peer dep)
      // external: ['animejs'],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          // animejs: 'anime' // If animejs were external
        },
      },
    },
    sourcemap: true, // Generate source maps for debugging
  },
  // Configure dev server to use the 'dev' directory
  server: {
    open: "/dev/index.html", // Automatically open this file
  },
  resolve: {
    alias: {
      // Optional: makes imports cleaner
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
