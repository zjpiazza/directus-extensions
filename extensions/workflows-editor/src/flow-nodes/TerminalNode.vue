<script setup lang="ts">
import { computed, inject } from 'vue';
import { Handle, Position } from '@vue-flow/core';
import type { NodeProps } from '@vue-flow/core';
import { IS_EDIT_MODE_KEY } from '../constants/injection-keys';

interface Data { 
  label: string; 
  description?: string;
  nodeSize?: 'small' | 'medium' | 'large' | 'custom';
  customWidth?: number;
  customHeight?: number;
}
const props = defineProps<NodeProps<Data>>();

const isEditMode = inject(IS_EDIT_MODE_KEY, false);

const nodeStyle = computed(() => {
  const size = props.data.nodeSize || 'medium';
  
  // If custom size, use custom dimensions (keep circular)
  if (size === 'custom') {
    const dimension = Math.min(props.data.customWidth || 100, props.data.customHeight || 100);
    return {
      width: `${dimension}px`,
      height: `${dimension}px`
    };
  }
  
  // Otherwise use preset sizes
  const sizes = {
    small: { width: '60px', height: '60px' },
    medium: { width: '100px', height: '100px' },
    large: { width: '140px', height: '140px' }
  };
  
  return sizes[size as 'small' | 'medium' | 'large'] || sizes.medium;
});
</script>

<template>
  <div class="terminal-node">
    <Handle id="top" type="source" :position="Position.Top" :is-connectable="true" />
    <Handle id="left" type="source" :position="Position.Left" :is-connectable="true" />
    <div class="terminal-shape" :style="nodeStyle">
      <span class="node-label">{{ props.data.label }}</span>
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

.terminal-shape {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0284c7;
  border: 2px solid #0284c7;
  border-radius: 50%;
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

.terminal-shape:hover { transform: translateY(-2px); background: #0369a1; border-color: #0369a1; }
</style>
