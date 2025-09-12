<script setup lang="ts">
interface Workflow {
  id: string;
  name: string;
}

interface Props {
  workflows: Workflow[];
  usedWorkflowIds: string[];
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'navigate-to-workflow': [workflowId: string];
}>();

const getWorkflowLetter = (index: number) => {
  return String.fromCharCode(65 + index);
};

const navigateToWorkflow = (workflowId: string) => {
  emit('navigate-to-workflow', workflowId);
};
</script>

<template>
  <div v-if="usedWorkflowIds.length > 0" class="workflow-legend">
    <h4 class="legend-title">Off-page References</h4>
    <div class="legend-items">
      <div
        v-for="(workflow, index) in workflows"
        :key="workflow.id"
        v-show="usedWorkflowIds.includes(workflow.id)"
        class="legend-item"
      >
        <div class="legend-symbol">
          <span class="legend-letter">{{ getWorkflowLetter(index) }}</span>
        </div>
        <span class="legend-name">{{ workflow.name || 'Unnamed Workflow' }}</span>
        <button
          class="legend-nav-btn"
          @click="navigateToWorkflow(workflow.id)"
          title="Go to workflow"
        >
          <v-icon name="arrow_forward" />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.workflow-legend {
  background: var(--theme--background-normal, white);
  border: 1px solid var(--theme--border-color, #e1e5e9);
  border-radius: 6px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.legend-title {
  margin: 0 0 0.75rem 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--theme--foreground, #1a1a1a);
}

.legend-items {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  background: var(--theme--background-subdued, #f8f9fa);
  border-radius: 4px;
  transition: background 0.2s ease;
}

.legend-item:hover {
  background: var(--theme--background-accent, #f0f2f5);
}

.legend-symbol {
  width: 24px;
  height: 20px;
  background: #475569;
  border: 1px solid #475569;
  clip-path: polygon(0% 0%, 100% 0%, 100% 75%, 50% 100%, 0% 75%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.legend-letter {
  font-size: 12px;
  font-weight: 700;
  color: #ffffff;
  text-shadow: 0 1px 1px rgba(0,0,0,0.3);
  line-height: 1;
}

.legend-name {
  flex: 1;
  font-size: 0.875rem;
  color: var(--theme--foreground, #1a1a1a);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.legend-nav-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  color: var(--theme--foreground-subdued, #6c757d);
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
}

.legend-nav-btn:hover {
  background: var(--theme--primary, #0066cc);
  color: white;
}

.legend-nav-btn:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(0, 102, 204, 0.2);
}
</style>