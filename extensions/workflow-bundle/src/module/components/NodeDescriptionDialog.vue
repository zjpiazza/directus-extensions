<template>
  <Transition name="description-fade">
    <div 
      v-if="nodeDescription && showDialog" 
      class="node-description-dialog"
      :class="{ 'no-description': !nodeDescription.hasDescription }"
      :style="dialogPosition"
    >
      <div class="description-header">
        <div class="description-title">
          <v-icon :name="getNodeIcon(nodeDescription.type)" />
          <span>{{ nodeDescription.title }}</span>
        </div>
        <div class="description-type">{{ formatNodeType(nodeDescription.type) }}</div>
      </div>
      <div class="description-content">
        <p :class="{ 'no-description-text': !nodeDescription.hasDescription }">
          {{ nodeDescription.description }}
        </p>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface NodeDescription {
  type: string;
  title: string;
  description: string;
  hasDescription: boolean;
  x: number;
  y: number;
}

interface Props {
  nodeDescription: NodeDescription | null;
  showDialog: boolean;
}

const props = defineProps<Props>();

// Dialog positioning
const dialogPosition = computed(() => {
  if (!props.nodeDescription) return {};
  
  return {
    position: 'absolute',
    left: `${props.nodeDescription.x + 20}px`,
    top: `${props.nodeDescription.y + 10}px`,
    zIndex: 1000,
  };
});

// Node icon mapping
const getNodeIcon = (nodeType: string): string => {
  const iconMap: Record<string, string> = {
    start: 'play_arrow',
    end: 'stop',
    process: 'settings',
    decision: 'help',
    page: 'article',
    terminal: 'terminal',
  };
  return iconMap[nodeType] || 'circle';
};

// Format node type for display
const formatNodeType = (nodeType: string): string => {
  return nodeType.charAt(0).toUpperCase() + nodeType.slice(1) + ' Node';
};
</script>

<style scoped>
/* Node Description Dialog Styles */
.node-description-dialog {
  width: 300px;
  max-width: calc(100vw - 40px);
  background: var(--theme--background, white);
  border: 1px solid var(--theme--border-color, #e1e5e9);
  border-radius: 12px;
  box-shadow: 
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04),
    0 0 0 1px rgba(0, 0, 0, 0.05);
  backdrop-filter: blur(8px);
  overflow: hidden;
  pointer-events: none; /* Allow interaction with nodes underneath */
}

.description-header {
  padding: 1rem 1.25rem 0.75rem;
  border-bottom: 1px solid var(--theme--border-color-subdued, #f1f3f5);
  background: linear-gradient(135deg, 
    var(--theme--background-accent, #f8f9fa) 0%, 
    var(--theme--background, white) 100%);
}

.description-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  font-size: 1rem;
  color: var(--theme--foreground, #1a1a1a);
  margin-bottom: 0.25rem;
}

.description-title .v-icon {
  width: 20px;
  height: 20px;
  color: var(--theme--primary, #0066cc);
}

.description-type {
  font-size: 0.75rem;
  color: var(--theme--foreground-subdued, #6c757d);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.description-content {
  padding: 1rem 1.25rem 1.25rem;
}

.description-content p {
  margin: 0;
  color: var(--theme--foreground, #1a1a1a);
  font-size: 0.875rem;
  line-height: 1.5;
  word-wrap: break-word;
}

.description-content .no-description-text {
  color: var(--theme--foreground-subdued, #6c757d);
  font-style: italic;
  opacity: 0.8;
}

.node-description-dialog.no-description {
  opacity: 0.9;
}

.node-description-dialog.no-description .description-header {
  background: linear-gradient(135deg, 
    var(--theme--background-subdued, #f1f3f5) 0%, 
    var(--theme--background, white) 100%);
}

/* Fade in/out animation for description dialog */
.description-fade-enter-active {
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.description-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.55, 0, 0.1, 1);
}

.description-fade-enter-from {
  opacity: 0;
  transform: scale(0.8) translateY(-10px);
}

.description-fade-leave-to {
  opacity: 0;
  transform: scale(0.9) translateY(-5px);
}
</style>