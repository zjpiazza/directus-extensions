<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core';
import type { NodeProps } from '@vue-flow/core';

interface Data { label: string; description?: string; }
const props = defineProps<NodeProps<Data>>();
</script>

<template>
  <div class="end-node">
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
.end-node {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.terminal-shape {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 16px;
  background: #dc2626;
  border: 2px solid #dc2626;
  border-radius: 14px;
  width: 160px;
  min-height: 56px;
  text-align: center;
  transition: background .2s ease, border-color .2s ease, transform .15s ease;
}

.node-label { 
  font-size: 14px; 
  font-weight: 500; 
  color: #ffffff; 
  white-space: normal;
  word-wrap: break-word;
  word-break: break-word;
  overflow-wrap: break-word; 
  text-shadow: 0 1px 1px rgba(0,0,0,0.3); 
  line-height: 1.3;
  text-align: center;
}

.terminal-shape:hover { transform: translateY(-2px); background: #b91c1c; border-color: #b91c1c; }
</style>