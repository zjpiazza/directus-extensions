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
import WorkflowLegend from './components/WorkflowLegend.vue';

// Import your custom node components
import TerminalNode from './flow-nodes/TerminalNode.vue';
import ProcessNode from './flow-nodes/ProcessNode.vue';
import DecisionNode from './flow-nodes/DecisionNode.vue';
import OffPageNode from './flow-nodes/OffPageNode.vue';

// Import composables
import { useWorkflowData } from './composables/useWorkflowData';

// Import shared injection keys
import { WORKFLOWS_KEY, CURRENT_WORKFLOW_ID_KEY, IS_EDIT_MODE_KEY } from './constants/injection-keys';

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

// Mode-based behavior - add internal state as fallback
const internalMode = ref<'edit' | 'view'>(props.mode || 'edit');
const isEditMode = computed(() => internalMode.value === 'edit');
const isViewMode = computed(() => internalMode.value === 'view');

// Watch for prop changes but allow internal override
watch(() => props.mode, (newMode) => {
  if (newMode && newMode !== internalMode.value) {
    internalMode.value = newMode;
  }
}, { immediate: true });

// Follow mode state
const followMode = ref(false);
const focusedNodeId = ref<string | null>(null);
const availableCollections = ref<any[]>([]);
const availableWorkflows = ref<Array<{ id: string; name: string }>>([]);

// Panel visibility state
const showNodePalette = ref(true);
const showDetailsSidebar = ref(true);

// Node types for the palette
const nodeTypes = [
  { type: 'terminal', label: 'Terminal', icon: 'stop' },
  { type: 'process', subtype: 'task', label: 'Task', icon: 'task' },
  { type: 'process', subtype: 'form', label: 'Form', icon: 'description' },
  { type: 'decision', label: 'Decision', icon: 'help' },
  { type: 'offpage', label: 'Off-page Connector', icon: 'link' },
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

// Computed property to get workflow IDs used in off-page connectors
const usedWorkflowIds = computed(() => {
  return flowNodes.value
    .filter(node => node.type === 'offpage' && node.data.targetWorkflowId)
    .map(node => node.data.targetWorkflowId)
    .filter((id, index, arr) => arr.indexOf(id) === index); // Remove duplicates
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

    // Include description if it exists in edits
    if (props.edits?.description !== undefined) {
      payload.description = props.edits.description;
    }

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
  internalMode.value = newMode;
  emit('update:mode', newMode);
};

const toggleFollowMode = (enabled: boolean) => {
  followMode.value = enabled;
  
  if (enabled) {
    // If no node is focused, focus on the first node
    if (!focusedNodeId.value && flowNodes.value.length > 0) {
      const firstNode = flowNodes.value[0];
      if (firstNode?.id) {
        focusOnNode(firstNode.id);
      }
    } else if (focusedNodeId.value) {
      // Re-focus on current node to zoom in
      focusOnNode(focusedNodeId.value);
    }
  } else {
    // Remove focused class from all nodes when follow mode is disabled
    flowNodes.value.forEach(n => {
      if (n.class && typeof n.class === 'string') {
        n.class = n.class.replace(/\s*focused\s*/g, ' ').trim();
      }
    });
    focusedNodeId.value = null;
  }
};

// Panel toggle functions
const toggleNodePalette = () => {
  showNodePalette.value = !showNodePalette.value;
};

const toggleDetailsSidebar = () => {
  showDetailsSidebar.value = !showDetailsSidebar.value;
};

const focusOnNode = (nodeId: string) => {
  const node = flowNodes.value.find(n => n.id === nodeId);
  if (!node) return;
  
  focusedNodeId.value = nodeId;
  
  // Remove focused class from all nodes
  flowNodes.value.forEach(n => {
    if (n.class && typeof n.class === 'string') {
      n.class = n.class.replace(/\s*focused\s*/g, ' ').trim();
    }
  });
  
  // Add focused class to the target node
  const targetNode = flowNodes.value.find(n => n.id === nodeId);
  if (targetNode) {
    const currentClass = typeof targetNode.class === 'string' ? targetNode.class : '';
    targetNode.class = (currentClass + ' focused').trim();
  }
  
  // Move the viewport to the node with smooth animation
  fitView({
    nodes: [nodeId],
    duration: 400,
    padding: 0.3,
    maxZoom: 1.5,
    minZoom: 1.2
  });
};

// Get connected nodes based on direction
const getConnectedNode = (nodeId: string, direction: 'up' | 'down' | 'left' | 'right'): string | null => {
  const edges = flowEdges.value;
  const currentNode = flowNodes.value.find(n => n.id === nodeId);
  if (!currentNode) return null;
  
  // Find edges connected to this node
  const connectedEdges = edges.filter(edge => 
    edge.source === nodeId || edge.target === nodeId
  );
  
  // For simplicity, we'll use a basic approach:
  // up/down: follow output/input connections
  // left/right: find nodes to the left/right based on position
  
  if (direction === 'down') {
    // Follow outgoing connections (this node is source)
    const outgoingEdge = connectedEdges.find(edge => edge.source === nodeId);
    return outgoingEdge?.target || null;
  }
  
  if (direction === 'up') {
    // Follow incoming connections (this node is target)
    const incomingEdge = connectedEdges.find(edge => edge.target === nodeId);
    return incomingEdge?.source || null;
  }
  
  // For left/right, find nearest node in that direction
  const allNodes = flowNodes.value.filter(n => n && n.id !== nodeId);
  const currentPos = currentNode.position;
  
  let targetNodes = allNodes;
  
  if (direction === 'left') {
    targetNodes = allNodes.filter(n => n && n.position && n.position.x < currentPos.x);
  } else if (direction === 'right') {
    targetNodes = allNodes.filter(n => n && n.position && n.position.x > currentPos.x);
  }
  
  // Find the closest node
  if (targetNodes.length === 0) return null;
  
  let closest = targetNodes[0];
  if (!closest || !closest.position) return null;
  
  for (let i = 1; i < targetNodes.length; i++) {
    const node = targetNodes[i];
    if (!node || !node.position) continue;
    
    const closestDist = Math.sqrt(
      Math.pow(currentPos.x - closest.position.x, 2) + 
      Math.pow(currentPos.y - closest.position.y, 2)
    );
    const nodeDist = Math.sqrt(
      Math.pow(currentPos.x - node.position.x, 2) + 
      Math.pow(currentPos.y - node.position.y, 2)
    );
    if (nodeDist < closestDist) {
      closest = node;
    }
  }
  
  return closest?.id || null;
};

// Navigate between nodes using arrow keys
const navigateNode = (direction: 'up' | 'down' | 'left' | 'right') => {
  if (!followMode.value || !focusedNodeId.value) return;
  
  const nextNodeId = getConnectedNode(focusedNodeId.value, direction);
  if (nextNodeId) {
    focusOnNode(nextNodeId);
  }
};

// Handle keyboard navigation
const handleKeyDown = (event: KeyboardEvent) => {
  if (!followMode.value) return;
  
  // Prevent default behavior for arrow keys
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
    event.preventDefault();
    
    switch (event.key) {
      case 'ArrowUp':
        navigateNode('up');
        break;
      case 'ArrowDown':
        navigateNode('down');
        break;
      case 'ArrowLeft':
        navigateNode('left');
        break;
      case 'ArrowRight':
        navigateNode('right');
        break;
    }
  }
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

const onPaneClick = () => {
  // Clear both node and edge selection when clicking on empty canvas
  selectedNode.value = null;
  selectedEdge.value = null;
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
  debugLog('onConnect: TRIGGERED with connection:', connection);
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
provide(IS_EDIT_MODE_KEY, isEditMode);

// Lifecycle hooks
onMounted(() => {
  // Hide the default Directus header when using custom headers
  const headerBar = document.querySelector('.header-bar');
  if (headerBar) {
    (headerBar as HTMLElement).style.display = 'none';
  }
  
  // Add keyboard event listener for follow mode navigation
  document.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  // Clean up keyboard event listener
  document.removeEventListener('keydown', handleKeyDown);
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
      :mode="internalMode"
      :can-edit="canEdit"
      :follow-mode="followMode"
      @save="saveFlow"
      @delete="() => emit('delete')"
      @archive="() => emit('archive')"
      @save-as-copy="() => emit('save-as-copy')"
      @update-flow-name="handleUpdateFlowName"
      @update-mode="handleModeChange"
      @toggle-follow-mode="toggleFollowMode"
    />

    <!-- Main Editor Layout -->
    <div class="editor-layout" :class="{ 'show-node-palette': showNodePalette, 'show-details-sidebar': showDetailsSidebar }">
      <!-- Node Palette -->
      <NodePalette
        v-if="showNodePalette && isEditMode"
        :is-edit-mode="isEditMode"
        :node-types="nodeTypes"
        @drag-start="onDragStart"
        @toggle="toggleNodePalette"
      />

      <!-- Vue Flow Canvas -->
      <div
        class="canvas-container"
        :class="{ 'full-width': isViewMode }"
        @drop="onDrop"
        @dragover="onDragOver"
        @dragleave="onDragLeave"
      >
        <!-- Expand buttons for collapsed panels -->
        <button
          v-if="!showNodePalette && isEditMode"
          class="expand-btn expand-btn-left"
          @click="toggleNodePalette"
          title="Show node palette"
        >
          <v-icon name="chevron_right" />
        </button>

        <button
          v-if="!showDetailsSidebar && isEditMode"
          class="expand-btn expand-btn-right"
          @click="toggleDetailsSidebar"
          title="Show details sidebar"
        >
          <v-icon name="chevron_left" />
        </button>

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
          :elements-selectable="isEditMode"
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
          @pane-click="onPaneClick"
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

        <!-- Off-page References Legend (visible in view mode) -->
        <div v-if="isViewMode && usedWorkflowIds.length > 0" class="canvas-legend">
          <WorkflowLegend
            :workflows="availableWorkflows"
            :used-workflow-ids="usedWorkflowIds"
            @navigate-to-workflow="handleNavigateToWorkflow"
          />
        </div>
      </div>

      <!-- Details Sidebar -->
      <DetailsSidebar
        v-if="showDetailsSidebar && isEditMode"
        :is-edit-mode="isEditMode"
        :is-view-mode="isViewMode"
        :selected-node="selectedNode"
        :selected-edge="selectedEdge"
        :available-collections="availableCollections"
        :available-workflows="availableWorkflows"
        :used-workflow-ids="usedWorkflowIds"
        :edits="props.edits"
        :item="props.item"
        @update-node-data="updateNodeData"
        @update-form-collection="updateFormCollection"
        @update-off-page-target="updateOffPageTarget"
        @delete-selected-node="deleteSelectedNode"
        @delete-selected-edge="deleteSelectedEdge"
        @navigate-to-workflow="handleNavigateToWorkflow"
        @toggle="toggleDetailsSidebar"
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
  height: calc(100vh - 150px); /* Adjust based on new header height with breadcrumbs */
  overflow: hidden;
  transition: grid-template-columns 0.3s ease;
}

/* Dynamic panel visibility layouts */
.editor-layout:not(.show-node-palette):not(.show-details-sidebar) {
  grid-template-columns: 1fr;
}

.editor-layout:not(.show-node-palette).show-details-sidebar {
  grid-template-columns: 1fr 300px;
}

.editor-layout.show-node-palette:not(.show-details-sidebar) {
  grid-template-columns: 250px 1fr;
}

.editor-layout.show-node-palette.show-details-sidebar {
  grid-template-columns: 250px 1fr 300px;
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

/* All node selection styling - simple outline approach */
.canvas-container :deep(.vue-flow__node.selected .terminal-node),
.canvas-container :deep(.vue-flow__node.selected .process-node),
.canvas-container :deep(.vue-flow__node.selected .decision-node),
.canvas-container :deep(.vue-flow__node.selected .offpage-node) {
  outline: 3px solid var(--theme--primary, #0066cc);
  outline-offset: 3px;
  box-shadow: 0 0 8px rgba(0, 102, 204, 0.3);
}

/* Follow mode focused node styling */
.canvas-container :deep(.vue-flow__node.focused .terminal-node),
.canvas-container :deep(.vue-flow__node.focused .process-node),
.canvas-container :deep(.vue-flow__node.focused .decision-node),
.canvas-container :deep(.vue-flow__node.focused .offpage-node) {
  outline: 4px solid var(--theme--warning, #ffc107);
  outline-offset: 3px;
  box-shadow: 0 0 20px rgba(255, 193, 7, 0.4);
  animation: pulse-focused 2s infinite;
}

@keyframes pulse-focused {
  0% {
    box-shadow: 0 0 20px rgba(255, 193, 7, 0.4);
  }
  50% {
    box-shadow: 0 0 30px rgba(255, 193, 7, 0.6);
  }
  100% {
    box-shadow: 0 0 20px rgba(255, 193, 7, 0.4);
  }
}

.canvas-container :deep(.vue-flow__edge) {
  cursor: pointer;
}

.canvas-container :deep(.vue-flow__handle) {
  width: 8px;
  height: 8px;
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  opacity: 0.6;
  transition: all 0.2s ease;
}

/* Let individual nodes control their handle colors */
.canvas-container :deep(.vue-flow__handle:hover) {
  width: 12px;
  height: 12px;
  opacity: 1;
  border-width: 2px;
}

.canvas-container :deep(.vue-flow__handle-connecting) {
  border-color: #ffffff;
  opacity: 1;
  width: 12px;
  height: 12px;
}

/* Expand buttons for collapsed panels */
.expand-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: var(--theme--background, white);
  border: 1px solid var(--theme--border-color, #e1e5e9);
  border-radius: 4px;
  color: var(--theme--foreground-subdued, #6c757d);
  cursor: pointer;
  padding: 0.5rem;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.expand-btn:hover {
  background: var(--theme--background-accent, #f8f9fa);
  color: var(--theme--foreground, #1a1a1a);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.expand-btn:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(0, 102, 204, 0.2);
}

.expand-btn-left {
  left: 8px;
}

.expand-btn-right {
  right: 8px;
}

/* Canvas legend positioning */
.canvas-legend {
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 50;
  max-width: 300px;
  opacity: 0.95;
}

.canvas-legend:hover {
  opacity: 1;
}
</style>
