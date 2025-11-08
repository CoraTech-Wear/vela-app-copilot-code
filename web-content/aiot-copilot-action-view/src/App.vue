<script setup lang="ts">
import { sendMessage } from './vscode';
sendMessage('LOADED_PROMPT', { data: 'Action View loaded.' });
   
</script>

<template>
<div class="view-container">
  <p>下午好, 2minRain</p>
</div>
</template>

<style scoped>
.view-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: left;
  width: 100%;
}
</style>