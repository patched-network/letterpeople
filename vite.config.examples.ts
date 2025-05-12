import { defineConfig } from "vite";
import path from "path";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  
  // Define the root directory for this specific Vite instance
  root: path.resolve(__dirname, "examples/vue-app"),
  
  // Configure dev server
  server: {
    port: 3030,
    open: true,
  },

  // Configure build
  build: {
    outDir: '../../examples-dist',
    emptyOutDir: true,
  },
  
  // Configure resolve to find our local modules
  resolve: {
    alias: {
      '@': path.resolve(__dirname, "src"),
      
      // This allows us to import our local Vue components without publishing
      'letterpeople/vue': path.resolve(__dirname, "src/vue"),
      'letterpeople': path.resolve(__dirname, "src"),
    }
  }
});