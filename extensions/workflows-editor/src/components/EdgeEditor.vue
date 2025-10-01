<script setup lang="ts">
import type { Edge } from '@vue-flow/core';

interface Props {
  selectedEdge: Edge | null;
  isEditMode: boolean;
  isViewMode: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update-edge-data': [];
  'delete-selected-edge': [];
}>();

const updateEdgeData = () => {
  emit('update-edge-data');
};

const deleteSelectedEdge = () => {
  emit('delete-selected-edge');
};
</script>

<template>
  <div v-if="selectedEdge">
    <h3>Edge Details</h3>
    <div class="edge-properties">
      <div class="property-group">
        <label>Label</label>
        <input
          v-model="selectedEdge.data.label"
          :readonly="isViewMode"
          class="input-field"
          placeholder="Enter edge label..."
          @input="isEditMode ? updateEdgeData() : undefined"
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

.input-field {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--theme--border-color, #e1e5e9);
  border-radius: 6px;
  background: var(--theme--background, white);
  color: var(--theme--foreground, #1a1a1a);
  font-size: 0.875rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.input-field:focus {
  outline: none;
  border-color: var(--theme--primary, #0066cc);
  box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.15);
}

.input-field[readonly] {
  background: var(--theme--background-subdued, #f8f9fa);
  cursor: not-allowed;
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

.btn-danger {
  background: var(--theme--danger, #dc3545);
  color: white;
  border-color: var(--theme--danger, #dc3545);
}

.btn-danger:hover:not(:disabled) {
  background: var(--theme--danger-hover, #c82333);
  border-color: var(--theme--danger-hover, #c82333);
}

.btn.block {
  width: 100%;
  justify-content: center;
}
</style>