<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core';
import type { NodeProps } from '@vue-flow/core';
import { inject, computed } from 'vue';
import { WORKFLOWS_KEY, IS_EDIT_MODE_KEY } from '../constants/injection-keys';

interface Data { label: string; description?: string; targetWorkflowId?: string; }
const props = defineProps<NodeProps<Data>>();
const workflowsRef = inject<any>(WORKFLOWS_KEY, []);
const isEditMode = inject<any>(IS_EDIT_MODE_KEY, true);
const workflows = computed(() => Array.isArray(workflowsRef) ? workflowsRef : workflowsRef?.value || []);

const getWorkflowLetter = computed(() => {
  if (!props.data.targetWorkflowId) {
    return '?';
  }
  
  // Find the index of this workflow in the available workflows list
  const index = workflows.value.findIndex((w: any) => w.id === props.data.targetWorkflowId);
  
  if (index === -1) {
    return '?';
  }
  
  // Convert index to letter (0=A, 1=B, 2=C, etc.)
  return String.fromCharCode(65 + index);
});

const emit = defineEmits<{ navigate: [workflowId: string]; }>();

const handlePentagonClick = () => {
  // Only allow navigation in view mode
  if (!isEditMode.value && props.data.targetWorkflowId) {
    emit('navigate', props.data.targetWorkflowId);
  }
};
</script>

<template>
  <div class="offpage-node">
    <Handle id="top" type="source" :position="Position.Top" :is-connectable="true" />
    <Handle id="left" type="source" :position="Position.Left" :is-connectable="true" />
    <div 
      class="glass-pentagon"
      :class="{ 
        'clickable': !isEditMode.value && props.data.targetWorkflowId,
        'view-mode': !isEditMode.value
      }"
      @click="handlePentagonClick"
      :title="!isEditMode.value && props.data.targetWorkflowId ? 'Click to navigate to workflow' : ''"
    >
      <!-- Background gradient -->
      <div class="pentagon-background" :class="{ 'view-mode': !isEditMode.value }"></div>
      <!-- Content overlay -->
      <div class="pentagon-overlay">
        <span class="node-letter">{{ getWorkflowLetter }}</span>
      </div>
    </div>
    <Handle id="right" type="source" :position="Position.Right" :is-connectable="true" />
    <Handle id="bottom" type="source" :position="Position.Bottom" :is-connectable="true" />
  </div>
</template>

<style scoped>
.offpage-node { 
  position: relative; 
  display: inline-flex; 
  align-items: center; 
  justify-content: center; 
}

.glass-pentagon {
  position: relative;
  width: 40px;
  height: 32px;
  clip-path: polygon(0% 0%, 100% 0%, 100% 75%, 50% 100%, 0% 75%);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 8px;
  overflow: hidden;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.2);
  transition: all 0.3s ease;
}

.glass-pentagon.clickable {
  cursor: pointer;
}

.glass-pentagon:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 32px rgba(0,0,0,0.15);
}

.pentagon-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #475569dd, #475569aa);
  opacity: 0.9;
}

.pentagon-background.view-mode {
  background: linear-gradient(135deg, #0066ccdd, #0066ccaa);
}

.pentagon-overlay {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: #ffffff;
}

.node-letter {
  font-size: 20px;
  font-weight: 700;
  color: #ffffff;
  text-shadow: 0 1px 3px rgba(0,0,0,0.3);
  letter-spacing: 0;
  line-height: 1;
}
</style>
