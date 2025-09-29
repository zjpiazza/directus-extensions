<script setup lang="ts">
import { ref } from 'vue';
import type { Node, Edge } from '@vue-flow/core';
import WorkflowLegend from './WorkflowLegend.vue';

interface Collection {
  value: string;
  text: string;
}

interface Workflow {
  id: string;
  name: string;
}

interface Props {
  isEditMode: boolean;
  isViewMode: boolean;
  selectedNode: Node | null;
  selectedEdge: Edge | null;
  availableCollections: Collection[];
  availableWorkflows: Workflow[];
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
  'update-off-page-target': [workflowId: string];
  'delete-selected-node': [];
  'delete-selected-edge': [];
  'navigate-to-workflow': [workflowId: string];
  'toggle': [];
}>();

const updateNodeData = () => {
  emit('update-node-data');
};

const updateEdgeData = () => {
  emit('update-edge-data');
};

const updateFormCollections = (collections: Array<{ collection: string; label?: string }>) => {
  emit('update-form-collections', collections);
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

const updateOffPageTarget = (workflowId: string) => {
  emit('update-off-page-target', workflowId);
};

const deleteSelectedNode = () => {
  emit('delete-selected-node');
};

const deleteSelectedEdge = () => {
  emit('delete-selected-edge');
};

// Local state for description editing
const isEditingDescription = ref(false);
const localDescription = ref('');

// Local state for default node size editing
const isEditingDefaultNodeSize = ref(false);
const localDefaultNodeSize = ref('medium');

// Local state for default edge type editing
const isEditingDefaultEdgeType = ref(false);
const localDefaultEdgeType = ref('bezier');

const startEditingDescription = () => {
  // Initialize local description with current value from edits or item
  localDescription.value = props.edits.description || props.item?.description || '';
  isEditingDescription.value = true;
};

const stopEditingDescription = () => {
  // Save the local description back to edits
  if (!props.edits.description) {
    props.edits.description = localDescription.value;
  }
  isEditingDescription.value = false;
};

const updateDescription = (value: string) => {
  localDescription.value = value;
  // Update edits in real-time
  props.edits.description = value;
};

const navigateToWorkflow = (workflowId: string) => {
  emit('navigate-to-workflow', workflowId);
};

const handleToggle = () => {
  emit('toggle');
};

// Default node size editing methods
const startEditingDefaultNodeSize = () => {
  // Initialize local default node size with current value from edits or item
  localDefaultNodeSize.value = props.edits.defaultNodeSize || props.item?.defaultNodeSize || 'medium';
  isEditingDefaultNodeSize.value = true;
};

const stopEditingDefaultNodeSize = () => {
  // Save the local default node size back to edits
  if (!props.edits.defaultNodeSize) {
    props.edits.defaultNodeSize = localDefaultNodeSize.value;
  }
  isEditingDefaultNodeSize.value = false;
};

const updateDefaultNodeSize = (value: string) => {
  localDefaultNodeSize.value = value;
  // Update edits in real-time
  props.edits.defaultNodeSize = value;
};

const getSizeDescription = (size: string) => {
  const sizeMap: Record<string, string> = {
    small: '120×60 pixels',
    medium: '180×80 pixels',
    large: '240×100 pixels'
  };
  return sizeMap[size] || '180×80 pixels';
};

// Default edge type editing methods
const startEditingDefaultEdgeType = () => {
  // Initialize local default edge type with current value from edits or item
  localDefaultEdgeType.value = props.edits.defaultEdgeType || props.item?.defaultEdgeType || 'bezier';
  isEditingDefaultEdgeType.value = true;
};

const stopEditingDefaultEdgeType = () => {
  // Save the local default edge type back to edits
  if (!props.edits.defaultEdgeType) {
    props.edits.defaultEdgeType = localDefaultEdgeType.value;
  }
  isEditingDefaultEdgeType.value = false;
};

const updateDefaultEdgeType = (value: string) => {
  localDefaultEdgeType.value = value;
  // Update edits in real-time
  props.edits.defaultEdgeType = value;
};

const getEdgeTypeDescription = (edgeType: string) => {
  const edgeTypeMap: Record<string, string> = {
    'bezier': 'Curved, smooth connections',
    'step': 'Right-angle, step-like connections', 
    'smoothstep': 'Rounded right-angle connections',
    'straight': 'Direct straight line connections'
  };
  return edgeTypeMap[edgeType] || 'Curved, smooth connections';
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
      <!-- Workflow Legend (shown when nothing is selected and there are off-page connectors) -->
      <WorkflowLegend
        v-if="!selectedNode && !selectedEdge"
        :workflows="availableWorkflows"
        :used-workflow-ids="usedWorkflowIds"
        @navigate-to-workflow="navigateToWorkflow"
      />

      <!-- Flow Description Section (shown when nothing is selected) -->
      <div v-if="!selectedNode && !selectedEdge">
        <h3>Flow Description</h3>
        <div class="description-section">
          <!-- View Mode or when not editing -->
          <div v-if="!isEditingDescription" class="description-display">
            <div 
              v-if="edits.description || item?.description"
              class="description-text-scrollable"
            >
              {{ edits.description || item?.description }}
            </div>
            <p v-else class="description-placeholder">
              No description yet
            </p>
            <button
              v-if="isEditMode"
              class="btn btn-secondary description-edit-btn"
              @click="startEditingDescription"
            >
              <v-icon name="edit" />
              {{ (edits.description || item?.description) ? 'Edit Description' : 'Add Description' }}
            </button>
          </div>
          
          <!-- Edit Mode - Scrollable textarea -->
          <div v-else class="description-edit">
            <textarea
              v-model="localDescription"
              class="description-textarea-scrollable"
              placeholder="Enter workflow description..."
              @input="updateDescription($event.target.value)"
              @keydown.esc="stopEditingDescription"
              @blur="stopEditingDescription"
            />
            <div class="description-edit-actions">
              <button
                class="btn btn-secondary btn-sm"
                @click="stopEditingDescription"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Default Node Size Section (shown when nothing is selected) -->
      <div v-if="!selectedNode && !selectedEdge">
        <h3>Default Node Size</h3>
        <div class="default-node-size-section">
          <!-- View Mode or when not editing -->
          <div v-if="!isEditingDefaultNodeSize" class="default-node-size-display">
            <div class="node-size-display">
              <span class="node-size-value">
                {{ edits.defaultNodeSize || item?.defaultNodeSize || 'medium' }}
              </span>
              <span class="node-size-description">
                ({{ getSizeDescription(edits.defaultNodeSize || item?.defaultNodeSize || 'medium') }})
              </span>
            </div>
            <button
              v-if="isEditMode"
              class="btn btn-secondary description-edit-btn"
              @click="startEditingDefaultNodeSize"
            >
              <v-icon name="edit" />
              Change Default Size
            </button>
          </div>
          
          <!-- Edit Mode - Size selector -->
          <div v-else class="default-node-size-edit">
            <select
              v-model="localDefaultNodeSize"
              class="select-field"
              @change="updateDefaultNodeSize($event.target.value)"
            >
              <option value="small">Small (120×60)</option>
              <option value="medium">Medium (180×80)</option>
              <option value="large">Large (240×100)</option>
            </select>
            <div class="description-edit-actions">
              <button
                class="btn btn-secondary btn-sm"
                @click="stopEditingDefaultNodeSize"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Default Edge Type Section (shown when nothing is selected) -->
      <div v-if="!selectedNode && !selectedEdge">
        <h3>Default Edge Type</h3>
        <div class="default-edge-type-section">
          <!-- View Mode or when not editing -->
          <div v-if="!isEditingDefaultEdgeType" class="default-edge-type-display">
            <div class="edge-type-display">
              <span class="edge-type-value">
                {{ edits.defaultEdgeType || item?.defaultEdgeType || 'bezier' }}
              </span>
              <span class="edge-type-description">
                ({{ getEdgeTypeDescription(edits.defaultEdgeType || item?.defaultEdgeType || 'bezier') }})
              </span>
            </div>
            <button
              v-if="isEditMode"
              class="btn btn-secondary description-edit-btn"
              @click="startEditingDefaultEdgeType"
            >
              <v-icon name="edit" />
              Change Default Edge Type
            </button>
          </div>
          
          <!-- Edit Mode - Edge type selector -->
          <div v-else class="default-edge-type-edit">
            <select
              v-model="localDefaultEdgeType"
              class="select-field"
              @change="updateDefaultEdgeType($event.target.value)"
            >
              <option value="bezier">Bezier</option>
              <option value="step">Step Edge</option>
              <option value="smoothstep">Smoothstep Edge</option>
              <option value="straight">Straight Edge</option>
            </select>
            <div class="description-edit-actions">
              <button
                class="btn btn-secondary btn-sm"
                @click="stopEditingDefaultEdgeType"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Node Details Section (shown when a node is selected) -->
      <div v-else-if="selectedNode">
        <h3>Node Details</h3>
        <div class="node-properties">
        <div class="property-group">
          <label>Label</label>
          <input
            v-model="selectedNode.data.label"
            :readonly="isViewMode"
            class="input-field"
            @input="isEditMode ? updateNodeData : undefined"
          />
        </div>
        <div class="property-group">
          <label>Description</label>
          <textarea
            v-model="selectedNode.data.description"
            :readonly="isViewMode"
            class="textarea-field"
            @input="isEditMode ? updateNodeData : undefined"
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
            @input="isEditMode ? updateNodeData : undefined"
          />
        </div>

        <!-- Off-page Connector Workflow Selection -->
        <div v-if="selectedNode.type === 'offpage'" class="property-group">
          <label>Target Workflow</label>
          <select
            :value="selectedNode.data.targetWorkflowId"
            :disabled="isViewMode"
            class="select-field"
            @change="isEditMode ? updateOffPageTarget(($event.target as HTMLSelectElement).value) : undefined"
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
           <div class="offpage-actions" v-if="selectedNode.data.targetWorkflowId" style="margin-top: 1rem; display: flex; gap: 0.75rem; flex-wrap: wrap;">
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
               @click="updateOffPageTarget('')"
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
        </div> <!-- closing .node-properties -->
      </div>
      
      <!-- Edge Details Section (shown when an edge is selected) -->
      <div v-else-if="selectedEdge">
        <h3>Edge Details</h3>
        <div class="edge-properties">
          <div class="property-group">
            <label>Label</label>
            <input
              v-model="selectedEdge.data.label"
              :readonly="isViewMode"
              class="input-field"
              placeholder="Enter edge label..."
              @input="isEditMode ? updateEdgeData : undefined"
            />
          </div>
          <div class="property-group">
            <label>Edge ID</label>
            <input
              :value="selectedEdge.id"
              readonly
              class="input-field"
            />
          </div>
          <div class="property-group">
            <label>Source Node</label>
            <input
              :value="selectedEdge.source"
              readonly
              class="input-field"
            />
          </div>
          <div class="property-group">
            <label>Target Node</label>
            <input
              :value="selectedEdge.target"
              readonly
              class="input-field"
            />
          </div>
          <div class="property-group">
            <label>Edge Type</label>
            <input
              :value="selectedEdge.type || 'step'"
              readonly
              class="input-field"
            />
          </div>

          <!-- Delete Edge Button (only in edit mode) -->
          <div v-if="isEditMode" class="property-group">
            <button
              class="btn btn-danger block"
              @click="deleteSelectedEdge"
            >
              <v-icon name="delete" />
              Delete Edge
            </button>
          </div>
        </div>
      </div>
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

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.sidebar-header h3 {
  margin: 0 0 1.25rem 0;
  color: var(--theme--foreground, #1a1a1a);
  font-size: 1rem;
  font-weight: 600;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--theme--border-color-subdued, #f0f0f0);
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

.description-preview {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.description-text {
  font-size: 0.875rem;
  line-height: 1.4;
  color: var(--theme--foreground, #1a1a1a);
  margin: 0;
  padding: 0.75rem;
  background: var(--theme--background-subdued, #f8f9fa);
  border-radius: 4px;
  border: 1px solid var(--theme--border-color-subdued, #e1e5e9);
}

.description-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.description-display {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.description-text-scrollable {
  font-size: 0.875rem;
  line-height: 1.4;
  color: var(--theme--foreground, #1a1a1a);
  margin: 0;
  padding: 0.75rem;
  background: var(--theme--background-subdued, #f8f9fa);
  border-radius: 4px;
  border: 1px solid var(--theme--border-color-subdued, #e1e5e9);
  max-height: 150px;
  overflow-y: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.description-edit {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.description-textarea-scrollable {
  width: 100%;
  min-height: 100px;
  max-height: 200px;
  padding: 0.75rem;
  border: 1px solid var(--theme--border-color, #e0e0e0);
  border-radius: 4px;
  font-family: inherit;
  font-size: 0.875rem;
  line-height: 1.4;
  color: var(--theme--foreground, #333);
  background: var(--theme--background, #ffffff);
  resize: vertical;
  overflow-y: auto;
  transition: border-color 0.2s;
}

.description-textarea-scrollable:focus {
  outline: none;
  border-color: var(--theme--primary, #6366f1);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.description-textarea-scrollable::placeholder {
  color: var(--theme--foreground-subdued, #999);
}

.description-edit-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 0.75rem;
}

.description-edit-btn {
  align-self: flex-start;
}

.btn-sm {
  padding: 0.5rem 0.875rem;
  font-size: 0.8125rem;
  margin-top: 0.5rem;
}

.description-placeholder {
  font-size: 0.875rem;
  color: var(--theme--foreground-subdued, #6c757d);
  font-style: italic;
  margin: 0;
  padding: 0.75rem;
  background: var(--theme--background-subdued, #f8f9fa);
  border-radius: 4px;
  border: 1px dashed var(--theme--border-color-subdued, #e1e5e9);
}

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

.no-selection {
  text-align: center;
  color: var(--theme--foreground-subdued, #6c757d);
  margin-top: 2rem;
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

.icon {
  font-size: 1rem;
  line-height: 1;
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

.default-node-size-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.default-node-size-display {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.node-size-display {
  padding: 0.75rem;
  background: var(--theme--background-subdued, #f8f9fa);
  border-radius: 4px;
  border: 1px solid var(--theme--border-color-subdued, #e1e5e9);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.node-size-value {
  font-weight: 600;
  color: var(--theme--foreground, #1a1a1a);
  text-transform: capitalize;
}

.node-size-description {
  font-size: 0.8125rem;
  color: var(--theme--foreground-subdued, #6c757d);
}

.default-node-size-edit {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.default-edge-type-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.default-edge-type-display {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.edge-type-display {
  padding: 0.75rem;
  background: var(--theme--background-subdued, #f8f9fa);
  border-radius: 4px;
  border: 1px solid var(--theme--border-color-subdued, #e1e5e9);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.edge-type-value {
  font-weight: 600;
  color: var(--theme--foreground, #1a1a1a);
  text-transform: capitalize;
}

.edge-type-description {
  font-size: 0.8125rem;
  color: var(--theme--foreground-subdued, #6c757d);
}

.default-edge-type-edit {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
</style>
