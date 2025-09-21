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
  showDescriptions: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  save: [];
  delete: [];
  archive: [];
  'save-as-copy': [];
  'update-flow-name': [value: string];
  'update-mode': [mode: 'edit' | 'view'];
  'toggle-follow-mode': [enabled: boolean];
  'toggle-descriptions': [enabled: boolean];
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

const toggleDescriptions = (enabled: boolean) => {
  emit('toggle-descriptions', enabled);
};

// Breadcrumbs
const breadcrumbs = computed(() => {
  const crumbs: Array<{ name: string; to?: string }> = [
    {
      name: 'Content',
      to: '/content',
    },
    {
      name: props.collectionInfo?.name || props.collection,
      to: `/content/${props.collection}`,
    },
  ];

  if (props.isNew) {
    crumbs.push({
      name: 'Creating new item',
    });
  } else {
    crumbs.push({
      name: props.flowName || 'Untitled Workflow',
    });
  }

  return crumbs;
});
</script>

<template>
  <div class="custom-header">
    <!-- Breadcrumb section -->
    <div class="header-top">
      <nav class="breadcrumbs">
        <template v-for="(crumb, index) in breadcrumbs" :key="index">
          <router-link 
            v-if="crumb.to" 
            :to="crumb.to" 
            class="breadcrumb-link"
          >
            {{ crumb.name }}
          </router-link>
          <span v-else class="breadcrumb-current">{{ crumb.name }}</span>
          <span 
            v-if="index < breadcrumbs.length - 1" 
            class="breadcrumb-separator"
          >
            &gt;
          </span>
        </template>
      </nav>
    </div>

    <!-- Main header section -->
    <div class="header-main">
      <div class="header-left">
        <router-link 
          :to="`/content/${collection}`"
          class="back-button btn btn-secondary"
        >
          <v-icon name="arrow_back" />
        </router-link>

        <div class="title-section">
          <h1 class="header-title">{{ title }}</h1>
          <div class="flow-name-input">
            <input
              :value="flowName"
              placeholder="Enter workflow name..."
              class="flow-name-input-field"
              data-test="flow-name-input"
              @input="handleUpdateFlowName(($event.target as HTMLInputElement).value)"
            />
          </div>
        </div>
      </div>

      <div class="header-actions">
        <!-- Mode Button Group -->
        <div class="mode-button-group">
          <button
            class="mode-btn"
            :class="{ active: mode === 'view' && !followMode }"
            @click="handleModeChange('view'); toggleFollowMode(false)"
          >
            <v-icon name="visibility" />
            View
          </button>
          <button
            class="mode-btn"
            :class="{ active: mode === 'edit' && !followMode }"
            @click="handleModeChange('edit'); toggleFollowMode(false)"
          >
            <v-icon name="edit" />
            Edit
          </button>
          <button
            class="mode-btn follow-btn"
            :class="{ active: followMode }"
            @click="toggleFollowMode(true)"
          >
            <v-icon name="gps_fixed" />
            Follow
          </button>
        </div>

        <!-- Description Toggle (only visible in follow mode) -->
        <div v-if="followMode" class="description-toggle">
          <button
            class="toggle-btn"
            :class="{ active: showDescriptions }"
            @click="toggleDescriptions(!showDescriptions)"
            title="Toggle node descriptions"
          >
            <v-icon name="description" />
            <span>Descriptions</span>
            <div class="toggle-indicator" :class="{ active: showDescriptions }">
              <div class="toggle-dot"></div>
            </div>
          </button>
        </div>

        <button
          v-if="canEdit"
          class="btn btn-success"
          data-test="save-flow-btn"
          :disabled="saving || (!hasEdits && !(props.isNew && flowName && flowName.trim().length > 0))"
          @click="$emit('save')"
        >
          <v-icon name="save" />
          {{ saving ? (props.isNew ? 'Creating...' : 'Saving...') : (props.isNew ? 'Create' : 'Save') }}
        </button>
      </div>
    </div>

    <!-- Validation errors -->
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
  background: var(--theme--background);
  border-bottom: 1px solid var(--theme--border-color);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-top {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0.375rem 1.5rem;
	background: var(--theme--background-subdued);
	border-bottom: 1px solid var(--theme--border-color-subdued);
	block-size: calc(60px + var(--theme--navigation--project--border-width));
}

.breadcrumbs {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
}

.breadcrumb-link {
  color: var(--theme--primary);
  text-decoration: none;
  transition: color 0.2s;
}

.breadcrumb-link:hover {
  color: var(--theme--primary-accent);
}

.breadcrumb-current {
  color: var(--theme--foreground-subdued);
  font-weight: 500;
}

.breadcrumb-separator {
  color: var(--theme--foreground-subdued);
  margin: 0 0.25rem;
}

.header-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  min-height: 70px;
  background: var(--theme--background);
  color: var(--theme--foreground);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
  min-width: 0;
}

.back-button {
  color: var(--theme--foreground-subdued);
  border-color: var(--theme--border-color);
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border: 1px solid transparent;
  border-radius: 50%;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 40px;
  height: 40px;
  justify-content: center;
}

.back-button:hover {
  color: var(--theme--foreground);
  border-color: var(--theme--border-color-accent);
  background: var(--theme--background-accent);
}

.title-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
  min-width: 0;
}

.header-title {
  color: var(--theme--foreground);
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
}

.flow-name-input {
  display: flex;
  align-items: center;
}

.flow-name-input-field {
  font-size: 1rem;
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
  flex-shrink: 0;
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
  margin: 1rem 1.5rem 0;
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

/* Mode button group styles */
.mode-button-group {
  display: flex;
  border: 1px solid var(--theme--border-color, #e1e5e9);
  border-radius: 6px;
  overflow: hidden;
  background: var(--theme--background, white);
}

.mode-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.875rem;
  border: none;
  background: var(--theme--background, white);
  color: var(--theme--foreground-subdued, #6c757d);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  border-radius: 0;
}

/* First button gets left radius */
.mode-btn:first-child {
  border-top-left-radius: 5px;
  border-bottom-left-radius: 5px;
}

/* Last button gets right radius */
.mode-btn:last-child {
  border-top-right-radius: 5px;
  border-bottom-right-radius: 5px;
}

/* Middle button has no radius */
.mode-btn:not(:first-child):not(:last-child) {
  border-radius: 0;
}

.mode-btn:not(:last-child) {
  border-right: 1px solid var(--theme--border-color, #e1e5e9);
}

.mode-btn:hover:not(.active) {
  background: var(--theme--background-accent, #f8f9fa);
  color: var(--theme--foreground, #1a1a1a);
}

.mode-btn.active {
  background: var(--theme--primary, #0066cc);
  color: white;
  font-weight: 600;
}

.mode-btn:focus {
  outline: none;
  box-shadow: inset 0 0 0 2px rgba(0, 102, 204, 0.3);
}

/* Description toggle styles */
.description-toggle {
  margin-left: 0.5rem;
}

.toggle-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.875rem;
  border: 1px solid var(--theme--border-color, #e1e5e9);
  border-radius: 6px;
  background: var(--theme--background, white);
  color: var(--theme--foreground-subdued, #6c757d);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.toggle-btn:hover {
  background: var(--theme--background-accent, #f8f9fa);
  color: var(--theme--foreground, #1a1a1a);
  border-color: var(--theme--border-color-accent, #d0d7de);
}

.toggle-btn.active {
  background: var(--theme--success-background, #d4edda);
  color: var(--theme--success, #28a745);
  border-color: var(--theme--success, #28a745);
}

.toggle-indicator {
  width: 36px;
  height: 20px;
  background: var(--theme--border-color, #e1e5e9);
  border-radius: 10px;
  position: relative;
  transition: all 0.3s ease;
}

.toggle-indicator.active {
  background: var(--theme--success, #28a745);
}

.toggle-dot {
  width: 16px;
  height: 16px;
  background: white;
  border-radius: 50%;
  position: absolute;
  top: 2px;
  left: 2px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.toggle-indicator.active .toggle-dot {
  transform: translateX(16px);
}
</style>
