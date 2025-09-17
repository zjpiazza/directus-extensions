<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core';
import type { NodeProps } from '@vue-flow/core';

interface Data { label: string; description?: string; }
const props = defineProps<NodeProps<Data>>();
</script>

<template>
  <div class="decision-node">
    <Handle id="top" type="source" :position="Position.Top" :is-connectable="true" />
    <Handle id="left" type="source" :position="Position.Left" :is-connectable="true" />
    <div class="diamond-shape">
      <span class="node-label">{{ props.data.label }}</span>
    </div>
    <Handle id="right" type="source" :position="Position.Right" :is-connectable="true" />
    <Handle id="bottom" type="source" :position="Position.Bottom" :is-connectable="true" />
  </div>
</template>

<style scoped>
.decision-node { position: relative; display: inline-flex; align-items: center; justify-content: center; }

.diamond-shape {
  width: 136px;
  height: 136px;
  background: #d97706;
  border: 2px solid #d97706;
  clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 8px 14px;
  transition: background .2s ease, border-color .2s ease, transform .15s ease;
}

.node-label { 
  font-size: 12px; 
  font-weight: 500; 
  color: #ffffff; 
  white-space: normal; 
  word-wrap: break-word;
  word-break: break-word;
  overflow-wrap: break-word;
  max-width: 84px; 
  text-align: center; 
  line-height: 1.2; 
  text-shadow: 0 1px 1px rgba(0,0,0,0.25); 
}

.diamond-shape:hover { transform: translateY(-2px); background: #b45309; border-color: #b45309; }
</style>
