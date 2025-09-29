<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core';
import type { NodeProps } from '@vue-flow/core';
import { inject, computed, ref } from 'vue';
import { IS_EDIT_MODE_KEY, PAGES_KEY, ADD_PAGE_KEY, UPDATE_NODE_KEY } from '../constants/injection-keys';
import type { Page } from '../composables/useWorkflowData';

interface PageData {
  label: string;
  name: string;
  description?: string;
  targetPageId?: string | null;
  nodeCount?: number;
  color?: string;
}

const props = defineProps<NodeProps<PageData>>();
const isEditMode = inject<any>(IS_EDIT_MODE_KEY, true);
const pages = inject<any>(PAGES_KEY, ref([]));
const addPage = inject<any>(ADD_PAGE_KEY, () => {});
const updateNode = inject<any>(UPDATE_NODE_KEY, () => {});

// Get all pages including root
const allPages = computed(() => [
  { id: 'root', name: 'Main', description: 'Main workflow page', color: '#6366f1' },
  ...pages.value
]);

const targetPage = computed(() => {
  return allPages.value.find(p => p.id === props.data.targetPageId);
});

const isLinked = computed(() => {
  return props.data.targetPageId != null;
});

const displayName = computed(() => {
  if (isLinked.value && targetPage.value) {
    return targetPage.value.name;
  }
  return 'Select Page';
});

const displayLabel = computed(() => {
  if (isLinked.value && targetPage.value) {
    // Use first letter of page name, or first 2 characters if short
    const name = targetPage.value.name;
    return name.length <= 2 ? name.toUpperCase() : name.charAt(0).toUpperCase();
  }
  return '?';
});

const pageColor = computed(() => {
  if (isLinked.value && targetPage.value) {
    return targetPage.value.color || '#3b82f6';
  }
  return '#6b7280'; // Gray for unlinked
});

const nodeCountText = computed(() => {
  if (isLinked.value && targetPage.value) {
    const count = props.data.nodeCount || 0;
    return count === 1 ? '1 node' : `${count} nodes`;
  }
  return 'No page selected';
});

const handlePageClick = () => {
  if (!isEditMode.value && props.data.targetPageId) {
    // Navigate to page in view mode
    const event = new CustomEvent('enter-page', {
      detail: { pageId: props.data.targetPageId },
      bubbles: true
    });
    document.dispatchEvent(event);
  }
};

const getNodeTitle = () => {
  if (!isEditMode.value && isLinked.value && targetPage.value) {
    return `Click to enter page: ${targetPage.value.name}`;
  } else if (isEditMode.value && !isLinked.value) {
    return 'Click to select a page';
  } else if (isLinked.value && targetPage.value) {
    return `Page: ${targetPage.value.name}`;
  }
  return 'Page Node';
};
</script>

<template>
  <div class="page-node">
    <!-- Connection handles -->
    <Handle id="top" type="target" :position="Position.Top" :is-connectable="isEditMode" />
    <Handle id="left" type="target" :position="Position.Left" :is-connectable="isEditMode" />
    <Handle id="right" type="source" :position="Position.Right" :is-connectable="isEditMode" />
    <Handle id="bottom" type="source" :position="Position.Bottom" :is-connectable="isEditMode" />

    <!-- Pentagon shape for page navigation -->
    <div 
      class="pentagon-shape"
      :class="{ 
        'clickable': !isEditMode && isLinked,
        'view-mode': !isEditMode,
        'unlinked': !isLinked
      }"
      :style="{ '--page-color': pageColor }"
      @click="handlePageClick"
      :title="getNodeTitle()"
    >
      <span class="page-label">{{ displayLabel }}</span>
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

.pentagon-shape {
  position: relative;
  width: 60px;
  height: 48px;
  background: var(--page-color, #3b82f6);
  border: 2px solid var(--page-color, #3b82f6);
  clip-path: polygon(0% 0%, 100% 0%, 100% 75%, 50% 100%, 0% 75%);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.pentagon-shape.clickable {
  cursor: pointer;
}

.pentagon-shape.clickable:hover {
  transform: translateY(-2px);
  filter: brightness(1.1);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.pentagon-shape.view-mode {
  background: var(--page-color, #3b82f6);
  border-color: var(--page-color, #3b82f6);
}

/* Unlinked state styling */
.pentagon-shape.unlinked {
  background: #6b7280;
  border-color: #6b7280;
  border-style: dashed;
}

.page-label {
  font-size: 20px;
  font-weight: 700;
  color: #ffffff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  letter-spacing: 0;
  line-height: 1;
  margin-top: -4px; /* Adjust for pentagon shape center */
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