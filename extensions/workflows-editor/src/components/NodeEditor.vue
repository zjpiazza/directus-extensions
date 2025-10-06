<script setup lang="ts">
import type { Node } from '@vue-flow/core';

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
  selectedNode: Node | null;
  isEditMode: boolean;
  isViewMode: boolean;
  availableCollections: Collection[];
  availableWorkflows: Workflow[];
  availablePages: Page[];
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update-node-data': [];
  'update-form-collection': [collectionName: string];
  'update-end-node-target': [workflowId: string];
  'update-page-node-target': [pageId: string];
  'delete-selected-node': [];
  'navigate-to-workflow': [workflowId: string];
  'navigate-to-page': [pageId: string];
}>();

const updateNodeData = () => {
  emit('update-node-data');
};

const updateFormCollection = (collectionName: string) => {
  emit('update-form-collection', collectionName);
};

const addCollectionLink = () => {
  if (props.selectedNode && props.selectedNode.type === 'process' && props.selectedNode.data.subtype === 'form') {
    if (!props.selectedNode.data.targetCollections) {
      props.selectedNode.data.targetCollections = [];
    }
    props.selectedNode.data.targetCollections.push({ collection: '', label: '' });
    updateNodeData();
  }
};

const removeCollectionLink = (index: number) => {
  if (props.selectedNode && props.selectedNode.data.targetCollections) {
    props.selectedNode.data.targetCollections.splice(index, 1);
    updateNodeData();
  }
};

const updateCollectionLink = (index: number, field: 'collection' | 'label', value: string) => {
  if (props.selectedNode && props.selectedNode.data.targetCollections) {
    props.selectedNode.data.targetCollections[index][field] = value;
    updateNodeData();
  }
};

const updateEndNodeTarget = (workflowId: string) => {
  emit('update-end-node-target', workflowId);
};

const updatePageNodeTarget = (pageId: string) => {
  emit('update-page-node-target', pageId);
};

const navigateToWorkflow = (workflowId: string) => {
  emit('navigate-to-workflow', workflowId);
};

const navigateToPage = (pageId: string) => {
  emit('navigate-to-page', pageId);
};

const deleteSelectedNode = () => {
  emit('delete-selected-node');
};
</script>

<template>
  <div v-if="selectedNode">
    <h3>Node Details</h3>
    <div class="node-properties">
      <div class="property-group">
        <label>Label</label>
        <input
          v-model="selectedNode.data.label"
          :readonly="isViewMode"
          class="input-field"
          @input="isEditMode ? updateNodeData() : undefined"
        />
      </div>
      <div class="property-group">
        <label>Description</label>
        <textarea
          v-model="selectedNode.data.description"
          :readonly="isViewMode"
          class="textarea-field"
          @input="isEditMode ? updateNodeData() : undefined"
        />
      </div>
      <div class="property-group">
        <label>Type</label>
        <input
          :value="selectedNode.type"
          readonly
          class="input-field"
        />
      </div>

      <!-- Form Node Collection Selection (only for form nodes) -->
      <div
        v-if="selectedNode.type === 'process' && selectedNode.data.subtype === 'form'"
        class="property-group"
      >
        <label>Target Collections</label>
        
        <!-- Legacy single collection (show only if no multiple collections) -->
        <div v-if="!selectedNode.data.targetCollections || selectedNode.data.targetCollections.length === 0">
          <select
            :value="selectedNode.data.targetCollection"
            :disabled="isViewMode"
            class="select-field"
            @change="isEditMode ? updateFormCollection(($event.target as HTMLSelectElement).value) : undefined"
          >
            <option value="">Select collection for form...</option>
            <option
              v-for="collection in availableCollections"
              :key="collection.value"
              :value="collection.value"
            >
              {{ collection.text }}
            </option>
          </select>
          <button
            v-if="isEditMode"
            class="btn btn-secondary btn-sm"
            @click="addCollectionLink"
            style="margin-top: 1rem;"
          >
            <v-icon name="add" />
            Add Multiple Collections
          </button>
        </div>

        <!-- Multiple collections interface -->
        <div v-else class="multiple-collections">
          <div
            v-for="(link, index) in selectedNode.data.targetCollections"
            :key="index"
            class="collection-link-item"
          >
            <div class="collection-link-fields">
              <div class="field-group">
                <label class="field-label">Collection</label>
                <select
                  :value="link.collection"
                  :disabled="isViewMode"
                  class="select-field"
                  @change="isEditMode ? updateCollectionLink(index, 'collection', ($event.target as HTMLSelectElement).value) : undefined"
                >
                  <option value="">Select collection...</option>
                  <option
                    v-for="collection in availableCollections"
                    :key="collection.value"
                    :value="collection.value"
                  >
                    {{ collection.text }}
                  </option>
                </select>
              </div>
              <div class="field-group">
                <label class="field-label">Label (optional)</label>
                <input
                  :value="link.label"
                  :readonly="isViewMode"
                  class="input-field"
                  placeholder="Custom label..."
                  @input="isEditMode ? updateCollectionLink(index, 'label', ($event.target as HTMLInputElement).value) : undefined"
                />
              </div>
            </div>
            <button
              v-if="isEditMode"
              class="btn btn-danger btn-sm remove-btn"
              @click="removeCollectionLink(index)"
              title="Remove this collection link"
            >
              <v-icon name="close" />
            </button>
          </div>
          
          <div v-if="isEditMode" class="collection-actions">
            <button
              class="btn btn-secondary btn-sm"
              @click="addCollectionLink"
            >
              <v-icon name="add" />
              Add Collection
            </button>
          </div>
        </div>
      </div>

      <!-- Form Node Custom Label (only for form nodes without multiple collections) -->
      <div
        v-if="selectedNode.type === 'process' && selectedNode.data.subtype === 'form' && (!selectedNode.data.targetCollections || selectedNode.data.targetCollections.length === 0)"
        class="property-group"
      >
        <label>Form Label (optional)</label>
        <input
          v-model="selectedNode.data.formLabel"
          :readonly="isViewMode"
          class="input-field"
          placeholder="Override collection name..."
          @input="isEditMode ? updateNodeData() : undefined"
        />
      </div>

      <!-- End Node Workflow Selection -->
      <div v-if="selectedNode.type === 'end'" class="property-group">
        <label>Target Workflow</label>
        <select
          :value="selectedNode.data.targetWorkflowId"
          :disabled="isViewMode"
          class="select-field"
          @change="isEditMode ? updateEndNodeTarget(($event.target as HTMLSelectElement).value) : undefined"
        >
          <option value="">Select workflow to link to...</option>
          <option
            v-for="workflow in availableWorkflows"
            :key="workflow?.id || Math.random()"
            :value="workflow?.id || ''"
          >
            {{ workflow?.name || 'Unnamed Workflow' }}
          </option>
        </select>
         <div class="end-node-actions" v-if="selectedNode.data.targetWorkflowId" style="margin-top: 1rem; display: flex; gap: 0.75rem; flex-wrap: wrap;">
            <button
               class="btn btn-secondary small"
               :disabled="isEditMode"
               :title="isEditMode ? 'Switch to view mode to open workflow' : 'Open linked workflow'"
               @click="!isEditMode ? navigateToWorkflow(selectedNode.data.targetWorkflowId) : undefined"
             >
               <v-icon name="link" />
               Open Workflow
             </button>
           <button
             v-if="isEditMode"
             class="btn btn-secondary small"
             @click="updateEndNodeTarget('')"
             title="Clear link"
           >
             <v-icon name="close" />
             Clear Link
           </button>
        </div>
      </div>

      <!-- Page Node Page Selection -->
      <div v-if="selectedNode.type === 'page'" class="property-group">
        <label>Target Page</label>
        <select
          :value="selectedNode.data.targetPageId"
          :disabled="isViewMode"
          class="select-field"
          @change="isEditMode ? updatePageNodeTarget(($event.target as HTMLSelectElement).value) : undefined"
        >
          <option value="">Select page to link to...</option>
          <option
            v-for="page in availablePages"
            :key="page.id"
            :value="page.id"
          >
            {{ page.name }}
          </option>
        </select>
         <div class="page-node-actions" v-if="selectedNode.data.targetPageId" style="margin-top: 1rem; display: flex; gap: 0.75rem; flex-wrap: wrap;">
            <button
               class="btn btn-secondary small"
               :disabled="isEditMode"
               :title="isEditMode ? 'Switch to view mode to open page' : 'Open linked page'"
               @click="!isEditMode ? navigateToPage(selectedNode.data.targetPageId) : undefined"
             >
               <v-icon name="link" />
               Open Page
             </button>
           <button
             v-if="isEditMode"
             class="btn btn-secondary small"
             @click="updatePageNodeTarget('')"
             title="Clear link"
           >
             <v-icon name="close" />
             Clear Link
           </button>
        </div>
      </div>

      <!-- Delete Node Button (only in edit mode) -->
      <div v-if="isEditMode" class="property-group">
        <button
          class="btn btn-danger block"
          @click="deleteSelectedNode"
        >
          <v-icon name="delete" />
          Delete Node
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.property-group {
  margin-bottom: 1.5rem;
}

.property-group:last-child {
  margin-bottom: 0;
}

.property-group label {
  display: block;
  margin-bottom: 0.75rem;
  font-weight: 600;
  color: var(--theme--foreground, #1a1a1a);
  font-size: 0.875rem;
}

.input-field,
.textarea-field,
.select-field {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--theme--border-color, #e1e5e9);
  border-radius: 6px;
  background: var(--theme--background, white);
  color: var(--theme--foreground, #1a1a1a);
  font-size: 0.875rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.input-field:focus,
.textarea-field:focus,
.select-field:focus {
  outline: none;
  border-color: var(--theme--primary, #0066cc);
  box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.15);
}

.input-field[readonly],
.textarea-field[readonly],
.select-field:disabled {
  background: var(--theme--background-subdued, #f8f9fa);
  cursor: not-allowed;
}

.textarea-field {
  min-height: 90px;
  resize: vertical;
  line-height: 1.5;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border: 1px solid transparent;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  margin-top: 0.5rem;
}

.btn:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(0, 102, 204, 0.2);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: var(--theme--background, white);
  color: var(--theme--foreground, #1a1a1a);
  border-color: var(--theme--border-color, #e1e5e9);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--theme--background-accent, #f8f9fa);
}

.btn-danger {
  background: var(--theme--danger, #dc3545);
  color: white;
  border-color: var(--theme--danger, #dc3545);
}

.btn-danger:hover:not(:disabled) {
  background: var(--theme--danger-hover, #c82333);
  border-color: var(--theme--danger-hover, #c82333);
}

.btn.small {
  padding: 0.5rem 0.875rem;
  font-size: 0.8125rem;
  margin-top: 0.375rem;
}

.btn.block {
  width: 100%;
  justify-content: center;
}

.btn-sm {
  padding: 0.5rem 0.875rem;
  font-size: 0.8125rem;
  margin-top: 0.5rem;
}

.multiple-collections {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.collection-link-item {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
  padding: 1rem;
  background: var(--theme--background-subdued, #f8f9fa);
  border: 1px solid var(--theme--border-color-subdued, #e1e5e9);
  border-radius: 8px;
}

.collection-link-fields {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.field-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--theme--foreground-subdued, #6c757d);
  margin: 0;
}

.remove-btn {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 1.25rem; /* Align with first field */
  border-radius: 6px;
}

.collection-actions {
  display: flex;
  justify-content: flex-start;
  margin-top: 0.5rem;
}
</style>