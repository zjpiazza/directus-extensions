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
    return null;
  }

  // Find the index of this workflow in the available workflows list
  const index = workflows.value.findIndex((w: any) => w.id === props.data.targetWorkflowId);

  if (index === -1) {
    return null;
  }

  // Convert index to letter (0=A, 1=B, 2=C, etc.)
  return String.fromCharCode(65 + index);
});

const emit = defineEmits<{ navigate: [workflowId: string]; }>();

const handleEndNodeClick = () => {
  // Only allow navigation in view mode
  if (!isEditMode.value && props.data.targetWorkflowId) {
    emit('navigate', props.data.targetWorkflowId);
  }
};
</script>

<template>
  <div class="end-node">
    <Handle id="top" type="source" :position="Position.Top" :is-connectable="true" />
    <Handle id="left" type="source" :position="Position.Left" :is-connectable="true" />
    <div
      class="terminal-shape"
      :class="{ 'linked': !!props.data.targetWorkflowId }"
      @click="handleEndNodeClick"
      :title="!isEditMode && props.data.targetWorkflowId ? 'Click to navigate to workflow' : ''"
    >
      <span class="node-label">{{ props.data.label }}</span>
      <div v-if="getWorkflowLetter" class="workflow-indicator">
        <span class="workflow-letter">{{ getWorkflowLetter }}</span>
      </div>
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
  background: #dc2626;
  border: 2px solid #dc2626;
  border-radius: 50%;
  width: 100px;
  height: 100px;
  text-align: center;
  box-sizing: border-box;
  transition: background .2s ease, border-color .2s ease, transform .15s ease;
  position: relative;
}

.terminal-shape.linked {
  background: #7c2d12;
  border-color: #7c2d12;
}

.terminal-shape:hover {
  transform: translateY(-2px);
  background: #b91c1c;
  border-color: #b91c1c;
}

.terminal-shape.linked:hover {
  background: #5a1f0a;
  border-color: #5a1f0a;
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

.workflow-indicator {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 24px;
  height: 24px;
  background: #2563eb;
  border: 2px solid #ffffff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.workflow-letter {
  font-size: 12px;
  font-weight: 700;
  color: #ffffff;
  text-shadow: 0 1px 1px rgba(0,0,0,0.3);
  letter-spacing: 0;
  line-height: 1;
}
</style>