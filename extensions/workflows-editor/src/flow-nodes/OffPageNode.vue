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
    <Handle id="top" type="target" :position="Position.Top" :is-connectable="true" />
    <Handle id="left" type="target" :position="Position.Left" :is-connectable="true" />
    <div 
      class="pentagon-shape"
      :class="{ 
        'clickable': !isEditMode.value && props.data.targetWorkflowId,
        'view-mode': !isEditMode.value
      }"
      @click="handlePentagonClick"
      :title="!isEditMode.value && props.data.targetWorkflowId ? 'Click to navigate to workflow' : ''"
    >
      <span class="node-letter">{{ getWorkflowLetter }}</span>
    </div>
    <Handle id="right" type="source" :position="Position.Right" :is-connectable="true" />
    <Handle id="bottom" type="source" :position="Position.Bottom" :is-connectable="true" />
  </div>
</template>

<style scoped>
.offpage-node { position: relative; display: inline-flex; align-items: center; justify-content: center; }

.pentagon-shape {
  position: relative;
  width: 40px;
  height: 32px;
  background: #475569;
  border: 2px solid #475569;
  clip-path: polygon(0% 0%, 100% 0%, 100% 75%, 50% 100%, 0% 75%);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 8px;
  transition: background .2s ease, border-color .2s ease, transform .15s ease;
}

.pentagon-shape.clickable {
  cursor: pointer;
}

.pentagon-shape.clickable:hover {
  transform: translateY(-2px);
  background: #334155;
  border-color: #334155;
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}

.pentagon-shape.view-mode {
  background: #0066cc;
  border-color: #0066cc;
}

.pentagon-shape.view-mode.clickable:hover {
  background: #0052a3;
  border-color: #0052a3;
}

.node-letter {
  font-size: 20px;
  font-weight: 700;
  color: #ffffff;
  text-shadow: 0 1px 2px rgba(0,0,0,0.3);
  letter-spacing: 0;
  line-height: 1;
}
</style>
