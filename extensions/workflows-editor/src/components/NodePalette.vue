<script setup lang="ts">
interface NodeType {
  type: string;
  subtype?: string;
  label: string;
  icon: string;
}

interface Props {
  isEditMode: boolean;
  nodeTypes: NodeType[];
}

defineProps<Props>();

const emit = defineEmits<{
  'drag-start': [event: DragEvent, nodeType: NodeType];
}>();

const onDragStart = (event: DragEvent, nodeType: NodeType) => {
  if (event.dataTransfer) {
    event.dataTransfer.setData('application/vueflow', JSON.stringify(nodeType));
    event.dataTransfer.effectAllowed = 'move';
  }
  emit('drag-start', event, nodeType);
};
</script>

<template>
  <div v-if="isEditMode" class="node-palette">
    <h3>Node Types</h3>
    <div class="node-types">
      <div
        v-for="nodeType in nodeTypes"
        :key="nodeType.type"
        class="node-item"
        :class="nodeType.type"
        draggable="true"
        @dragstart="onDragStart($event, nodeType)"
      >
        <div class="node-preview">
          <span class="icon">{{ nodeType.icon }}</span>
        </div>
        <span class="node-label">{{ nodeType.label }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.node-palette {
  background: var(--theme--background-subdued, #f8f9fa);
  border-right: 1px solid var(--theme--border-color, #e1e5e9);
  padding: 1.5rem;
  overflow: hidden;
  z-index: 10;
  width: 250px;
}

.node-palette h3 {
  margin: 0 0 1.5rem 0;
  color: var(--theme--foreground, #1a1a1a);
  font-size: 1.1rem;
  font-weight: 600;
}

.node-types {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.node-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--theme--background-normal, white);
  border: 1px solid var(--theme--border-color, #e1e5e9);
  border-radius: 4px;
  cursor: grab;
  transition: all 0.2s;
  min-height: 60px;
  user-select: none;
}

.node-item:hover {
  background: var(--theme--background-accent, #f0f2f5);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.node-item:active {
  cursor: grabbing;
  transform: translateY(0);
}

.node-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: var(--theme--primary-background, #e3f2fd);
  border-radius: 50%;
  color: var(--theme--primary, #0066cc);
}

.icon {
  font-size: 18px;
  line-height: 1;
}

.node-label {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--theme--foreground, #1a1a1a);
}
</style>
