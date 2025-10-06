<script setup lang="ts">
import { ref } from 'vue';
import WorkflowLegend from './WorkflowLegend.vue';

interface Workflow {
  id: string;
  name: string;
}

interface Props {
  isEditMode: boolean;
  availableWorkflows: Workflow[];
  usedWorkflowIds: string[];
  edits: Record<string, any>;
  item: Record<string, any> | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'navigate-to-workflow': [workflowId: string];
}>();

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
  <div>
    <!-- Workflow Legend (shown when nothing is selected and there are end node connectors) -->
    <WorkflowLegend
      :workflows="availableWorkflows"
      :used-workflow-ids="usedWorkflowIds"
      @navigate-to-workflow="navigateToWorkflow"
    />

    <!-- Flow Description Section -->
    <div>
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

    <!-- Default Node Size Section -->
    <div>
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

    <!-- Default Edge Type Section -->
    <div>
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
  </div>
</template>

<style scoped>
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

.btn-sm {
  padding: 0.5rem 0.875rem;
  font-size: 0.8125rem;
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

.select-field:focus {
  outline: none;
  border-color: var(--theme--primary, #0066cc);
  box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.15);
}
</style>