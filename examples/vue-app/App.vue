<template>
  <div>
    <header>
      <h1>LetterPerson Vue Examples</h1>
    </header>
    <div class="container">
      <div class="nav">
        <div 
          v-for="(example, index) in examples" 
          :key="index"
          @click="currentExample = index" 
          :class="['nav-item', { active: currentExample === index }]"
        >
          {{ example.name }}
        </div>
      </div>
      
      <div class="example-container">
        <div class="example-title">
          {{ examples[currentExample].name }}
        </div>
        <div class="example-content">
          <component :is="examples[currentExample].component" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import BasicUsage from '../vue/BasicUsage.vue';
import WordExample from '../vue/WordExample.vue';
import DirectIntegration from '../vue/DirectIntegration.vue';

// Define available examples
const examples = [
  { name: 'Basic Usage', component: BasicUsage },
  { name: 'Word Example', component: WordExample },
  { name: 'Direct Integration', component: DirectIntegration }
];

const currentExample = ref(0);
</script>

<style scoped>
/* Additional styles specific to App.vue can go here */
</style>