<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core';
import type { NodeProps } from '@vue-flow/core';

interface Data { label: string; description?: string; }
const props = defineProps<NodeProps<Data>>();
</script>

<template>
  <div class="start-node">
    <Handle id="top" type="source" :position="Position.Top" :is-connectable="true" />
    <Handle id="left" type="source" :position="Position.Left" :is-connectable="true" />
    <div class="terminal-shape">
      <span class="node-label">{{ props.data.label }}</span>
    </div>
    <Handle id="right" type="source" :position="Position.Right" :is-connectable="true" />
    <Handle id="bottom" type="source" :position="Position.Bottom" :is-connectable="true" />
  </div>
</template>

<style scoped>
.start-node {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.terminal-shape {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #16a34a;
  border: 2px solid #16a34a;
  border-radius: 50%;
  width: 100px;
  height: 100px;
  text-align: center;
  box-sizing: border-box;
  transition: background .2s ease, border-color .2s ease, transform .15s ease;
}

.node-label { 
  font-size: 11px; 
  font-weight: 500; 
  color: #ffffff; 
  text-shadow: 0 1px 1px rgba(0,0,0,0.3); 
  line-height: 1.1;
  text-align: center;
  max-width: 70px;
  padding: 0 5px;
}

.terminal-shape:hover { transform: translateY(-2px); background: #15803d; border-color: #15803d; }
</style>