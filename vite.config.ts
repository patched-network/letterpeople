import { defineConfig } from "vite";
import path from "path";
import dts from "vite-plugin-dts";
import vue from "@vitejs/plugin-vue";

// Create separate configs for core and Vue builds
const baseConfig = {
  plugins: [
    dts({
      insertTypesEntry: true,
    }),
  ],
  build: {
    sourcemap: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, "./src"),
    },
  },
  server: {
    open: true,
  },
  root: path.resolve(__dirname, "dev"),
};

// We need to use command to determine if we're building core or Vue
export default defineConfig(({ command }) => {
  // If we're in serve mode, return the dev config
  if (command === 'serve') {
    return baseConfig;
  }

  // Otherwise, determine which build to run based on env variable
  const buildTarget = process.env.BUILD_TARGET || 'core';
  
  if (buildTarget === 'vue') {
    // Vue integration build
    return {
      ...baseConfig,
      plugins: [
        vue(),
        dts({
          insertTypesEntry: true,
          include: ["src/vue/**/*.ts", "src/vue/**/*.vue"],
          outDir: 'dist/vue',
        }),
      ],
      build: {
        ...baseConfig.build,
        lib: {
          entry: path.resolve(__dirname, "src/vue/index.ts"),
          name: "LetterPeopleVue",
          fileName: (format) => `letterpeople-vue.${format}.js`,
          formats: ["es", "umd"],
        },
        rollupOptions: {
          external: ['vue'],
          output: {
            exports: "named",
            globals: {
              vue: 'Vue'
            },
          },
        },
        outDir: 'dist',
      },
    };
  }
  
  // Default core build
  return {
    ...baseConfig,
    plugins: [
      dts({
        insertTypesEntry: true,
        include: ["src/**/*.ts", "!src/vue/**/*.ts", "!src/vue/**/*.vue"],
        outDir: 'dist',
      }),
    ],
    build: {
      ...baseConfig.build,
      lib: {
        entry: path.resolve(__dirname, "src/index.ts"),
        name: "LetterPeople",
        fileName: (format) => `letterpeople.${format}.js`,
        formats: ["es", "umd"],
      },
      rollupOptions: {
        output: {
          exports: "named",
          globals: {},
        },
      },
      outDir: 'dist',
    },
  };
});