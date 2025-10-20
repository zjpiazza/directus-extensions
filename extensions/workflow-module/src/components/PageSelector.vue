<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import type { Page } from '../composables/useWorkflowData';

interface Props {
  pages: Page[];
  currentPageId: string;
  isEditMode: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  'navigate-to-page': [pageId: string];
  'create-page': [];
  'delete-page': [pageId: string];
  'rename-page': [pageId: string, newName: string];
}>();

const showPageMenu = ref(false);
const isRenaming = ref<string | null>(null);
const newPageName = ref('');
const renameInput = ref<HTMLInputElement>();

// Get all pages including root
const allPages = computed(() => [
  { id: 'root', name: 'Main', description: 'Main workflow page', color: '#6366f1' },
  ...props.pages
]);

const currentPage = computed(() => {
  return allPages.value.find(p => p.id === props.currentPageId) || allPages.value[0];
});

const currentPageIndex = computed(() => {
  return allPages.value.findIndex(p => p.id === props.currentPageId);
});

const canGoFirst = computed(() => currentPageIndex.value > 0);
const canGoPrevious = computed(() => currentPageIndex.value > 0);
const canGoNext = computed(() => currentPageIndex.value < allPages.value.length - 1);
const canGoLast = computed(() => currentPageIndex.value < allPages.value.length - 1);

const goToFirst = () => {
  if (canGoFirst.value) {
    emit('navigate-to-page', allPages.value[0].id);
  }
};

const goPrevious = () => {
  if (canGoPrevious.value) {
    emit('navigate-to-page', allPages.value[currentPageIndex.value - 1].id);
  }
};

const goNext = () => {
  if (canGoNext.value) {
    emit('navigate-to-page', allPages.value[currentPageIndex.value + 1].id);
  }
};

const goToLast = () => {
  if (canGoLast.value) {
    emit('navigate-to-page', allPages.value[allPages.value.length - 1].id);
  }
};

const handlePageClick = (pageId: string) => {
  if (pageId !== props.currentPageId) {
    emit('navigate-to-page', pageId);
  }
  showPageMenu.value = false;
};

const handleCreatePage = () => {
  emit('create-page');
  showPageMenu.value = false;
};

const handleDeletePage = (pageId: string, event: Event) => {
  event.stopPropagation();
  if (pageId !== 'root' && confirm('Are you sure you want to delete this page?')) {
    emit('delete-page', pageId);
  }
};

const startRename = (pageId: string, currentName: string, event: Event) => {
  event.stopPropagation();
  if (pageId === 'root') return;
  
  isRenaming.value = pageId;
  newPageName.value = currentName;
  
  nextTick(() => {
    renameInput.value?.focus();
    renameInput.value?.select();
  });
};

const finishRename = () => {
  if (isRenaming.value && newPageName.value.trim()) {
    emit('rename-page', isRenaming.value, newPageName.value.trim());
  }
  isRenaming.value = null;
  newPageName.value = '';
};

const cancelRename = () => {
  isRenaming.value = null;
  newPageName.value = '';
};

const togglePageMenu = () => {
  showPageMenu.value = !showPageMenu.value;
};

// Close dropdown when clicking outside
const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement;
  if (!target.closest('.page-selector')) {
    showPageMenu.value = false;
    cancelRename();
  }
};

watch(showPageMenu, (show) => {
  if (show) {
    document.addEventListener('click', handleClickOutside);
  } else {
    document.removeEventListener('click', handleClickOutside);
  }
});
</script>

<template>
  <div class="page-selector">
    <!-- Horizontal Navigation Bar -->
    <div class="nav-bar">
      <!-- First page button -->
      <button 
        class="nav-btn"
        :class="{ disabled: !canGoFirst }"
        :disabled="!canGoFirst"
        @click="goToFirst"
        title="First page"
      >
        <v-icon name="first_page" />
      </button>
      
      <!-- Previous page button -->
      <button 
        class="nav-btn"
        :class="{ disabled: !canGoPrevious }"
        :disabled="!canGoPrevious"
        @click="goPrevious"
        title="Previous page"
      >
        <v-icon name="chevron_left" />
      </button>
      
      <!-- Current page info -->
      <div class="page-info">
        <div class="page-indicator" :style="{ backgroundColor: currentPage.color }"></div>
        <span class="page-text">{{ currentPageIndex + 1 }} / {{ allPages.length }}</span>
        <span v-if="currentPage.name !== `Page ${currentPageIndex + 1}` && currentPage.name !== 'Main'" class="page-name">
          ({{ currentPage.name }})
        </span>
      </div>
      
      <!-- Next page button -->
      <button 
        class="nav-btn"
        :class="{ disabled: !canGoNext }"
        :disabled="!canGoNext"
        @click="goNext"
        title="Next page"
      >
        <v-icon name="chevron_right" />
      </button>
      
      <!-- Last page button -->
      <button 
        class="nav-btn"
        :class="{ disabled: !canGoLast }"
        :disabled="!canGoLast"
        @click="goToLast"
        title="Last page"
      >
        <v-icon name="last_page" />
      </button>
      
      <!-- Edit mode menu -->
      <div v-if="isEditMode" class="edit-menu">
        <div class="separator"></div>
        
        <div class="menu-dropdown" :class="{ open: showPageMenu }">
          <button class="menu-btn" @click="togglePageMenu" title="Page options">
            <v-icon name="more_vert" />
          </button>
          
          <!-- Dropdown menu -->
          <Transition name="menu">
            <div v-if="showPageMenu" class="dropdown-menu">
              <div class="menu-header">Page Management</div>
              
              <div class="menu-items">
                <div 
                  v-for="page in allPages" 
                  :key="page.id"
                  class="menu-item page-item"
                  :class="{ active: page.id === currentPageId }"
                >
                  <div class="page-indicator" :style="{ backgroundColor: page.color }"></div>
                  
                  <div class="page-content">
                    <input
                      v-if="isRenaming === page.id"
                      ref="renameInput"
                      v-model="newPageName"
                      class="rename-input"
                      @blur="finishRename"
                      @keydown.enter="finishRename"
                      @keydown.escape="cancelRename"
                      @click.stop
                    />
                    <span v-else class="page-name" @click="handlePageClick(page.id)">{{ page.name }}</span>
                  </div>
                  
                  <div v-if="page.id !== 'root'" class="page-actions">
                    <button 
                      class="action-btn rename-btn"
                      @click="startRename(page.id, page.name, $event)"
                      title="Rename page"
                    >
                      <v-icon name="edit" />
                    </button>
                    <button 
                      v-if="allPages.length > 1"
                      class="action-btn delete-btn"
                      @click="handleDeletePage(page.id, $event)"
                      title="Delete page"
                    >
                      <v-icon name="delete" />
                    </button>
                  </div>
                </div>
                
                <div class="menu-divider"></div>
                <div class="menu-item add-page" @click="handleCreatePage">
                  <v-icon name="add" class="add-icon" />
                  <span class="page-name">Add Page</span>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-selector {
  position: relative;
  z-index: 1000;
}

.nav-bar {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 8px;
  background: var(--theme--background, #2a2a2a);
  border: 1px solid var(--theme--border-color, #4a4a4a);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  user-select: none;
}

.nav-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: transparent;
  border: none;
  border-radius: 4px;
  color: var(--theme--foreground, #ffffff);
  cursor: pointer;
  transition: all 0.15s ease;
}

.nav-btn:hover:not(.disabled) {
  background: var(--theme--background-accent, #3a3a3a);
  color: var(--theme--primary, #6366f1);
}

.nav-btn.disabled {
  color: var(--theme--foreground-subdued, #6c757d);
  cursor: not-allowed;
  opacity: 0.5;
}

.page-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  margin: 0 8px;
}

.page-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.page-text {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--theme--foreground, #ffffff);
  white-space: nowrap;
}

.page-name {
  font-size: 0.75rem;
  color: var(--theme--foreground-subdued, #aaaaaa);
  white-space: nowrap;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.edit-menu {
  display: flex;
  align-items: center;
  margin-left: 8px;
}

.separator {
  width: 1px;
  height: 20px;
  background: var(--theme--border-color, #4a4a4a);
  margin: 0 8px;
}

.menu-dropdown {
  position: relative;
}

.menu-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: transparent;
  border: none;
  border-radius: 4px;
  color: var(--theme--foreground, #ffffff);
  cursor: pointer;
  transition: all 0.15s ease;
}

.menu-btn:hover {
  background: var(--theme--background-accent, #3a3a3a);
  color: var(--theme--primary, #6366f1);
}

.dropdown-menu {
  position: absolute;
  bottom: 100%;
  right: 0;
  margin-bottom: 8px;
  min-width: 240px;
  background: var(--theme--background, white);
  border: 1px solid var(--theme--border-color, #e1e5e9);
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  backdrop-filter: blur(8px);
}

.menu-header {
  padding: 12px 16px;
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--theme--foreground, #1a1a1a);
  background: var(--theme--background-accent, #f8f9fa);
  border-bottom: 1px solid var(--theme--border-color-subdued, #f1f3f5);
}

.menu-items {
  padding: 4px 0;
  max-height: 300px;
  overflow-y: auto;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.menu-item:hover {
  background: var(--theme--background-accent, #f8f9fa);
}

.menu-item.active {
  background: var(--theme--primary-background, rgba(99, 102, 241, 0.08));
}

.menu-item.active .page-name {
  color: var(--theme--primary, #6366f1);
  font-weight: 600;
}

.menu-item.add-page {
  color: var(--theme--primary, #6366f1);
  border-top: 1px solid var(--theme--border-color-subdued, #f1f3f5);
}

.menu-item.add-page:hover {
  background: var(--theme--primary-background, rgba(99, 102, 241, 0.08));
}

.page-content {
  flex: 1;
  min-width: 0;
}

.page-content .page-name {
  display: block;
  font-size: 0.875rem;
  color: var(--theme--foreground, #1a1a1a);
  cursor: pointer;
}

.rename-input {
  width: 100%;
  background: var(--theme--background, white);
  border: 1px solid var(--theme--primary, #6366f1);
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 0.875rem;
  color: var(--theme--foreground, #1a1a1a);
  outline: none;
}

.page-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.menu-item:hover .page-actions {
  opacity: 1;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  background: transparent;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s ease;
  color: var(--theme--foreground-subdued, #6c757d);
}

.action-btn:hover {
  background: var(--theme--background-accent, #f8f9fa);
}

.rename-btn:hover {
  color: var(--theme--primary, #6366f1);
}

.delete-btn:hover {
  color: var(--theme--danger, #dc3545);
  background: var(--theme--danger-background, rgba(220, 53, 69, 0.1));
}

.add-icon {
  color: var(--theme--primary, #6366f1);
}

.menu-divider {
  height: 1px;
  background: var(--theme--border-color-subdued, #f1f3f5);
  margin: 4px 0;
}

/* Animations */
.menu-enter-active,
.menu-leave-active {
  transition: all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.menu-enter-from {
  opacity: 0;
  transform: translateY(8px) scale(0.95);
}

.menu-leave-to {
  opacity: 0;
  transform: translateY(4px) scale(0.98);
}

.menu-enter-to,
.menu-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}

/* Scrollbar styling for menu */
.menu-items::-webkit-scrollbar {
  width: 6px;
}

.menu-items::-webkit-scrollbar-track {
  background: transparent;
}

.menu-items::-webkit-scrollbar-thumb {
  background: var(--theme--border-color, #e1e5e9);
  border-radius: 3px;
}

.menu-items::-webkit-scrollbar-thumb:hover {
  background: var(--theme--foreground-subdued, #6c757d);
}

/* Responsive design */
@media (max-width: 640px) {
  .nav-bar {
    padding: 6px;
    gap: 1px;
  }
  
  .nav-btn {
    width: 28px;
    height: 28px;
  }
  
  .page-info {
    padding: 0 8px;
    margin: 0 4px;
  }
  
  .page-text {
    font-size: 0.8125rem;
  }
  
  .page-name {
    font-size: 0.6875rem;
    max-width: 80px;
  }
  
  .dropdown-menu {
    min-width: 200px;
  }
}
</style>