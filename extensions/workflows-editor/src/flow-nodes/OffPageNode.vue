<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core';
import type { NodeProps } from '@vue-flow/core';
import { inject, computed } from 'vue';

interface Data {
  label: string;
  description?: string;
  targetWorkflowId?: string;
}

const WORKFLOWS_KEY = Symbol('workflows-list');

const props = defineProps<NodeProps<Data>>();

const workflows = inject<any[]>(WORKFLOWS_KEY, []);

const PLACEHOLDER = 'Off-page Link';
const targetName = computed(() => {
  if (!props.data.targetWorkflowId) return PLACEHOLDER;
  return workflows.find(w => w.id === props.data.targetWorkflowId)?.name || PLACEHOLDER;
});

const emit = defineEmits<{
  navigate: [workflowId: string];
}>();

const handleNavigate = () => {
  if (props.data.targetWorkflowId) {
    emit('navigate', props.data.targetWorkflowId);
  }
};
</script>

<template>
  <div class="offpage-node">
    <Handle id="top" type="target" :position="Position.Top" :is-connectable="true" />
    <Handle id="left" type="target" :position="Position.Left" :is-connectable="true" />
    <div class="node-content">
      <div class="pentagon-shape">
        <span class="node-icon">↗</span>
        <span class="node-label">{{ targetName }}</span>
        <button
          v-if="props.data.targetWorkflowId"
          class="navigate-btn"
          @click="handleNavigate"
          title="Go to workflow"
        >↪</button>
      </div>
    </div>
    <Handle id="right" type="source" :position="Position.Right" :is-connectable="true" />
    <Handle id="bottom" type="source" :position="Position.Bottom" :is-connectable="true" />
  </div>
</template>

<style scoped>
.offpage-node {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.node-content {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
}

.pentagon-shape {
  position: relative;
  width: 180px;
  height: 70px;
  background: #475569;
  border: 2px solid #475569;
  clip-path: polygon(0% 0%, 100% 0%, 100% 70%, 50% 100%, 0% 70%);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 10px;
  transition: background .2s ease, border-color .2s ease, transform .15s ease;
}

.node-icon {
  font-size: 16px;
  flex-shrink: 0;
  color: #ffffff;
}

.node-label {
  font-size: 11px;
  font-weight: 600;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  text-align: center;
  text-shadow: 0 1px 1px rgba(0,0,0,0.25);
  letter-spacing: .25px;
}

.navigate-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 2px;
  border-radius: 2px;
  font-size: 12px;
  opacity: 0.7;
  transition: opacity 0.2s ease;
}

.navigate-btn:hover {
  opacity: 1;
  background: rgba(51, 65, 85, 0.12);
}

.pentagon-shape:hover {
  transform: translateY(-2px);
  background: #334155;
  border-color: #334155;
}

.offpage-select {
  margin-top: 4px;
  display: flex;
  justify-content: center;
}
.offpage-select select {
  font-size: 11px;
  padding: 2px 4px;
  border-radius: 4px;
  border: 1px solid #475569;
  background: #fff;
  color: #1e293b;
  max-width: 170px;
}
</style>
