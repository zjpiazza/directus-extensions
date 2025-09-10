<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  collection: string;
  primaryKey?: string | null;
  title: string;
  hasEdits: boolean;
  saving: boolean;
  isNew: boolean;
  collectionInfo: any;
  item: Record<string, any> | null;
  validationErrors: any[];
  flowName: string;
  mode: 'edit' | 'view';
  canEdit: boolean;
  followMode: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  save: [];
  delete: [];
  archive: [];
  refresh: [];
  'save-as-copy': [];
  'update-flow-name': [value: string];
  'update-mode': [mode: 'edit' | 'view'];
  'toggle-follow-mode': [enabled: boolean];
}>();

const handleUpdateFlowName = (name: string) => {
  emit('update-flow-name', name);
};

const handleModeChange = (newMode: 'edit' | 'view') => {
  emit('update-mode', newMode);
};

const toggleFollowMode = (enabled: boolean) => {
  emit('toggle-follow-mode', enabled);
};
</script>

<template>
  <div class="custom-header">
    <div class="header-content">
      <div class="title-section">
        <h1 class="flow-title">{{ title }}</h1>
        <div class="flow-name-input">
          <input
            :value="flowName"
            placeholder="Enter flow name..."
            class="flow-name-input-field"
            data-test="flow-name-input"
            @input="handleUpdateFlowName(($event.target as HTMLInputElement).value)"
          />
        </div>
      </div>

      <div class="header-actions">
        <button
          v-if="canEdit"
          class="btn btn-secondary"
          @click="$emit('refresh')"
        >
          <span class="icon">🔄</span>
          Refresh
        </button>

        <button
          v-if="mode === 'view' && canEdit"
          class="btn btn-primary"
          @click="handleModeChange('edit')"
        >
          <span class="icon">✏️</span>
          Edit
        </button>

        <button
          v-if="mode === 'edit'"
          class="btn btn-secondary"
          @click="handleModeChange('view')"
        >
          <span class="icon">👁️</span>
          View
        </button>

        <button
          v-if="followMode"
          class="btn btn-warning"
          @click="toggleFollowMode(false)"
        >
          <span class="icon">🎯</span>
          Exit Follow
        </button>

        <button
          v-else
          class="btn btn-secondary"
          @click="toggleFollowMode(true)"
        >
          <span class="icon">🎯</span>
          Follow Mode
        </button>

        <button
          v-if="canEdit"
          class="btn btn-success"
          data-test="save-flow-btn"
          :disabled="saving || (!hasEdits && !(props.isNew && flowName && flowName.trim().length > 0))"
          @click="$emit('save')"
        >
          <span class="icon">💾</span>
          {{ saving ? (props.isNew ? 'Creating...' : 'Saving...') : (props.isNew ? 'Create' : 'Save') }}
        </button>
      </div>
    </div>

    <div v-if="validationErrors.length > 0" class="validation-errors">
      <div class="error-list">
        <div v-for="error in validationErrors" :key="error.field" class="error-item">
          {{ error.field }}: {{ error.code }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-header {
  background: var(--theme--background-accent, #f8f9fa);
  border-bottom: 1px solid var(--theme--border-color, #e1e5e9);
  padding: 1rem 2rem;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
}

.title-section {
  flex: 1;
  min-width: 0;
}

.flow-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--theme--foreground, #1a1a1a);
  margin: 0 0 0.5rem 0;
}

.flow-name-input {
  display: flex;
  align-items: center;
}

.flow-name-input-field {
  font-size: 1.25rem;
  font-weight: 500;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--theme--border-color, #e1e5e9);
  border-radius: 4px;
  background: var(--theme--background, white);
  color: var(--theme--foreground, #1a1a1a);
  min-width: 300px;
}

.flow-name-input-field:focus {
  outline: none;
  border-color: var(--theme--primary, #0066cc);
  box-shadow: 0 0 0 2px rgba(0, 102, 204, 0.2);
}

.header-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid transparent;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
}

.btn:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(0, 102, 204, 0.2);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: var(--theme--primary, #0066cc);
  color: white;
  border-color: var(--theme--primary, #0066cc);
}

.btn-primary:hover:not(:disabled) {
  background: var(--theme--primary-hover, #0052a3);
  border-color: var(--theme--primary-hover, #0052a3);
}

.btn-secondary {
  background: var(--theme--background, white);
  color: var(--theme--foreground, #1a1a1a);
  border-color: var(--theme--border-color, #e1e5e9);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--theme--background-accent, #f8f9fa);
}

.btn-success {
  background: var(--theme--success, #28a745);
  color: white;
  border-color: var(--theme--success, #28a745);
}

.btn-success:hover:not(:disabled) {
  background: var(--theme--success-hover, #218838);
  border-color: var(--theme--success-hover, #218838);
}

.btn-warning {
  background: var(--theme--warning, #ffc107);
  color: #212529;
  border-color: var(--theme--warning, #ffc107);
}

.btn-warning:hover:not(:disabled) {
  background: var(--theme--warning-hover, #e0a800);
  border-color: var(--theme--warning-hover, #e0a800);
}

.icon {
  font-size: 1rem;
  line-height: 1;
}

.validation-errors {
  margin-top: 1rem;
  padding: 0.75rem;
  background: var(--theme--danger-background, #f8d7da);
  border: 1px solid var(--theme--danger, #dc3545);
  border-radius: 4px;
}

.error-list {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.error-item {
  color: var(--theme--danger, #dc3545);
  font-size: 0.875rem;
}
</style>
