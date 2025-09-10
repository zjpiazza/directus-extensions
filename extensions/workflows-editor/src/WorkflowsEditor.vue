<script setup lang="ts">
import { computed, ref, watch, nextTick, onMounted, onUnmounted, provide } from 'vue';
import { VueFlow, ConnectionMode, useVueFlow } from '@vue-flow/core';
import type { Node, Edge, EdgeUpdateEvent, Connection } from '@vue-flow/core';
import { Controls } from '@vue-flow/controls';
import { Background } from '@vue-flow/background';


// Import custom components
import CustomHeader from './components/CustomHeader.vue';
import NodePalette from './components/NodePalette.vue';
import DetailsSidebar from './components/DetailsSidebar.vue';

// Import your custom node components
import TerminalNode from './flow-nodes/TerminalNode.vue';
import ProcessNode from './flow-nodes/ProcessNode.vue';
import DecisionNode from './flow-nodes/DecisionNode.vue';
import OffPageNode from './flow-nodes/OffPageNode.vue';

// Import composables
import { useWorkflowData } from './composables/useWorkflowData';

// Define types for Directus (simplified for now)
interface Field {
  field: string;
  type: string;
  meta?: any;
}

interface ValidationError {
  field: string;
  code: string;
}

interface Props {
  collection: string;
  primaryKey?: string | null;
  isNew: boolean;
  item: Record<string, any> | null;
  edits: Record<string, any>;
  fields: Field[];
  loading: boolean;
  saving: boolean;
  validationErrors: ValidationError[];
  collectionInfo: any;
  permissions: any;
  mode?: 'edit' | 'view';
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'edit',
  edits: () => ({} as Record<string, any>),
  item: () => null,
  validationErrors: () => [],
  collectionInfo: () => ({}),
  permissions: () => ({}),
});

const emit = defineEmits<{
  'update:edits': [value: Record<string, any>];
  save: [];
  refresh: [];
  delete: [];
  archive: [];
  'save-as-copy': [];
  'update:mode': [mode: 'edit' | 'view'];
}>();

// Check if user can edit based on permissions
const canEdit = computed(() => {
  // Check for create permission on new items, update permission on existing items
  if (props.isNew) {
    return props.permissions?.create !== false;
  }
  return props.permissions?.update !== false;
});

// Manual save logic (parent form lifecycle not handling persistence for this editor type)
import { useApi } from '@directus/extensions-sdk';
const api = useApi();

// Provide keys
const WORKFLOWS_KEY = Symbol('workflows-list');
const CURRENT_WORKFLOW_ID_KEY = Symbol('current-workflow-id');

// Basic notification shim (adjust if real notifications composable becomes available)
const notifications = {
  add: (payload: { title: string; text?: string; type?: string }) => {
    const level = payload.type === 'error' ? 'error' : 'info';
    console[level]('[WorkflowsEditor]', payload.title, payload.text || '');
  },
};

const localSaving = ref(false);

// Debug logger (temporary instrumentation)
const debugLog = (...args: any[]) => console.debug('[WorkflowsEditor]', ...args);

// Internal edits mirror to detect parent binding
const internalEdits = ref<Record<string, any>>({ ...(props.edits || {}) });
const lastEmitVersion = ref('');

watch(() => props.edits, (val) => {
  const str = JSON.stringify(val || {});
  if (str !== lastEmitVersion.value) {
    internalEdits.value = { ...(val || {}) };
    debugLog('parent edits sync', val);
  } else {
    debugLog('parent echoed emitted edits');
  }
});

// Use the workflow data composable
const {
  flowNodes,
  flowEdges,
  selectedNode,
  updateNodeData: baseUpdateNodeData,
} = useWorkflowData();

// Override updateNodeData to also persist changes
const updateNodeData = () => {
  baseUpdateNodeData();
  // Update the field to persist the changes
  updateField('data', {
    nodes: flowNodes.value,
    edges: flowEdges.value,
  });
};

// Add selectedEdge state
const selectedEdge = ref<Edge | null>(null);

// Mode-based behavior
const isEditMode = computed(() => props.mode === 'edit');
const isViewMode = computed(() => props.mode === 'view');

// Follow mode state
const followMode = ref(false);
const availableCollections = ref<any[]>([]);
const availableWorkflows = ref<Array<{ id: string; name: string }>>([]);
const showDescriptionModal = ref(false);

// Node types for the palette
const nodeTypes = [
  { type: 'terminal', label: 'Terminal', icon: '⭕' },
  { type: 'process', subtype: 'task', label: 'Task', icon: '▭' },
  { type: 'process', subtype: 'form', label: 'Form', icon: '📄' },
  { type: 'decision', label: 'Decision', icon: '◆' },
  { type: 'offpage', label: 'Off-page Connector', icon: '🏠' },
];

// Vue Flow composable
const { project, fitView, updateEdge, addEdges } = useVueFlow();

// Computed properties
const title = computed(() => {
  return props.isNew
    ? `Creating ${props.collectionInfo?.name || props.collection}`
    : `Editing ${props.collectionInfo?.name || props.collection}`;
});

const hasChanges = computed(() => {
  // Name difference should also count as change
  const currentName = flowName.value?.trim();
  const originalName = props.item?.name ?? '';

  if (props.isNew && currentName) return true;
  if (!props.isNew && currentName && currentName !== originalName) return true;

  // Primary signal: parent-provided edits
  if (props.edits && Object.keys(props.edits).length > 0) return true;
  // Fallback: compare current flow with original item data
  try {
    const original = props.item?.data ? (typeof props.item.data === 'string' ? JSON.parse(props.item.data) : props.item.data) : { nodes: [], edges: [] };
    const current = { nodes: flowNodes.value, edges: flowEdges.value };
    const diverged = JSON.stringify(original.nodes || []) !== JSON.stringify(current.nodes) || JSON.stringify(original.edges || []) !== JSON.stringify(current.edges);
    if (diverged) return true;
  } catch {}
  return false;
});

// Local flow name state to prevent blanking after save
const flowName = ref<string>('');

// Initialize local name from edits/item
watch(
  () => [props.edits?.name, props.item?.name, props.isNew],
  () => {
    // Prefer explicit edit name, else item name, else keep existing if already set during same session
    const candidate = (props.edits as any)?.name ?? props.item?.name;
    if (candidate && candidate !== flowName.value) {
      flowName.value = candidate;
    }
    // If neither provided and empty, leave as empty (user may type next)
  },
  { immediate: true }
);

// Methods
const updateField = (fieldKey: string, value: any) => {
  debugLog('updateField called', fieldKey, value);

  if (props.saving) return;

  const newEdits = { ...(props.edits || {}) };
  newEdits[fieldKey] = value;
  emit('update:edits', newEdits);
  lastEmitVersion.value = JSON.stringify(newEdits);
};

const saveFlow = async () => {
  if (localSaving.value) return;
  debugLog('saveFlow invoked (manual API mode)');
  try {
    localSaving.value = true;
    const flowData = { nodes: flowNodes.value, edges: flowEdges.value };
    const fieldKey = 'data';
    const payload: Record<string, any> = { [fieldKey]: flowData };

    // Always include a name (edits -> item -> fallback)
    const nameValue = flowName.value?.trim() || (props.edits as any).name || props.item?.name || 'Untitled Workflow';
    payload.name = nameValue;

    const isCreate = props.isNew || !props.primaryKey || props.primaryKey === '+';
    if (!isCreate && !props.primaryKey) throw new Error('Missing primary key for update operation');
    const endpoint = isCreate
      ? `/items/${props.collection}`
      : `/items/${props.collection}/${props.primaryKey}`;

    const response = isCreate
      ? await api.post(endpoint, payload)
      : await api.patch(endpoint, payload);

    const saved = response?.data?.data || response?.data;

    // Keep local flowName stable (prefer server echo if provided)
    if (saved?.name && saved.name !== flowName.value) {
      flowName.value = saved.name;
    }

    // Preserve name in edits until item refresh updates props.item.name; clear only data
    const cleared = { ...(props.edits || {}) };
    delete cleared.data;
    // Reassert name into edits if parent cleared it concurrently
    cleared.name = flowName.value;
    emit('update:edits', cleared);
    lastEmitVersion.value = JSON.stringify(cleared);

    notifications.add({ title: 'Workflow Saved', text: saved?.id ? `ID: ${saved.id}` : 'Changes persisted', type: 'success' });

    // Trigger parent refresh only on create to obtain new primary key; avoid clearing name on updates
    if (isCreate) {
      emit('refresh');
    }
  } catch (e: any) {
    const message = e?.response?.data?.errors?.[0]?.message || e.message || 'Failed to save workflow';
    notifications.add({ title: 'Save Failed', text: message, type: 'error' });
    debugLog('save error', e?.response || e);
  } finally {
    localSaving.value = false;
  }
};
// Component event handlers
const handleUpdateFlowName = (name: string) => {
  flowName.value = name;
  updateField('name', name);
};

const handleModeChange = (newMode: 'edit' | 'view') => {
  emit('update:mode', newMode);
};

const toggleFollowMode = (enabled: boolean) => {
  followMode.value = enabled;
};

const onDragStart = (event: DragEvent, nodeType: any) => {
  if (event.dataTransfer) {
    event.dataTransfer.setData('application/vueflow', JSON.stringify(nodeType));
    event.dataTransfer.effectAllowed = 'move';
  }
};

const onDragOver = (event: DragEvent) => {
  if (!isEditMode.value) return;

  event.preventDefault();

  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move';
  }
};

const onDragLeave = () => {
  if (!isEditMode.value) return;
};

const onDrop = (event: DragEvent) => {
  if (!isEditMode.value) return;

  const data = event.dataTransfer?.getData('application/vueflow');
  if (!data) return;

  const nodeType = JSON.parse(data);
  const canvasBounds = (event.currentTarget as HTMLElement).getBoundingClientRect();
  const position = project({
    x: event.clientX - canvasBounds.left,
    y: event.clientY - canvasBounds.top,
  });

  const newNode: Node = {
    id: `${nodeType.type}-${Date.now()}`,
    type: nodeType.type,
    position,
    data: {
      label: `${nodeType.label} Node`,
      name: `${nodeType.label} Node`,
      description: '',
      ...(nodeType.subtype && { subtype: nodeType.subtype }),
      ...(nodeType.subtype === 'form' && { targetCollection: '' }),
      // Provide the openCollection function to process nodes
      ...(nodeType.type === 'process' && { openCollection: handleOpenCollection }),
    },
  };

  flowNodes.value.push(newNode);
};

const onNodeClick = (event: { node: Node }) => {
  selectedNode.value = event.node;
  selectedEdge.value = null; // Clear edge selection when node is selected
};

const onEdgeClick = (event: { edge: Edge }) => {
  selectedEdge.value = event.edge;
  selectedNode.value = null; // Clear node selection when edge is selected
};

const updateFormCollection = (collectionName: string) => {
  if (selectedNode.value && selectedNode.value.type === 'process' && selectedNode.value.data.subtype === 'form') {
    selectedNode.value.data.targetCollection = collectionName;
    updateNodeData();
    
    // Update the field to persist the changes
    updateField('data', {
      nodes: flowNodes.value,
      edges: flowEdges.value,
    });
  }
};

const updateOffPageTarget = (workflowId: string) => {
  if (selectedNode.value && selectedNode.value.type === 'offpage') {
    if (!workflowId) {
      delete selectedNode.value.data.targetWorkflowId;
    } else {
      selectedNode.value.data.targetWorkflowId = workflowId;
    }
    updateNodeData();
    updateField('data', {
      nodes: flowNodes.value,
      edges: flowEdges.value,
    });
  }
};

const handleNavigateToWorkflow = (workflowId: string) => {
  if (!workflowId) return;
  debugLog('navigate-to-workflow requested', workflowId);
  // TODO: Implement actual navigation using Directus router if accessible
};

const handleOpenCollection = (collectionName: string) => {
  if (!collectionName) return;
  debugLog('open-collection requested', collectionName);
  // Construct the URL for creating a new entry in the collection
  const collectionUrl = `/admin/content/${collectionName}/+`;
  // Open in a new window/tab
  window.open(collectionUrl, '_blank');
};

const deleteSelectedNode = () => {
  if (selectedNode.value) {
    const nodeId = selectedNode.value.id;
    flowNodes.value = flowNodes.value.filter((node: Node) => node.id !== nodeId);
    flowEdges.value = flowEdges.value.filter((edge: Edge) =>
      edge.source !== nodeId && edge.target !== nodeId
    );
    selectedNode.value = null;

    // Update the field to persist the changes
    updateField('data', {
      nodes: flowNodes.value,
      edges: flowEdges.value,
    });
  }
};

const deleteSelectedEdge = () => {
  if (selectedEdge.value) {
    const edgeId = selectedEdge.value.id;
    flowEdges.value = flowEdges.value.filter((edge: Edge) => edge.id !== edgeId);
    selectedEdge.value = null;

    // Update the field to persist the changes
    updateField('data', {
      nodes: flowNodes.value,
      edges: flowEdges.value,
    });
  }
};

const onConnectStart = (event: any) => {
  debugLog('onConnectStart', event);
  debugLog('Edit mode:', isEditMode.value);
};

const onConnectEnd = (event: any) => {
  debugLog('onConnectEnd', event);
  debugLog('Current edges count:', flowEdges.value.length);
  debugLog('Event details:', {
    type: event?.type,
    target: event?.target,
    currentTarget: event?.currentTarget,
    clientX: event?.clientX,
    clientY: event?.clientY
  });
};

const onConnect = (connection: Connection) => {
  debugLog('🎯 onConnect TRIGGERED with connection:', connection);
  debugLog('Connection details:', {
    source: connection.source,
    target: connection.target,
    sourceHandle: connection.sourceHandle,
    targetHandle: connection.targetHandle
  });
  debugLog('Edit mode:', isEditMode.value);

  if (!isEditMode.value) {
    debugLog('❌ Not in edit mode, ignoring connection');
    return;
  }

  // Validate connection
  if (!connection.source || !connection.target) {
    debugLog('❌ Invalid connection: missing source or target', { source: connection.source, target: connection.target });
    return;
  }

  // Prevent self-connections
  if (connection.source === connection.target) {
    debugLog('❌ Prevented self-connection');
    return;
  }

  // Check if edge already exists
  const existingEdge = flowEdges.value.find(edge =>
    edge.source === connection.source &&
    edge.target === connection.target &&
    edge.sourceHandle === connection.sourceHandle &&
    edge.targetHandle === connection.targetHandle
  );

  if (existingEdge) {
    debugLog('❌ Edge already exists, skipping duplicate');
    return;
  }

  // Create a proper edge object with all required properties
  const newEdge: Edge = {
    id: `edge-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    source: connection.source!,
    target: connection.target!,
    sourceHandle: connection.sourceHandle,
    targetHandle: connection.targetHandle,
    type: 'step',
    animated: true,
    style: { strokeWidth: 2 },
    markerEnd: { type: 'arrowclosed' },
  };

  debugLog('✅ Creating new edge', newEdge);
  
  // Use direct array replacement instead of addEdges for better reactivity
  flowEdges.value = [...flowEdges.value, newEdge];
  
  debugLog('✅ Edge added to array, total edges:', flowEdges.value.length);
  debugLog('✅ Current flowEdges:', flowEdges.value);

  // Immediately update the field to persist the change
  nextTick(() => {
    debugLog('💾 Persisting edges to field');
    updateField('data', {
      nodes: flowNodes.value,
      edges: flowEdges.value,
    });
    debugLog('💾 Field updated');
  });
};

const onEdgeUpdate = (event: EdgeUpdateEvent) => {
  if (!isEditMode.value) return;

  // Validate the update
  if (!event.connection.source || !event.connection.target) {
    debugLog('Invalid edge update: missing source or target');
    return;
  }

  // Prevent self-connections
  if (event.connection.source === event.connection.target) {
    debugLog('Prevented self-connection during edge update');
    return;
  }

  // Find the edge to update
  const edgeIndex = flowEdges.value.findIndex(edge => edge.id === event.edge.id);
  if (edgeIndex !== -1) {
    // Check if the new connection would create a duplicate edge
    const wouldDuplicate = flowEdges.value.some((edge, index) =>
      index !== edgeIndex &&
      edge.source === event.connection.source &&
      edge.target === event.connection.target &&
      edge.sourceHandle === event.connection.sourceHandle &&
      edge.targetHandle === event.connection.targetHandle
    );

    if (wouldDuplicate) {
      debugLog('Edge update would create duplicate, skipping');
      return;
    }

    // Update the edge with new connection
    flowEdges.value[edgeIndex] = {
      ...flowEdges.value[edgeIndex],
      source: event.connection.source,
      target: event.connection.target,
      sourceHandle: event.connection.sourceHandle,
      targetHandle: event.connection.targetHandle,
    };

    // Immediately update the field to persist the change
    nextTick(() => {
      updateField('data', {
        nodes: flowNodes.value,
        edges: flowEdges.value,
      });
    });
  }
};

// Load list of other workflows (exclude current)
const loadOtherWorkflows = async () => {
  try {
    const currentId = props.primaryKey?.toString();
    const res = await api.get(`/items/${props.collection}`, { params: { fields: 'id,name', limit: -1 } });
    const items = res?.data?.data || [];
    availableWorkflows.value = items
      .filter((w: any) => w.id?.toString() !== currentId)
      .map((w: any) => ({ id: w.id?.toString(), name: w.name || `Workflow ${w.id}` }));
  } catch (e) {
    notifications.add({ title: 'Failed to load workflows', type: 'error' });
  }
};

// Function to fetch available collections for form nodes
const fetchCollections = async () => {
  try {
    const response = await api.get('/collections', {
      params: {
        fields: ['collection', 'meta.name']
      }
    });

    availableCollections.value = response.data.data
      .filter((collection: any) => !collection.collection.startsWith('directus_')) // Filter out system collections
      .map((collection: any) => ({
        value: collection.collection,
        text: collection.meta?.name || collection.collection
      }));
  } catch (error) {
    console.error('Failed to fetch collections:', error);
    availableCollections.value = [];
  }
};

watch(() => props.primaryKey, () => {
  loadOtherWorkflows();
  fetchCollections();
}, { immediate: true });

provide(WORKFLOWS_KEY, availableWorkflows);
provide(CURRENT_WORKFLOW_ID_KEY, computed(() => props.primaryKey?.toString() || null));

// Lifecycle hooks
onMounted(() => {
  // Hide the default Directus header when using custom headers
  const headerBar = document.querySelector('.header-bar');
  if (headerBar) {
    (headerBar as HTMLElement).style.display = 'none';
  }
});

onUnmounted(() => {
  // Clean up
});

// Watchers
watch(() => props.item, (newItem) => {
  if (newItem?.data) {
    try {
      const flowData = typeof newItem.data === 'string'
        ? JSON.parse(newItem.data)
        : newItem.data;

      // Ensure all nodes have required properties
      const validatedNodes = (flowData.nodes || []).map((node: Node, index: number) => ({
        // Ensure every node has a stable id (fallback if missing)
        id: node.id || `node-${index}-${Date.now()}`,
        ...node,
        data: {
          label: node.data?.label || 'Unnamed Node',
          name: node.data?.name || node.data?.label || 'Unnamed Node',
          description: node.data?.description || '',
          ...node.data,
          // Provide the openCollection function to process nodes
          ...(node.type === 'process' && { openCollection: handleOpenCollection }),
        },
      }));

      flowNodes.value = validatedNodes;
      flowEdges.value = (flowData.edges || []).map((edge: Edge) => ({
        ...edge,
        id: edge.id || `edge-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: edge.type || 'step',
        animated: edge.animated !== false,
        style: edge.style || { strokeWidth: 2 },
        markerEnd: edge.markerEnd || { type: 'arrowclosed' },
      }));

      if (validatedNodes && validatedNodes.length > 0) {
        nextTick(() => {
          fitView({ padding: 0.1, includeHiddenNodes: false });
        });
      }
    } catch {
      flowNodes.value = [];
      flowEdges.value = [];
    }
  }
}, { immediate: true });

// Temporarily disable this watcher to prevent conflicts
// watch([flowNodes, flowEdges], () => {
//   debugLog('flow changed', { nodes: flowNodes.value.length, edges: flowEdges.value.length });
//   const flowData = {
//     nodes: flowNodes.value,
//     edges: flowEdges.value,
//   };
//   updateField('data', flowData);
// }, { deep: true });

// Add a separate watcher for edges to debug
watch(flowEdges, (newEdges, oldEdges) => {
  debugLog('Edges changed:', { oldCount: oldEdges.length, newCount: newEdges.length, newEdges });
}, { deep: true });
</script>

<template>
  <div class="workflows-editor">
    <!-- Custom Header -->
    <CustomHeader
      :collection="props.collection"
      :primary-key="props.primaryKey?.toString() || null"
      :title="title"
      :has-edits="hasChanges"
      :saving="props.saving || localSaving"
      :is-new="props.isNew"
      :collection-info="props.collectionInfo"
      :item="props.item"
      :validation-errors="props.validationErrors"
      :flow-name="flowName"
      :mode="props.mode || 'edit'"
      :can-edit="canEdit"
      :follow-mode="followMode"
      @save="saveFlow"
      @delete="() => emit('delete')"
      @archive="() => emit('archive')"
      @refresh="() => emit('refresh')"
      @save-as-copy="() => emit('save-as-copy')"
      @update-flow-name="handleUpdateFlowName"
      @update-mode="handleModeChange"
      @toggle-follow-mode="toggleFollowMode"
    />

    <!-- Main Editor Layout -->
    <div class="editor-layout">
      <!-- Node Palette -->
      <NodePalette
        :is-edit-mode="isEditMode"
        :node-types="nodeTypes"
        @drag-start="onDragStart"
      />

      <!-- Vue Flow Canvas -->
      <div
        class="canvas-container"
        :class="{ 'full-width': isViewMode }"
        @drop="onDrop"
        @dragover="onDragOver"
        @dragleave="onDragLeave"
      >
        <VueFlow
          v-model:nodes="flowNodes"
          v-model:edges="flowEdges"
          :node-types="{
            terminal: TerminalNode,
            process: ProcessNode,
            decision: DecisionNode,
            offpage: OffPageNode
          }"
          snap-to-grid
          :snap-grid="[20, 20]"
          :nodes-draggable="isEditMode"
          :edges-updatable="isEditMode"
          :edges-reconnectable="isEditMode"
          :nodes-connectable="isEditMode"
          :connection-line-style="{ strokeWidth: 2, stroke: '#0066cc' }"
          :connection-line-type="'bezier'"
          :elements-selectable="true"
          :default-viewport="{ x: 0, y: 0, zoom: 1 }"
          :min-zoom="0.1"
          :max-zoom="4"
          :fit-view-on-init="true"
          :fit-view-on-init-options="{ padding: 0.1 }"
          :zoom-on-scroll="true"
          :zoom-on-pinch="true"
          :pan-on-drag="[1, 2]"
          :multi-selection-key-code="true"
          :zoom-on-double-click="false"
          @node-click="onNodeClick"
          @edge-click="onEdgeClick"
          @connect="onConnect"
          @edge-update="isEditMode ? onEdgeUpdate : () => {}"
          @connect-start="onConnectStart"
          @connect-end="onConnectEnd"
        >
          <!-- Controls -->
          <Controls />

          <!-- Background with grid -->
          <Background pattern="dots" :gap="20" :size="1" color="#aaa" />
        </VueFlow>
      </div>

      <!-- Details Sidebar -->
        <DetailsSidebar
          :is-edit-mode="isEditMode"
          :is-view-mode="isViewMode"
          :selected-node="selectedNode"
          :selected-edge="selectedEdge"
          :available-collections="availableCollections"
          :available-workflows="availableWorkflows"
          :edits="props.edits"
          :item="props.item"
          :show-description-modal="showDescriptionModal"
          @update-node-data="updateNodeData"
          @update-form-collection="updateFormCollection"
          @update-off-page-target="updateOffPageTarget"
          @delete-selected-node="deleteSelectedNode"
          @delete-selected-edge="deleteSelectedEdge"
          @show-description-modal="(value: boolean) => (showDescriptionModal.value = value)"
          @navigate-to-workflow="handleNavigateToWorkflow"
        />
    </div>
  </div>
</template>

<style>
/* Import the necessary styles for Vue Flow to work */
@import '@vue-flow/core/dist/style.css';
@import '@vue-flow/core/dist/theme-default.css';
@import '@vue-flow/controls/dist/style.css';
</style>

<style scoped>
.workflows-editor {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--theme--background, #ffffff);
}

.editor-layout {
  flex: 1;
  display: grid;
  grid-template-columns: 250px 1fr 300px;
  height: calc(100vh - 120px); /* Adjust based on header height */
  overflow: hidden;
}

/* View mode layout without node palette */
.editor-layout:has(.canvas-container.full-width) {
  grid-template-columns: 1fr 300px;
}

.canvas-container {
  position: relative;
  background: var(--theme--background, #ffffff);
  width: 100%;
  height: 100%;
  overflow: hidden;
  transition: all 0.2s ease;
}

.canvas-container.full-width {
  /* In view mode, canvas takes full width without node palette */
  grid-column: 1 / -1;
}

.canvas-container :deep(.vue-flow) {
  width: 100%;
  height: 100%;
}

.canvas-container :deep(.vue-flow__viewport) {
  width: 100%;
  height: 100%;
}

.canvas-container :deep(.vue-flow__background) {
  width: 100%;
  height: 100%;
}

.canvas-container :deep(.vue-flow__pane) {
  width: 100%;
  height: 100%;
}

.canvas-container :deep(.vue-flow__node) {
  cursor: pointer;
}

.canvas-container :deep(.vue-flow__node.selected) {
  box-shadow: none;
}

/* Terminal node selection */
.canvas-container :deep(.vue-flow__node.selected .terminal-node) {
  outline: 3px solid var(--theme--primary, #0066cc);
  outline-offset: 2px;
}

/* Process node selection */
.canvas-container :deep(.vue-flow__node.selected .process-node) {
  outline: 3px solid var(--theme--primary, #0066cc);
  outline-offset: 2px;
}

/* Decision node selection */
.canvas-container :deep(.vue-flow__node.selected .decision-node) {
  position: relative;
}

.canvas-container :deep(.vue-flow__node.selected .decision-node::after) {
  content: '';
  position: absolute;
  top: -4px;
  left: -4px;
  right: -4px;
  bottom: -4px;
  background: transparent;
  border: 3px solid var(--theme--primary, #0066cc);
  clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
  pointer-events: none;
}

/* Off-page node selection */
.canvas-container :deep(.vue-flow__node.selected .offpage-node) {
  position: relative;
}

.canvas-container :deep(.vue-flow__node.selected .offpage-node::after) {
  content: '';
  position: absolute;
  top: -4px;
  left: -4px;
  right: -4px;
  bottom: -4px;
  background: transparent;
  border: 4px solid var(--theme--primary, #0066cc);
  /* Match home-plate shape used by OffPageNode.vue (pentagon) */
  clip-path: polygon(0% 0%, 100% 0%, 100% 70%, 50% 100%, 0% 70%);
  pointer-events: none;
  box-shadow: 0 0 8px rgba(0, 102, 204, 0.3);
}

.canvas-container :deep(.vue-flow__edge) {
  cursor: pointer;
}

.canvas-container :deep(.vue-flow__handle) {
  width: 12px;
  height: 12px;
  border: 2px solid #fff;
  border-radius: 50%;
  opacity: 0.8;
  transition: all 0.2s ease;
}

/* Source handles (outputs) - blue */
.canvas-container :deep(.vue-flow__handle[data-handlepos*="right"]),
.canvas-container :deep(.vue-flow__handle[data-handlepos*="bottom"]) {
  background: #0066cc;
}

.canvas-container :deep(.vue-flow__handle[data-handlepos*="right"]:hover),
.canvas-container :deep(.vue-flow__handle[data-handlepos*="bottom"]:hover) {
  background: #004499;
  width: 16px;
  height: 16px;
  opacity: 1;
}

/* Target handles (inputs) - green */
.canvas-container :deep(.vue-flow__handle[data-handlepos*="top"]),
.canvas-container :deep(.vue-flow__handle[data-handlepos*="left"]) {
  background: #22c55e;
}

.canvas-container :deep(.vue-flow__handle[data-handlepos*="top"]:hover),
.canvas-container :deep(.vue-flow__handle[data-handlepos*="left"]:hover) {
  background: #16a34a;
  width: 16px;
  height: 16px;
  opacity: 1;
}

.canvas-container :deep(.vue-flow__handle-connecting) {
  background: #00cc66;
  border-color: #00cc66;
}
</style>
