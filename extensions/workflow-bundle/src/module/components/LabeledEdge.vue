<script setup lang="ts">
import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath, type EdgeProps } from '@vue-flow/core';
import { computed } from 'vue';

const props = defineProps<EdgeProps>();

const path = computed(() => getSmoothStepPath({ ...props, borderRadius: 8 }));

// Get label from edge data, default to empty string
const label = computed(() => props.data?.label || '');

// Only show label if it has content
const showLabel = computed(() => label.value.trim().length > 0);
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
};
</script>

<template>
  <!-- Use BaseEdge for the main edge path -->
  <BaseEdge :path="path[0]" />

  <!-- Render edge label if it exists -->
  <EdgeLabelRenderer v-if="showLabel">
    <div
      :style="{
        pointerEvents: 'all',
        position: 'absolute',
        transform: `translate(-50%, -50%) translate(${path[1]}px,${path[2]}px)`,
      }"
      class="edge-label nodrag nopan"
    >
      {{ label }}
    </div>
  </EdgeLabelRenderer>
</template>

<style scoped>
.edge-label {
  background: var(--theme--background, white);
  border: 1px solid var(--theme--border-color, #e1e5e9);
  border-radius: 12px;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--theme--foreground, #1a1a1a);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(2px);
  white-space: nowrap;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  user-select: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.edge-label:hover {
  background: var(--theme--background-accent, #f8f9fa);
  border-color: var(--theme--primary, #0066cc);
  box-shadow: 0 2px 8px rgba(0, 102, 204, 0.2);
  transform: scale(1.05);
}

/* Ensure the label is readable on different backgrounds */
.edge-label::before {
  content: '';
  position: absolute;
  inset: -2px;
  background: var(--theme--background, white);
  border-radius: 14px;
  opacity: 0.8;
  z-index: -1;
}
</style>