<script setup lang="ts">
import { computed } from 'vue';
import { Handle, Position } from '@vue-flow/core';
import type { NodeProps } from '@vue-flow/core';

interface Data {
  label: string;
  description?: string;
  subtype?: 'task' | 'form';
  targetCollection?: string;
  formLabel?: string;
  openCollection?: (collectionName: string) => void;
}

const props = defineProps<NodeProps<Data>>();

const handleOpenCollection = () => {
  if (props.data.subtype === 'form' && props.data.targetCollection && props.data.openCollection) {
    props.data.openCollection(props.data.targetCollection);
  }
};

const nodeIcon = computed(() => (props.data.subtype === 'form' ? 'description' : 'task'));
const nodeColor = computed(() => (props.data.subtype === 'form' ? '#7c3aed' : '#2563eb'));

const displayLabel = computed(() => {
  if (props.data.subtype === 'form' && props.data.formLabel) return props.data.formLabel;
  return props.data.label;
});
</script>

<template>
  <div class="process-node">
    <Handle id="top" type="target" :position="Position.Top" :is-connectable="true" />
    <Handle id="left" type="target" :position="Position.Left" :is-connectable="true" />
    <div class="process-shape" :style="{ borderColor: nodeColor, background: nodeColor }">
      <v-icon class="node-icon" :name="nodeIcon" />
      <span class="node-label">{{ displayLabel }}</span>
      <button
        v-if="props.data.subtype === 'form' && props.data.targetCollection"
        class="open-collection-btn"
        @click="handleOpenCollection"
        title="Open collection"
      >
        <v-icon name="open_in_new" />
      </button>
    </div>
    <Handle id="right" type="source" :position="Position.Right" :is-connectable="true" />
    <Handle id="bottom" type="source" :position="Position.Bottom" :is-connectable="true" />
  </div>
</template>

<style scoped>
.process-node {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.process-shape {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #eff6ff;
  border: 2px solid;
  border-radius: 0;
  min-width: 160px;
  min-height: 56px;
  position: relative;
  transition: background .2s ease, border-color .2s ease, transform .15s ease;
}

.node-icon { font-size: 16px; flex-shrink: 0; }

.node-label {
  font-size: 14px;
  font-weight: 500;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  text-align: center;
  text-shadow: 0 1px 1px rgba(0,0,0,0.25);
}

.open-collection-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 2px;
  border-radius: 2px;
  font-size: 12px;
  opacity: 0.7;
  transition: opacity 0.2s ease;
}
.open-collection-btn:hover { opacity: 1; background: rgba(0,0,0,0.1); }

.process-shape:hover { transform: translateY(-2px); filter: brightness(0.9); }
</style>
