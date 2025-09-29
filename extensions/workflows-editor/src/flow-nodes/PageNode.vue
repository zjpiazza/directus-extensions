<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core';
import type { NodeProps } from '@vue-flow/core';
import { inject, computed } from 'vue';
import { IS_EDIT_MODE_KEY } from '../constants/injection-keys';

interface PageData {
  label: string;
  name: string;
  description?: string;
  pageId: string;
  nodeCount?: number;
  color?: string;
}

const props = defineProps<NodeProps<PageData>>();
const isEditMode = inject<any>(IS_EDIT_MODE_KEY, true);

const emit = defineEmits<{
  'enter-page': [pageId: string];
}>();

const pageColor = computed(() => {
  return props.data.color || '#3b82f6';
});

const nodeCountText = computed(() => {
  const count = props.data.nodeCount || 0;
  return count === 1 ? '1 node' : `${count} nodes`;
});

const handlePageClick = () => {
  if (!isEditMode.value && props.data.pageId) {
    // Emit a custom event that can be caught by the parent
    const event = new CustomEvent('enter-page', {
      detail: { pageId: props.data.pageId },
      bubbles: true
    });
    document.dispatchEvent(event);
  }
};
</script>

<template>
  <div class="page-node">
    <!-- Connection handles -->
    <Handle id="top" type="target" :position="Position.Top" :is-connectable="isEditMode" />
    <Handle id="left" type="target" :position="Position.Left" :is-connectable="isEditMode" />
    <Handle id="right" type="source" :position="Position.Right" :is-connectable="isEditMode" />
    <Handle id="bottom" type="source" :position="Position.Bottom" :is-connectable="isEditMode" />

    <!-- Page container -->
    <div 
      class="page-container"
      :class="{ 
        'clickable': !isEditMode && props.data.pageId,
        'view-mode': !isEditMode
      }"
      :style="{ '--page-color': pageColor }"
      @click="handlePageClick"
      :title="!isEditMode && props.data.pageId ? 'Click to enter page' : ''"
    >
      <!-- Page icon -->
      <div class="page-icon">
        <v-icon name="folder_open" />
      </div>

      <!-- Page content -->
      <div class="page-content">
        <div class="page-title">{{ props.data.name || props.data.label }}</div>
        <div class="page-subtitle">{{ nodeCountText }}</div>
        <div v-if="props.data.description" class="page-description">
          {{ props.data.description }}
        </div>
      </div>

      <!-- Enter indicator -->
      <div v-if="!isEditMode" class="enter-indicator">
        <v-icon name="chevron_right" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-node {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.page-container {
  position: relative;
  min-width: 200px;
  max-width: 280px;
  min-height: 80px;
  background: linear-gradient(135deg, var(--page-color, #3b82f6) 0%, rgba(var(--page-color, #3b82f6), 0.8) 100%);
  border: 2px solid var(--page-color, #3b82f6);
  border-radius: 12px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transition: all 0.2s ease;
  color: white;
}

.page-container.clickable {
  cursor: pointer;
}

.page-container.clickable:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  filter: brightness(1.1);
}

.page-container.view-mode {
  background: linear-gradient(135deg, var(--page-color, #3b82f6) 0%, rgba(var(--page-color, #3b82f6), 0.9) 100%);
}

.page-icon {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  backdrop-filter: blur(4px);
}

.page-icon .v-icon {
  width: 16px;
  height: 16px;
  color: white;
}

.page-content {
  flex: 1;
  min-width: 0;
}

.page-title {
  font-size: 14px;
  font-weight: 600;
  color: white;
  margin-bottom: 2px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.page-subtitle {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
  margin-bottom: 4px;
}

.page-description {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.3;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.enter-indicator {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  backdrop-filter: blur(4px);
  transition: all 0.2s ease;
}

.enter-indicator .v-icon {
  width: 12px;
  height: 12px;
  color: white;
}

.page-container.clickable:hover .enter-indicator {
  background: rgba(255, 255, 255, 0.3);
  transform: translateX(2px);
}

/* Handle styling */
.page-node :deep(.vue-flow__handle) {
  width: 8px;
  height: 8px;
  background: var(--page-color, #3b82f6);
  border: 2px solid white;
  opacity: 0.8;
}

.page-node :deep(.vue-flow__handle:hover) {
  width: 10px;
  height: 10px;
  opacity: 1;
}
</style>