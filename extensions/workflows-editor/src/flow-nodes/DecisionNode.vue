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
  
  // If custom size, use custom dimensions
  if (size === 'custom') {
    const dimension = Math.min(props.data.customWidth || 136, props.data.customHeight || 136);
    return {
      width: `${dimension}px`,
      height: `${dimension}px`
    };
  }
  
  // Otherwise use preset sizes
  const sizes = {
    small: { width: '100px', height: '100px' },
    medium: { width: '136px', height: '136px' },
    large: { width: '180px', height: '180px' }
  };
  
  return sizes[size as 'small' | 'medium' | 'large'] || sizes.medium;
});
</script>

<template>
  <div class="decision-node">
    <Handle id="top" type="source" :position="Position.Top" :is-connectable="true" />
    <Handle id="left" type="source" :position="Position.Left" :is-connectable="true" />
     <div class="diamond-shape" :style="nodeStyle">
      <span class="node-label">{{ props.data.label }}</span>
    </div>
    <Handle id="right" type="source" :position="Position.Right" :is-connectable="true" />
    <Handle id="bottom" type="source" :position="Position.Bottom" :is-connectable="true" />
  </div>
</template>

<style scoped>
.decision-node { position: relative; display: inline-flex; align-items: center; justify-content: center; }

.diamond-shape {
  /* Dynamic width and height are now set via :style binding */
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
