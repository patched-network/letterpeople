import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  // Define the base path for GitHub Pages
  // This should match your repo name if not using a custom domain
  base: '/letterpeople/',
  
  build: {
    // Output to the 'demo-dist' directory to keep separate from library build
    outDir: 'demo-dist',
    
    // Enable source maps for easier debugging
    sourcemap: true,
    
    // Don't clean the output directory as we'll handle that separately
    emptyOutDir: true,
    
    // Configure the entry point to be the dev/index.html file
    rollupOptions: {
      input: path.resolve(__dirname, 'dev/index.html'),
    }
  },
  
  // Use index.html from the dev directory
  publicDir: false,
  
  resolve: {
    alias: {
      // Makes imports cleaner
      "@": path.resolve(__dirname, "./src"),
    },
  }
});