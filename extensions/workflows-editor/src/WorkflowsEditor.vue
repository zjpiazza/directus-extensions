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
import PageNavigation from './components/PageNavigation.vue';

// Import your custom node components
import TerminalNode from './flow-nodes/TerminalNode.vue';
import StartNode from './flow-nodes/StartNode.vue';
import EndNode from './flow-nodes/EndNode.vue';
import ProcessNode from './flow-nodes/ProcessNode.vue';
import DecisionNode from './flow-nodes/DecisionNode.vue';
import OffPageNode from './flow-nodes/OffPageNode.vue';
import PageNode from './flow-nodes/PageNode.vue';

// Import custom edge component
import LabeledEdge from './components/LabeledEdge.vue';

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
  mode: 'view',
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
  refresh: [];
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
  pages,
  currentPageId,
  selectedNode,
  currentPage,
  pageBreadcrumbs,
  visibleNodes,
  visibleEdges,
  updateNodeData: baseUpdateNodeData,
  addPage,
  removePage,
  navigateToPage,
  updatePageCounts,
} = useWorkflowData();

// Function to update node classes for multi-selection visual feedback
const updateNodeClasses = () => {
  flowNodes.value.forEach(node => {
    const currentClass = (typeof node.class === 'string' ? node.class : '') || '';
    // Remove any existing multi-selected class
    let newClass = currentClass.replace(/\s*multi-selected\s*/g, ' ').trim();
    
    // Add multi-selected class if this node is in the selection
    if (selectedNodes.value.has(node.id) && isMultiSelecting.value) {
      newClass = (newClass + ' multi-selected').trim();
    }
    
    node.class = newClass;
  });
};

// Override updateNodeData to also persist changes
const updateNodeData = () => {
  baseUpdateNodeData();
  updatePageCounts();
  // Update the field to persist the changes
  updateField('data', {
    nodes: flowNodes.value,
    edges: flowEdges.value,
    pages: pages.value,
    currentPageId: currentPageId.value,
  });
};

// Update edge data and persist changes
const updateEdgeData = () => {
  // Update the field to persist the changes
  updateField('data', {
    nodes: flowNodes.value,
    edges: flowEdges.value,
    pages: pages.value,
    currentPageId: currentPageId.value,
  });
};

// Add selectedEdge state
const selectedEdge = ref<Edge | null>(null);

// Multi-selection state for alignment functionality
const selectedNodes = ref<Set<string>>(new Set());
const isMultiSelecting = ref(false);

/*
 * Multi-selection feature implementation:
 * - Hold Ctrl/Cmd and click nodes to select multiple nodes
 * - Selected nodes get green outline (multi-selected class)
 * - Alignment toolbar appears when 2+ nodes are selected
 * - Horizontal alignment: aligns all selected nodes to average Y position
 * - Vertical alignment: aligns all selected nodes to average X position
 * - Clear button or clicking empty space clears selection
 */

// Mode-based behavior - add internal state as fallback
const internalMode = ref<'edit' | 'view'>(props.mode || 'view');
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
const showDescriptions = ref(false);
const availableCollections = ref<any[]>([]);
const availableWorkflows = ref<Array<{ id: string; name: string }>>([]);

// Panel visibility state
const showNodePalette = ref(true);
const showDetailsSidebar = ref(true);

// Node types for the palette
const nodeTypes = [
  { type: 'start', label: 'Start', icon: 'play_arrow' },
  { type: 'end', label: 'End', icon: 'stop' },
  { type: 'process', subtype: 'task', label: 'Task', icon: 'task' },
  { type: 'process', subtype: 'form', label: 'Form', icon: 'description' },
  { type: 'decision', label: 'Decision', icon: 'help' },
  { type: 'offpage', label: 'Off-page Connector', icon: 'link' },
  { type: 'page', label: 'Page', icon: 'folder_open' },
];

// Vue Flow composable
const { project, fitView, updateEdge, addEdges, snapToGrid } = useVueFlow();

// Computed properties
const title = computed(() => {
  if (props.isNew) {
    return `Creating ${props.collectionInfo?.name || props.collection}`;
  }
  
  // Make title singular and mode-aware
  const action = (internalMode.value === 'edit' && !followMode.value) ? 'Editing' : 'Viewing';
  const itemType = (props.collectionInfo?.name || props.collection).replace(/s$/, ''); // Make singular
  return `${action} ${itemType}`;
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

// Computed property for focused node description
const focusedNodeDescription = computed(() => {
  if (!focusedNodeId.value || !showDescriptions.value) return null;
  
  const focusedNode = flowNodes.value.find(node => node.id === focusedNodeId.value);
  if (!focusedNode) return null;
  
  const description = focusedNode.data?.description?.trim();
  // Show a default message if no description is available
  const displayDescription = description || 'No description available for this node.';
  
  return {
    id: focusedNode.id,
    title: focusedNode.data?.name || focusedNode.data?.label || 'Untitled',
    description: displayDescription,
    type: focusedNode.type,
    position: focusedNode.position,
    hasDescription: !!description
  };
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
    updatePageCounts(); // Update counts before saving
    const flowData = { 
      nodes: flowNodes.value, 
      edges: flowEdges.value,
      pages: pages.value,
      currentPageId: currentPageId.value
    };
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

const cloneWorkflow = async () => {
  if (localSaving.value) return;
  if (props.isNew) {
    notifications.add({ title: 'Cannot Clone', text: 'Save the workflow first before cloning', type: 'error' });
    return;
  }
  
  debugLog('cloneWorkflow invoked');
  try {
    localSaving.value = true;
    const flowData = { 
      nodes: flowNodes.value, 
      edges: flowEdges.value,
      pages: pages.value,
      currentPageId: currentPageId.value
    };
    
    // Create clone payload with modified name
    const originalName = flowName.value?.trim() || props.item?.name || 'Untitled Workflow';
    const cloneName = `${originalName} (Copy)`;
    
    const payload: Record<string, any> = {
      data: flowData,
      name: cloneName,
      description: props.item?.description || props.edits?.description || ''
    };

    const endpoint = `/items/${props.collection}`;
    const response = await api.post(endpoint, payload);
    const cloned = response?.data?.data || response?.data;

    notifications.add({ 
      title: 'Workflow Cloned', 
      text: `Created "${cloneName}" (ID: ${cloned?.id})`, 
      type: 'success' 
    });

    // Navigate to the cloned workflow for editing
    if (cloned?.id) {
      const cloneUrl = `/admin/content/${props.collection}/${cloned.id}`;
      window.location.href = cloneUrl;
    }
  } catch (e: any) {
    const message = e?.response?.data?.errors?.[0]?.message || e.message || 'Failed to clone workflow';
    notifications.add({ title: 'Clone Failed', text: message, type: 'error' });
    debugLog('clone error', e?.response || e);
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
      if (n.class && typeof n.class === 'string' && n.class) {
        n.class = n.class.replace(/\s*focused\s*/g, ' ').trim();
      }
    });
    focusedNodeId.value = null;
    showDescriptions.value = false; // Turn off descriptions when leaving follow mode
  }
};

const toggleDescriptions = (enabled: boolean) => {
  showDescriptions.value = enabled;
};

// Helper function to get node type icon
const getNodeIcon = (type: string): string => {
  const iconMap: Record<string, string> = {
    start: 'play_arrow',
    end: 'stop',
    process: 'task',
    decision: 'help',
    offpage: 'link',
    terminal: 'terminal'
  };
  return iconMap[type] || 'circle';
};

// Helper function to format node type for display
const formatNodeType = (type: string): string => {
  const typeMap: Record<string, string> = {
    start: 'Start Node',
    end: 'End Node', 
    process: 'Process Node',
    decision: 'Decision Node',
    offpage: 'Off-page Connector',
    terminal: 'Terminal Node'
  };
  return typeMap[type] || type.charAt(0).toUpperCase() + type.slice(1);
};

// Helper function to position the description dialog in a fixed location
const getDescriptionDialogPosition = () => {
  if (!focusedNodeId.value) return {};
  
  // Fixed position in top-left corner of the canvas
  return {
    position: 'absolute',
    top: '20px',
    left: '20px',
    zIndex: 1000
  };
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
    if (n.class && typeof n.class === 'string' && n.class) {
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

// Get connected nodes based on handle direction (following actual edges)
const getConnectedNode = (nodeId: string, direction: 'up' | 'down' | 'left' | 'right'): string | null => {
  const edges = flowEdges.value;
  
  // Map arrow directions to handle IDs
  const directionToHandle: Record<string, string> = {
    up: 'top',
    down: 'bottom', 
    left: 'left',
    right: 'right'
  };
  
  const targetHandle = directionToHandle[direction];
  
  debugLog(`Looking for connection from node ${nodeId} via ${targetHandle} handle (${direction} direction)`);
  
  // Find edges where the current node is the source and the source handle matches the direction
  const outgoingEdge = edges.find(edge => 
    edge.source === nodeId && edge.sourceHandle === targetHandle
  );
  
  if (outgoingEdge) {
    debugLog(`Found outgoing edge from ${nodeId}.${targetHandle} to ${outgoingEdge.target}.${outgoingEdge.targetHandle}`);
    return outgoingEdge.target;
  }
  
  // Find edges where the current node is the target and the target handle matches the direction
  const incomingEdge = edges.find(edge => 
    edge.target === nodeId && edge.targetHandle === targetHandle
  );
  
  if (incomingEdge) {
    debugLog(`Found incoming edge from ${incomingEdge.source}.${incomingEdge.sourceHandle} to ${nodeId}.${targetHandle}`);
    return incomingEdge.source;
  }
  
  debugLog(`No connection found for ${nodeId} via ${targetHandle} handle`);
  return null;
};

// Navigate between nodes using arrow keys
const navigateNode = (direction: 'up' | 'down' | 'left' | 'right') => {
  if (!followMode.value || !focusedNodeId.value) return;
  
  const nextNodeId = getConnectedNode(focusedNodeId.value, direction);
  if (nextNodeId) {
    focusOnNode(nextNodeId);
  } else {
    // Optional: Show brief feedback when no connection exists
    const directionToHandle: Record<string, string> = {
      up: 'top',
      down: 'bottom', 
      left: 'left',
      right: 'right'
    };
    debugLog(`No connection found in ${direction} direction (${directionToHandle[direction]} handle) from focused node`);
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

  // Get default node size from workflow settings
  const defaultNodeSize = props.edits.defaultNodeSize || props.item?.defaultNodeSize || 'medium';
  
  const newNode: Node = {
    id: `${nodeType.type}-${Date.now()}`,
    type: nodeType.type,
    position,
    data: {
      label: nodeType.label,
      name: nodeType.label,
      description: '',
      nodeSize: defaultNodeSize,
      pageId: currentPageId.value, // Assign to current page
      ...(nodeType.subtype && { subtype: nodeType.subtype }),
      ...(nodeType.subtype === 'form' && { targetCollection: '' }),
      // Provide the openCollection function to process nodes
      ...(nodeType.type === 'process' && { openCollection: handleOpenCollection }),
      // Add page-specific data for page nodes
      ...(nodeType.type === 'page' && { 
        pageId: `page-${Date.now()}`,
        nodeCount: 0,
        color: '#3b82f6'
      }),
    },
  };

  flowNodes.value.push(newNode);
  
  // If it's a page node, create the corresponding page entry
  if (nodeType.type === 'page' && newNode.data.pageId) {
    addPage({
      id: newNode.data.pageId,
      name: newNode.data.name || newNode.data.label || 'New Page',
      description: newNode.data.description || '',
      parentPageId: currentPageId.value,
      color: newNode.data.color || '#3b82f6'
    });
  }
  
  // Update node data and persist
  updateNodeData();
};

const onNodeClick = (event: { node: Node; event: MouseEvent }) => {  
  const nodeId = event.node.id;
  
  // Handle page node navigation in view mode
  if (event.node.type === 'page' && !isEditMode.value && event.node.data?.pageId) {
    handleEnterPage(event.node.data.pageId);
    return;
  }
  
  // Handle multi-selection with Ctrl/Cmd key
  if (event.event.ctrlKey || event.event.metaKey) {
    if (selectedNodes.value.has(nodeId)) {
      selectedNodes.value.delete(nodeId);
    } else {
      selectedNodes.value.add(nodeId);
    }
    isMultiSelecting.value = selectedNodes.value.size > 1;
    
    // Clear single selection when multi-selecting
    if (isMultiSelecting.value) {
      selectedNode.value = null;
    }
  } else {
    // Single selection - clear multi-selection
    selectedNodes.value.clear();
    selectedNodes.value.add(nodeId);
    isMultiSelecting.value = false;
    selectedNode.value = event.node;
  }
  
  selectedEdge.value = null; // Clear edge selection when node is selected
  
  // Update visual feedback
  updateNodeClasses();
};

const onEdgeClick = (event: { edge: Edge }) => {
  selectedEdge.value = event.edge;
  selectedNode.value = null; // Clear node selection when edge is selected
};

const onPaneClick = () => {
  // Clear all selections when clicking on empty canvas
  selectedNode.value = null;
  selectedEdge.value = null;
  selectedNodes.value.clear();
  isMultiSelecting.value = false;
  
  // Update visual feedback
  updateNodeClasses();
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

const updateFormCollections = (collections: Array<{ collection: string; label?: string }>) => {
  if (selectedNode.value && selectedNode.value.type === 'process' && selectedNode.value.data.subtype === 'form') {
    selectedNode.value.data.targetCollections = collections;
    // Clear legacy single collection when using multiple
    if (collections.length > 0) {
      delete selectedNode.value.data.targetCollection;
    }
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

// Page navigation handlers
const handleNavigateToPage = (pageId: string) => {
  navigateToPage(pageId);
  
  // Fit view to show the nodes on the new page
  nextTick(() => {
    if (visibleNodes.value.length > 0) {
      fitView({ 
        nodes: visibleNodes.value.map(n => n.id),
        duration: 400,
        padding: 0.1
      });
    }
  });
};

const handleEnterPage = (pageId: string) => {
  debugLog('handleEnterPage called with pageId:', pageId);
  
  // Create the page if it doesn't exist
  const existingPage = pages.value.find(p => p.id === pageId);
  if (!existingPage) {
    const pageNode = flowNodes.value.find(n => n.type === 'page' && n.data?.pageId === pageId);
    if (pageNode) {
      debugLog('Creating new page for pageId:', pageId);
      addPage({
        id: pageId,
        name: pageNode.data.name || pageNode.data.label || 'Untitled Page',
        description: pageNode.data.description,
        parentPageId: currentPageId.value,
        color: pageNode.data.color || '#3b82f6'
      });
    } else {
      debugLog('No page node found for pageId:', pageId);
      return;
    }
  }
  
  handleNavigateToPage(pageId);
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

// Alignment functions
const getActualNodeDimensions = (nodeId: string) => {
  // Get actual DOM dimensions of the rendered node
  const nodeElement = document.querySelector(`[data-id="${nodeId}"]`);
  if (nodeElement) {
    const rect = nodeElement.getBoundingClientRect();
    return { width: rect.width, height: rect.height };
  }
  
  // Fallback to estimated dimensions if DOM element not found
  const node = flowNodes.value.find(n => n.id === nodeId);
  if (!node) return { width: 160, height: 56 };
  
  switch (node.type) {
    case 'process':
      return { width: 160, height: 56 }; // Base size, but actual height may be larger
    case 'decision':
      return { width: 136, height: 136 };
    case 'start':
    case 'end':
    case 'terminal':
      return { width: 160, height: 56 }; // Base size, but actual height may be larger
    case 'offpage':
      return { width: 40, height: 32 };
    default:
      return { width: 160, height: 56 };
  }
};

const getNodeCenter = (node: Node) => {
  const dimensions = getActualNodeDimensions(node.id);
  return {
    x: node.position.x + dimensions.width / 2,
    y: node.position.y + dimensions.height / 2
  };
};

const alignNodesHorizontally = () => {
  if (selectedNodes.value.size < 2) return;
  
  const selectedNodeIds = Array.from(selectedNodes.value);
  const nodesToAlign = flowNodes.value.filter(node => selectedNodeIds.includes(node.id));
  
  if (nodesToAlign.length < 2) return;
  
  debugLog('Aligning nodes horizontally (by handle centers):', selectedNodeIds);
  
  // Calculate the average Y center position of all selected nodes
  const avgCenterY = nodesToAlign.reduce((sum, node) => {
    const center = getNodeCenter(node);
    return sum + center.y;
  }, 0) / nodesToAlign.length;
  
  debugLog('Average center Y position:', avgCenterY);
  
  // Update positions so that node centers align horizontally
  selectedNodeIds.forEach(nodeId => {
    const nodeIndex = flowNodes.value.findIndex(n => n.id === nodeId);
    if (nodeIndex !== -1) {
      const node = flowNodes.value[nodeIndex];
      const dimensions = getActualNodeDimensions(nodeId);
      
      // Calculate new Y position so the node center aligns to avgCenterY
      const newY = avgCenterY - dimensions.height / 2;
      
      debugLog(`Updating node ${nodeId}: old Y=${node.position.y}, new Y=${newY}, center will be at Y=${avgCenterY}, actual height=${dimensions.height}`);
      
      // Update position directly
      flowNodes.value[nodeIndex].position.y = newY;
    }
  });
  
  // Force Vue reactivity by reassigning the array
  flowNodes.value = [...flowNodes.value];
  
  // Use nextTick to ensure DOM updates before persisting
  nextTick(() => {
    debugLog('Persisting horizontal alignment changes');
    updateField('data', {
      nodes: flowNodes.value,
      edges: flowEdges.value,
    });
    
    // Ensure visual feedback is updated
    updateNodeClasses();
    
    notifications.add({ 
      title: 'Nodes Aligned', 
      text: `${nodesToAlign.length} nodes aligned horizontally by their centers`, 
      type: 'success' 
    });
  });
};

const alignNodesVertically = () => {
  if (selectedNodes.value.size < 2) return;
  
  const selectedNodeIds = Array.from(selectedNodes.value);
  const nodesToAlign = flowNodes.value.filter(node => selectedNodeIds.includes(node.id));
  
  if (nodesToAlign.length < 2) return;
  
  debugLog('Aligning nodes vertically (by handle centers):', selectedNodeIds);
  
  // Calculate the average X center position of all selected nodes
  const avgCenterX = nodesToAlign.reduce((sum, node) => {
    const center = getNodeCenter(node);
    return sum + center.x;
  }, 0) / nodesToAlign.length;
  
  debugLog('Average center X position:', avgCenterX);
  
  // Update positions so that node centers align vertically
  selectedNodeIds.forEach(nodeId => {
    const nodeIndex = flowNodes.value.findIndex(n => n.id === nodeId);
    if (nodeIndex !== -1) {
      const node = flowNodes.value[nodeIndex];
      const dimensions = getActualNodeDimensions(nodeId);
      
      // Calculate new X position so the node center aligns to avgCenterX
      const newX = avgCenterX - dimensions.width / 2;
      
      debugLog(`Updating node ${nodeId}: old X=${node.position.x}, new X=${newX}, center will be at X=${avgCenterX}, actual width=${dimensions.width}`);
      
      // Update position directly
      flowNodes.value[nodeIndex].position.x = newX;
    }
  });
  
  // Force Vue reactivity by reassigning the array
  flowNodes.value = [...flowNodes.value];
  
  // Use nextTick to ensure DOM updates before persisting
  nextTick(() => {
    debugLog('Persisting vertical alignment changes');
    updateField('data', {
      nodes: flowNodes.value,
      edges: flowEdges.value,
    });
    
    // Ensure visual feedback is updated
    updateNodeClasses();
    
    notifications.add({ 
      title: 'Nodes Aligned', 
      text: `${nodesToAlign.length} nodes aligned vertically by their centers`, 
      type: 'success' 
    });
  });
};

const clearSelection = () => {
  selectedNodes.value.clear();
  isMultiSelecting.value = false;
  selectedNode.value = null;
  
  // Update visual feedback
  updateNodeClasses();
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

  // Get default edge type from workflow settings
  const defaultEdgeType = props.edits.defaultEdgeType || props.item?.defaultEdgeType || 'bezier';
  
  // Create a proper edge object with all required properties
  const newEdge: Edge = {
    id: `edge-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    source: connection.source!,
    target: connection.target!,
    sourceHandle: connection.sourceHandle,
    targetHandle: connection.targetHandle,
    type: defaultEdgeType, // Use the default edge type from workflow settings
    animated: true,
    style: { strokeWidth: 2 },
    markerEnd: { type: 'arrowclosed' },
    data: { label: '' }, // Initialize with empty label
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
  
  // Add listener for page enter events
  document.addEventListener('enter-page', (event: any) => {
    if (event.detail?.pageId) {
      handleEnterPage(event.detail.pageId);
    }
  });
  
  // Enable snap to grid
  snapToGrid.value = true;
});

onUnmounted(() => {
  // Clean up keyboard event listener
  document.removeEventListener('keydown', handleKeyDown);
  
  // Clean up page enter event listener
  document.removeEventListener('enter-page', (event: any) => {
    if (event.detail?.pageId) {
      handleEnterPage(event.detail.pageId);
    }
  });
});

// Watchers
watch(() => props.item, (newItem) => {
  // Clear selection state when loading new data
  selectedNodes.value.clear();
  isMultiSelecting.value = false;
  selectedNode.value = null;
  selectedEdge.value = null;
  
  if (newItem?.data) {
    try {
      const flowData = typeof newItem.data === 'string'
        ? JSON.parse(newItem.data)
        : newItem.data;

      // Ensure all nodes have required properties and clean classes
      const validatedNodes = (flowData.nodes || []).map((node: Node, index: number) => {
        // Clean any multi-selection classes from persisted data
        const cleanClass = (typeof node.class === 'string' && node.class) 
          ? node.class.replace(/\s*multi-selected\s*/g, ' ').trim()
          : '';
          
        return {
          // Ensure every node has a stable id (fallback if missing)
          id: node.id || `node-${index}-${Date.now()}`,
          ...node,
          class: cleanClass,
          data: {
            label: node.data?.label || 'Unnamed',
            name: node.data?.name || node.data?.label || 'Unnamed',
            description: node.data?.description || '',
            ...node.data,
            // Provide the openCollection function to process nodes
            ...(node.type === 'process' && { openCollection: handleOpenCollection }),
          },
        };
      });

      flowNodes.value = validatedNodes;
      flowEdges.value = (flowData.edges || []).map((edge: Edge) => ({
        ...edge,
        id: edge.id || `edge-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: edge.type || 'step',
        animated: edge.animated !== false,
        style: edge.style || { strokeWidth: 2 },
        markerEnd: edge.markerEnd || { type: 'arrowclosed' },
        data: { label: edge.data?.label || '', ...edge.data }, // Ensure data structure with label
      }));
      
      // Load pages data
      pages.value = flowData.pages || [];
      currentPageId.value = flowData.currentPageId || 'root';
      
      // Update page counts after loading
      updatePageCounts();

      if (validatedNodes && validatedNodes.length > 0) {
        nextTick(() => {
          fitView({ padding: 0.1, includeHiddenNodes: false });
        });
      }
    } catch {
      flowNodes.value = [];
      flowEdges.value = [];
      pages.value = [];
      currentPageId.value = 'root';
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

// Watch for changes in multi-selection to update visual classes
watch([selectedNodes, isMultiSelecting], () => {
  updateNodeClasses();
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
      :show-descriptions="showDescriptions"
      @save="saveFlow"
      @delete="() => emit('delete')"
      @archive="() => emit('archive')"
      @save-as-copy="() => emit('save-as-copy')"
      @clone-workflow="cloneWorkflow"
      @update-flow-name="handleUpdateFlowName"
      @update-mode="handleModeChange"
      @toggle-follow-mode="toggleFollowMode"
      @toggle-descriptions="toggleDescriptions"
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

        <!-- Alignment Toolbar -->
        <div 
          v-if="isMultiSelecting && selectedNodes.size > 1 && isEditMode" 
          class="alignment-toolbar"
        >
          <div class="alignment-toolbar-content">
            <span class="alignment-label">{{ selectedNodes.size }} nodes selected</span>
            <div class="alignment-buttons">
              <button 
                class="alignment-btn" 
                @click="alignNodesHorizontally"
                title="Align horizontally"
              >
                <v-icon name="horizontal_rule" />
                <span>Horizontal</span>
              </button>
              <button 
                class="alignment-btn" 
                @click="alignNodesVertically"
                title="Align vertically"
              >
                <v-icon name="vertical_align_center" />
                <span>Vertical</span>
              </button>
              <button 
                class="alignment-btn clear-btn" 
                @click="clearSelection"
                title="Clear selection"
              >
                <v-icon name="clear" />
                <span>Clear</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Page Navigation -->
        <PageNavigation
          v-if="currentPageId !== 'root' || pageBreadcrumbs.length > 1"
          :breadcrumbs="pageBreadcrumbs"
          :current-page-id="currentPageId"
          :is-edit-mode="isEditMode"
          @navigate-to-page="handleNavigateToPage"
        />

        <!-- Node Description Dialog -->
        <Transition name="description-fade">
          <div 
            v-if="focusedNodeDescription && followMode && showDescriptions" 
            class="node-description-dialog"
            :class="{ 'no-description': !focusedNodeDescription.hasDescription }"
            :style="getDescriptionDialogPosition()"
          >
            <div class="description-header">
              <div class="description-title">
                <v-icon :name="getNodeIcon(focusedNodeDescription.type)" />
                <span>{{ focusedNodeDescription.title }}</span>
              </div>
              <div class="description-type">{{ formatNodeType(focusedNodeDescription.type) }}</div>
            </div>
            <div class="description-content">
              <p :class="{ 'no-description-text': !focusedNodeDescription.hasDescription }">
                {{ focusedNodeDescription.description }}
              </p>
            </div>
          </div>
        </Transition>

        <VueFlow
          v-model:nodes="visibleNodes"
          v-model:edges="visibleEdges"
          :node-types="{
            start: StartNode,
            end: EndNode,
            terminal: TerminalNode,
            process: ProcessNode,
            decision: DecisionNode,
            offpage: OffPageNode,
            page: PageNode
          }"
          :edge-types="{
            step: LabeledEdge
          }"
          :default-edge-type="'step'"
          :nodes-draggable="isEditMode"
          :edges-updatable="isEditMode"
          :edges-reconnectable="isEditMode"
          :nodes-connectable="isEditMode"
          :connection-mode="ConnectionMode.Loose"
          :connection-line-style="{ strokeWidth: 2, stroke: '#0066cc' }"
          :connection-line-type="'smoothstep'"
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
          :snap-to-grid="true"
          :snap-grid="[20, 20]"
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
        @update-edge-data="updateEdgeData"
        @update-form-collection="updateFormCollection"
        @update-form-collections="updateFormCollections"
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

/* Multi-selection styling */
.canvas-container :deep(.vue-flow__node.multi-selected .terminal-node),
.canvas-container :deep(.vue-flow__node.multi-selected .process-node),
.canvas-container :deep(.vue-flow__node.multi-selected .decision-node),
.canvas-container :deep(.vue-flow__node.multi-selected .offpage-node) {
  outline: 3px solid var(--theme--secondary, #28a745);
  outline-offset: 3px;
  box-shadow: 0 0 8px rgba(40, 167, 69, 0.3);
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

/* Alignment Toolbar */
.alignment-toolbar {
  position: absolute;
  top: 1rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 200;
  background: var(--theme--background, white);
  border: 1px solid var(--theme--border-color, #e1e5e9);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 0.75rem;
  min-width: 320px;
}

.alignment-toolbar-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.alignment-label {
  font-size: 0.875rem;
  color: var(--theme--foreground-subdued, #6c757d);
  font-weight: 500;
  white-space: nowrap;
}

.alignment-buttons {
  display: flex;
  gap: 0.5rem;
}

.alignment-btn {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.75rem;
  background: var(--theme--background-accent, #f8f9fa);
  border: 1px solid var(--theme--border-color, #e1e5e9);
  border-radius: 6px;
  color: var(--theme--foreground, #1a1a1a);
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.alignment-btn:hover {
  background: var(--theme--primary, #0066cc);
  color: white;
  border-color: var(--theme--primary, #0066cc);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 102, 204, 0.3);
}

.alignment-btn.clear-btn:hover {
  background: var(--theme--danger, #dc3545);
  border-color: var(--theme--danger, #dc3545);
  box-shadow: 0 2px 8px rgba(220, 53, 69, 0.3);
}

.alignment-btn:active {
  transform: translateY(0);
}

.alignment-btn v-icon {
  width: 16px;
  height: 16px;
}

@media (max-width: 768px) {
  .alignment-toolbar {
    min-width: 280px;
    padding: 0.5rem;
  }
  
  .alignment-toolbar-content {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .alignment-buttons {
    width: 100%;
    justify-content: center;
  }
}

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
  transition: all 0.3s cubic-bezier(0.4, 0, 0.6, 1);
}

.description-fade-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
  filter: blur(4px);
}

.description-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.98);
  filter: blur(2px);
}

.description-fade-enter-to,
.description-fade-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
  filter: blur(0);
}

/* Enhanced entrance animation with bounce effect */
.description-fade-enter-active .description-header {
  animation: slideDownBounce 0.6s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.description-fade-enter-active .description-content {
  animation: fadeInUp 0.5s cubic-bezier(0.25, 0.8, 0.25, 1) 0.1s both;
}

@keyframes slideDownBounce {
  0% {
    opacity: 0;
    transform: translateY(-30px);
  }
  60% {
    opacity: 0.8;
    transform: translateY(5px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInUp {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive adjustments for mobile */
@media (max-width: 480px) {
  .node-description-dialog {
    width: 280px;
    margin: 0 20px;
  }
  
  .description-header {
    padding: 0.875rem 1rem 0.625rem;
  }
  
  .description-content {
    padding: 0.875rem 1rem 1rem;
  }
  
  .description-title {
    font-size: 0.875rem;
  }
  
  .description-content p {
    font-size: 0.8125rem;
  }
}
</style>
