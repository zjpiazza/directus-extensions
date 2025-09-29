<script setup lang="ts">
import { computed } from 'vue';

export interface Breadcrumb {
  id: string;
  name: string;
}

interface Props {
  breadcrumbs: Breadcrumb[];
  currentPageId: string;
  isEditMode: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  'navigate-to-page': [pageId: string];
}>();

const handleBreadcrumbClick = (pageId: string) => {
  if (pageId !== props.currentPageId) {
    emit('navigate-to-page', pageId);
  }
};

const isCurrentPage = (pageId: string) => {
  return pageId === props.currentPageId;
};
</script>

<template>
  <div class="page-navigation">
    <div class="breadcrumb-container">
      <div class="breadcrumb-icon">
        <v-icon name="account_tree" />
      </div>
      
      <nav class="breadcrumb-nav" aria-label="Page navigation">
        <ol class="breadcrumb-list">
          <li 
            v-for="(breadcrumb, index) in breadcrumbs" 
            :key="breadcrumb.id"
            class="breadcrumb-item"
            :class="{ 'current': isCurrentPage(breadcrumb.id) }"
          >
            <button
              v-if="!isCurrentPage(breadcrumb.id)"
              class="breadcrumb-button"
              @click="handleBreadcrumbClick(breadcrumb.id)"
              :title="`Navigate to ${breadcrumb.name}`"
            >
              {{ breadcrumb.name }}
            </button>
            <span v-else class="breadcrumb-current">
              {{ breadcrumb.name }}
            </span>
            
            <v-icon 
              v-if="index < breadcrumbs.length - 1" 
              name="chevron_right" 
              class="breadcrumb-separator"
            />
          </li>
        </ol>
      </nav>

      <div class="page-actions">
        <div class="page-info">
          <span class="page-type">Page</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-navigation {
  background: var(--theme--background-accent, #f8f9fa);
  border-bottom: 1px solid var(--theme--border-color-subdued, #e5e7eb);
  padding: 0.75rem 1rem;
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(8px);
}

.breadcrumb-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  max-width: 100%;
}

.breadcrumb-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  color: var(--theme--primary, #0066cc);
}

.breadcrumb-icon .v-icon {
  width: 16px;
  height: 16px;
}

.breadcrumb-nav {
  flex: 1;
  min-width: 0;
}

.breadcrumb-list {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  list-style: none;
  margin: 0;
  padding: 0;
  flex-wrap: wrap;
}

.breadcrumb-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
}

.breadcrumb-button {
  padding: 0.25rem 0.5rem;
  background: transparent;
  border: none;
  border-radius: 4px;
  color: var(--theme--primary, #0066cc);
  cursor: pointer;
  font-size: inherit;
  font-weight: 500;
  transition: all 0.2s ease;
  text-decoration: none;
  white-space: nowrap;
}

.breadcrumb-button:hover {
  background: var(--theme--primary-background, rgba(0, 102, 204, 0.1));
  color: var(--theme--primary-accent, #0052a3);
}

.breadcrumb-button:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(0, 102, 204, 0.2);
}

.breadcrumb-current {
  padding: 0.25rem 0.5rem;
  color: var(--theme--foreground, #1a1a1a);
  font-weight: 600;
  background: var(--theme--background, white);
  border-radius: 4px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  white-space: nowrap;
}

.breadcrumb-separator {
  width: 12px;
  height: 12px;
  color: var(--theme--foreground-subdued, #6b7280);
  flex-shrink: 0;
}

.page-actions {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.page-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.page-type {
  font-size: 0.75rem;
  color: var(--theme--foreground-subdued, #6b7280);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 0.25rem 0.5rem;
  background: var(--theme--background, white);
  border-radius: 12px;
  border: 1px solid var(--theme--border-color-subdued, #e5e7eb);
}

/* Responsive design */
@media (max-width: 640px) {
  .page-navigation {
    padding: 0.5rem 0.75rem;
  }
  
  .breadcrumb-container {
    gap: 0.5rem;
  }
  
  .breadcrumb-item {
    font-size: 0.8125rem;
  }
  
  .breadcrumb-button,
  .breadcrumb-current {
    padding: 0.1875rem 0.375rem;
  }
  
  .page-type {
    font-size: 0.6875rem;
    padding: 0.1875rem 0.375rem;
  }
}
</style>