<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core';
import type { NodeProps } from '@vue-flow/core';

interface Data { 
  label: string; 
  description?: string; 
  nodeSize?: 'small' | 'medium' | 'large';
}
const props = defineProps<NodeProps<Data>>();

import { computed } from 'vue';

const nodeStyle = computed(() => {
  const size = props.data.nodeSize || 'medium';
  const sizes = {
    small: { width: '100px', height: '100px' },
    medium: { width: '136px', height: '136px' },
    large: { width: '180px', height: '180px' }
  };
  return sizes[size];
});
</script>

<template>
  <div class="decision-node">
    <Handle id="top" type="source" :position="Position.Top" :is-connectable="true" />
    <Handle id="left" type="source" :position="Position.Left" :is-connectable="true" />
     <div class="glass-diamond" :style="nodeStyle">
      <!-- Background gradient -->
      <div class="diamond-background"></div>
      <!-- Content overlay -->
      <div class="diamond-overlay">
        <span class="node-label">{{ props.data.label }}</span>
      </div>
    </div>
    <Handle id="right" type="source" :position="Position.Right" :is-connectable="true" />
    <Handle id="bottom" type="source" :position="Position.Bottom" :is-connectable="true" />
  </div>
</template>

<style scoped>
.decision-node { 
  position: relative; 
  display: inline-flex; 
  align-items: center; 
  justify-content: center; 
}

.glass-diamond {
  position: relative;
  clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 14px;
  overflow: hidden;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.2);
  transition: all 0.3s ease;
}

.glass-diamond:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 32px rgba(0,0,0,0.15);
}

.diamond-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #d97706dd, #d97706aa);
  opacity: 0.9;
}

.diamond-overlay {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: #ffffff;
}

.node-label { 
  font-size: 12px; 
  font-weight: 600; 
  color: #ffffff; 
  white-space: normal; 
  word-wrap: break-word;
  word-break: break-word;
  overflow-wrap: break-word;
  max-width: 84px; 
  text-align: center; 
  line-height: 1.2; 
  text-shadow: 0 1px 3px rgba(0,0,0,0.3); 
}
</style>
