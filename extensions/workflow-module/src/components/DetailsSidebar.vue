<script setup lang="ts">
import type { Node, Edge } from '@vue-flow/core';
import NodeEditor from './NodeEditor.vue';
import EdgeEditor from './EdgeEditor.vue';
import WorkflowSettings from './WorkflowSettings.vue';

interface Collection {
  value: string;
  text: string;
}

interface Workflow {
  id: string;
  name: string;
}

interface Page {
  id: string;
  name: string;
  description?: string;
  color?: string;
}

interface Props {
  isEditMode: boolean;
  isViewMode: boolean;
  selectedNode: Node | null;
  selectedEdge: Edge | null;
  availableCollections: Collection[];
  availableWorkflows: Workflow[];
  availablePages: Page[];
  edits: Record<string, any>;
  item: Record<string, any> | null;
  usedWorkflowIds: string[];
  onToggle?: () => void;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update-node-data': [];
  'update-edge-data': [];
  'update-form-collection': [collectionName: string];
  'update-form-collections': [collections: Array<{ collection: string; label?: string }>];
  'update-end-node-target': [workflowId: string];
  'update-page-node-target': [pageId: string];
  'delete-selected-node': [];
  'delete-selected-edge': [];
  'navigate-to-workflow': [workflowId: string];
  'navigate-to-page': [pageId: string];
  'toggle': [];
}>();

const handleToggle = () => {
  emit('toggle');
};

// Pass through event handlers
const handleUpdateNodeData = () => {
  emit('update-node-data');
};

const handleUpdateEdgeData = () => {
  emit('update-edge-data');
};

const handleUpdateFormCollection = (collectionName: string) => {
  emit('update-form-collection', collectionName);
};

const handleUpdateEndNodeTarget = (workflowId: string) => {
  emit('update-end-node-target', workflowId);
};

const handleUpdatePageNodeTarget = (pageId: string) => {
  emit('update-page-node-target', pageId);
};

const handleDeleteSelectedNode = () => {
  emit('delete-selected-node');
};

const handleDeleteSelectedEdge = () => {
  emit('delete-selected-edge');
};

const handleNavigateToWorkflow = (workflowId: string) => {
  emit('navigate-to-workflow', workflowId);
};

const handleNavigateToPage = (pageId: string) => {
  emit('navigate-to-page', pageId);
};
</script>

<template>
  <div class="details-sidebar">
    <!-- Sidebar Header with Collapse Button at top level -->
    <div class="sidebar-header">
      <h2>Details</h2>
      <button
        class="collapse-btn"
        @click="handleToggle"
        title="Collapse sidebar"
      >
        <v-icon name="chevron_right" />
      </button>
    </div>

    <!-- Dynamic Content Based on Selection -->
    <div class="sidebar-section">
      <!-- Workflow Settings (shown when nothing is selected) -->
      <WorkflowSettings
        v-if="!selectedNode && !selectedEdge"
        :is-edit-mode="isEditMode"
        :available-workflows="availableWorkflows"
        :used-workflow-ids="usedWorkflowIds"
        :edits="edits"
        :item="item"
        @navigate-to-workflow="handleNavigateToWorkflow"
      />

      <!-- Node Details Section (shown when a node is selected) -->
      <NodeEditor
        v-else-if="selectedNode"
        :selected-node="selectedNode"
        :is-edit-mode="isEditMode"
        :is-view-mode="isViewMode"
        :available-collections="availableCollections"
        :available-workflows="availableWorkflows"
        :available-pages="availablePages"
        @update-node-data="handleUpdateNodeData"
        @update-form-collection="handleUpdateFormCollection"
        @update-end-node-target="handleUpdateEndNodeTarget"
        @update-page-node-target="handleUpdatePageNodeTarget"
        @delete-selected-node="handleDeleteSelectedNode"
        @navigate-to-workflow="handleNavigateToWorkflow"
        @navigate-to-page="handleNavigateToPage"
      />
      
      <!-- Edge Details Section (shown when an edge is selected) -->
      <EdgeEditor
        v-else-if="selectedEdge"
        :selected-edge="selectedEdge"
        :is-edit-mode="isEditMode"
        :is-view-mode="isViewMode"
        @update-edge-data="handleUpdateEdgeData"
        @delete-selected-edge="handleDeleteSelectedEdge"
      />
    </div>
  </div>
</template>

<style scoped>
.details-sidebar {
  background: var(--theme--background-subdued, #f8f9fa);
  border-left: 1px solid var(--theme--border-color, #e1e5e9);
  padding: 1rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  z-index: 10;
  width: 300px;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 0;
  margin-bottom: 0;
  border-bottom: 1px solid var(--theme--border-color-subdued, #e1e5e9);
  padding-bottom: 1rem;
}

.sidebar-header h2 {
  margin: 0;
  color: var(--theme--foreground, #1a1a1a);
  font-size: 1.1rem;
  font-weight: 600;
}

.sidebar-section {
  background: var(--theme--background-normal, white);
  padding: 1.5rem;
  border-radius: 6px;
  border: 1px solid var(--theme--border-color, #e1e5e9);
  margin-top: 1rem;
}

.sidebar-section > div:not(:last-child) {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--theme--border-color-subdued, #f0f0f0);
}

.sidebar-section > div:last-child {
  margin-bottom: 0;
}

.collapse-btn {
  background: none;
  border: none;
  color: var(--theme--foreground-subdued, #6c757d);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  width: 24px;
  height: 24px;
}

.collapse-btn:hover {
  background: var(--theme--background-accent, #f0f2f5);
  color: var(--theme--foreground, #1a1a1a);
}

.collapse-btn:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(0, 102, 204, 0.2);
}
</style>
