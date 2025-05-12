import { defineConfig } from "vite";
import path from "path";
import dts from "vite-plugin-dts";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [
    // Add Vue plugin to process Vue components
    vue(),
    
    // Generate TypeScript declaration files
    dts({
      insertTypesEntry: true,
      // Include both entry points for type generation
      include: ["src/**/*.ts", "src/**/*.vue"],
      // Properly handle .vue files in declaration output
      beforeWriteFile: (filePath, content) => {
        return {
          filePath: filePath,
          content: content,
        };
      }
    }),
  ],
  build: {
    lib: {
      // Define both entry points
      entry: {
        'letterpeople': path.resolve(__dirname, "src/index.ts"),
        'letterpeople-vue': path.resolve(__dirname, "src/vue/index.ts"),
      },
      formats: ["es", "umd"],
      // The fileName callback creates separate files for each entry point
      fileName: (format, entryName) => `${entryName}.${format}.js`,
    },
    rollupOptions: {
      // Make Vue a peer dependency so it's not bundled with the library
      external: ['vue'],
      output: {
        // Provide global variable names for external dependencies
        globals: {
          vue: 'Vue'
        },
      },
    },
    sourcemap: true, // Generate source maps for debugging
  },
  server: {
    open: true, // Automatically open the browser
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, "./src"),
    },
  },
  // Configure root directory for dev server
  root: path.resolve(__dirname, "dev"),
});