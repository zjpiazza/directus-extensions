<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core';
import type { NodeProps } from '@vue-flow/core';

interface Data { label: string; description?: string; }
const props = defineProps<NodeProps<Data>>();
</script>

<template>
  <div class="terminal-node">
    <Handle id="top" type="source" :position="Position.Top" :is-connectable="true" />
    <Handle id="left" type="source" :position="Position.Left" :is-connectable="true" />
    <div class="glass-terminal">
      <!-- Background gradient -->
      <div class="terminal-background"></div>
      <!-- Content overlay -->
      <div class="terminal-overlay">
        <span class="node-label">{{ props.data.label }}</span>
      </div>
    </div>
    <Handle id="right" type="source" :position="Position.Right" :is-connectable="true" />
    <Handle id="bottom" type="source" :position="Position.Bottom" :is-connectable="true" />
  </div>
</template>

<style scoped>
.terminal-node {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.glass-terminal {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  width: 100px;
  height: 100px;
  overflow: hidden;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.2);
  transition: all 0.3s ease;
}

.glass-terminal:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 32px rgba(0,0,0,0.15);
}

.terminal-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #0284c7dd, #0284c7aa);
  opacity: 0.9;
}

.terminal-overlay {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: #ffffff;
}

.node-label { 
  font-size: 11px; 
  font-weight: 600; 
  color: #ffffff; 
  text-shadow: 0 1px 3px rgba(0,0,0,0.3); 
  line-height: 1.1;
  text-align: center;
  max-width: 70px;
  padding: 0 5px;
}
</style>
