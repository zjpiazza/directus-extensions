<script setup lang="ts">
import { computed, ref, watch, nextTick, onMounted, onUnmounted, provide } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { VueFlow, ConnectionMode, useVueFlow } from '@vue-flow/core';
import type { Node, Edge, EdgeUpdateEvent, Connection } from '@vue-flow/core';
import { Controls } from '@vue-flow/controls';
import { Background } from '@vue-flow/background';


// Import custom components
import CustomHeader from './components/CustomHeader.vue';
import NavigationSidebar from './components/NavigationSidebar.vue';
import NodePalette from './components/NodePalette.vue';
import DetailsSidebar from './components/DetailsSidebar.vue';
import WorkflowLegend from './components/WorkflowLegend.vue';
import PageNavigation from './components/PageNavigation.vue';
import PageSelector from './components/PageSelector.vue';
import NodeDescriptionDialog from './components/NodeDescriptionDialog.vue';
import ExpandButtons from './components/ExpandButtons.vue';

// Import your custom node components
import TerminalNode from './flow-nodes/TerminalNode.vue';
import StartNode from './flow-nodes/StartNode.vue';
import EndNode from './flow-nodes/EndNode.vue';
import ProcessNode from './flow-nodes/ProcessNode.vue';
import DecisionNode from './flow-nodes/DecisionNode.vue';

import PageNode from './flow-nodes/PageNode.vue';

// Import custom edge component
import LabeledEdge from './components/LabeledEdge.vue';

// Import composables
import { useWorkflowData } from './composables/useWorkflowData';
import { useApi } from '@directus/extensions-sdk';
import { useModuleConfig } from './composables/useModuleConfig';

// Phase 1: State Management Composables
import { useFlowState } from './composables/useFlowState';
import { usePageManagement } from './composables/usePageManagement';
import { useFollowMode } from './composables/useFollowMode';
import { useMultiSelection } from './composables/useMultiSelection';

// Phase 2: Event Handler Composables
import { useNodeEvents } from './composables/useNodeEvents';
import { useEdgeEvents } from './composables/useEdgeEvents';
import { useCanvasEvents } from './composables/useCanvasEvents';
import { useKeyboardEvents } from './composables/useKeyboardEvents';
import { usePersistence } from './composables/usePersistence';
import { useDialog } from './composables/useDialog';
import { useNodeUtilities } from './composables/useNodeUtilities';
import { useDataTransformation } from './composables/useDataTransformation';
import { useDataWatchers } from './composables/useDataWatchers';

// Phase 3: Utility Composables and Helpers
import { useNodeUpdateHandlers } from './composables/useNodeUpdateHandlers';
import { useCollectionData } from './utils/collectionHelpers';

import { debugLog, debugError, debugWarn } from './utils/debugHelpers';

// Import shared injection keys
import { WORKFLOWS_KEY, CURRENT_WORKFLOW_ID_KEY, IS_EDIT_MODE_KEY, PAGES_KEY, ADD_PAGE_KEY, UPDATE_NODE_KEY } from './constants/injection-keys';

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
  modelValue: Record<string, any>;
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
  modelValue: () => ({} as Record<string, any>),
  item: () => null,
  validationErrors: () => [],
  collectionInfo: () => ({}),
  permissions: () => ({}),
});

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, any>];
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
const api = useApi();

// Initialize module configuration for standalone module access
const { workflowsCollection, isInitialized, error: configError, initializeCollection, saveConfig } = useModuleConfig();

// Route handling
const route = useRoute();
const router = useRouter();
const routeWorkflowId = computed(() => {
  debugLog('Current route:', { path: route.path, params: route.params, fullPath: route.fullPath });
  return route.params.id as string | undefined;
});

// Basic notification shim (adjust if real notifications composable becomes available)
const notifications = {
  add: (payload: { title: string; text?: string; type?: string }) => {
    const level = payload.type === 'error' ? 'error' : 'info';
    console[level]('[WorkflowsEditor]', payload.title, payload.text || '');
  },
};

// Internal edits mirror to detect parent binding
const internalEdits = ref<Record<string, any>>({ ...(props.modelValue || {}) });

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

// Initialize multi-selection composable
const {
  selectedNodes,
  isMultiSelecting,
  toggleNodeSelection,
  clearSelection: clearMultiSelection,
  selectAll,
  invertSelection,
  updateNodeClasses,
} = useMultiSelection(flowNodes, {
  notifications,
});

// Override updateNodeData to also persist changes
const updateNodeData = () => {
  baseUpdateNodeData();
  updatePageCounts();
  // Update the field to persist the changes
  boundUpdateField('data', createFlowDataStructure(
    flowNodes.value,
    flowEdges.value,
    pages.value,
    currentPageId.value,
    pageViewports.value
  ));
};

// Initialize data transformation composable
const {
  parseFlowData,
  serializeFlowData, 
  createFlowDataStructure,
  validateAndNormalizeNodes,
  validateAndNormalizeEdges,
  compareFlowData,
  hasDataDiverged,
  createDragTransferData,
  parseDragTransferData,
  createDataPreview,
  deepClone,
} = useDataTransformation();

// Update edge data and persist changes
const updateEdgeData = () => {
  const flowData = createFlowDataStructure(
    flowNodes.value,
    flowEdges.value, 
    pages.value,
    currentPageId.value,
    pageViewports.value
  );
  boundUpdateField('nodes', flowData.nodes);
  boundUpdateField('edges', flowData.edges);
  boundUpdateField('pages', flowData.pages);
  boundUpdateField('currentPageId', flowData.currentPageId);
  boundUpdateField('pageViewports', flowData.pageViewports);
};

// selectedEdge, selectedNodes, isMultiSelecting, isLoadingInitialData are now provided by composables

/*
 * Multi-selection feature implementation:
 * - Hold Ctrl/Cmd and click nodes to select multiple nodes
 * - Selected nodes get green outline (multi-selected class)
 * - Clicking empty space clears selection
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

// Vue Flow composable - moved here to be available for other composables
const { project, fitView, updateEdge, addEdges, snapToGrid, getViewport, setViewport, getNodes, getEdges } = useVueFlow();

// Initialize follow mode composable
const {
  followMode,
  focusedNodeId,
  showDescriptions,
  focusedNodeDescription,
  setFollowMode,
  toggleDescriptions,
  focusOnNode,
  navigateNode,
  getFocusedNodeStyle,
} = useFollowMode(flowNodes, flowEdges, {
  onFocus: (nodeId) => {
    debugLog('Focused on node', nodeId);
  },
  fitView,
});
// Initialize collection data composable
const {
  availableCollections,
  availableWorkflows,
  fetchCollections,
  loadWorkflows,
} = useCollectionData();

// Loading state for workflows
const loadingWorkflows = ref(false);

// Initialize selected edge state
const selectedEdge = ref<Edge | null>(null);

// Initialize dialog composable
const {
  showNodePalette,
  showDetailsSidebar,
  toggleNodePalette,
  toggleDetailsSidebar,
  getDescriptionDialogPosition,
  layoutClasses,
} = useDialog(focusedNodeId);

// Computed property for description dialog with position
const focusedNodeDescriptionWithPosition = computed(() => {
  if (!focusedNodeDescription.value) return null;
  
  const position = getDescriptionDialogPosition();
  return {
    ...focusedNodeDescription.value,
    x: parseInt(position.left || '20'),
    y: parseInt(position.top || '20'),
  };
});

// Initialize node utilities composable
const {
  getNodeIcon,
  formatNodeType,
  validateConnection,
  createEdgeFromConnection,
  handleOpenCollection: handleOpenCollectionUtil,
  createNodeFromDrop,
  getDefaultEdgeType,
  getDefaultNodeSize,
} = useNodeUtilities();

// Node types for the palette
const nodeTypes = [
  { type: 'start', label: 'Start', icon: 'play_arrow' },
  { type: 'end', label: 'End', icon: 'stop' },
  { type: 'process', subtype: 'task', label: 'Task', icon: 'task' },
  { type: 'process', subtype: 'form', label: 'Form', icon: 'description' },
  { type: 'decision', label: 'Decision', icon: 'help' },
  { type: 'page', label: 'Page', icon: 'pentagon' },
];

// Computed properties
const title = computed(() => {
  const collectionName = props.collectionInfo?.name || props.collection || 'Item';
  
  if (props.isNew) {
    return `Creating ${collectionName}`;
  }
  
  // Make title singular and mode-aware
  const action = (internalMode.value === 'edit' && !followMode.value) ? 'Editing' : 'Viewing';
  const itemType = collectionName.replace(/s$/, ''); // Make singular
  return `${action} ${itemType}`;
});

const breadcrumbItems = computed(() => {
  const items: any[] = [{ name: 'Workflow', to: '/workflow' }];
  
  if (routeWorkflowId.value) {
    items.push({
      name: flowName.value || routeWorkflowId.value,
      to: `/workflow/${routeWorkflowId.value}`
    });
  }
  
  return items;
});

const hasChanges = computed(() => {
  // Name difference should also count as change
  const currentName = flowName.value?.trim();
  const originalName = props.item?.name ?? '';

  if (props.isNew && currentName) {
    return true;
  }
  if (!props.isNew && currentName && currentName !== originalName) {
    return true;
  }

  // Primary signal: parent-provided edits
  if (props.modelValue && Object.keys(props.modelValue).length > 0) {
    return true;
  }
  // Fallback: compare current flow with original item data using data transformation
  if (hasDataDiverged(props.item, flowNodes.value, flowEdges.value)) {
    return true;
  }
  
  return false;
});

// Computed property to get workflow IDs used in terminal node connectors (removed off-page functionality)
const usedWorkflowIds = computed(() => {
  return flowNodes.value
    .filter(node => node.type === 'end' && node.data.targetWorkflowId)
    .map(node => node.data.targetWorkflowId)
    .filter((id, index, arr) => arr.indexOf(id) === index); // Remove duplicates
});

// focusedNodeDescription is now provided by useFollowMode composable

// Local flow name state to prevent blanking after save
const flowName = ref<string>('');

// Initialize local name from edits/item
watch(
  () => [props.modelValue?.name, props.item?.name, props.isNew],
  () => {
    // Prefer explicit edit name, else item name, else keep existing if already set during same session
    const candidate = (props.modelValue as any)?.name ?? props.item?.name;
    if (candidate && candidate !== flowName.value) {
      flowName.value = candidate;
    }
    // If neither provided and empty, leave as empty (user may type next)
  },
  { immediate: true }
);

// Debug watcher for props.modelValue
watch(
  () => props.modelValue,
  (newEdits, oldEdits) => {
    debugLog('parent edits sync', newEdits);
  },
  { deep: true }
);

// updateField is now provided by usePersistence composable - create wrapper for logging
// This wrapper binds the required parameters so composables can call it with just (fieldKey, value)
const boundUpdateField = (fieldKey: string, value: any) => {
   updateField(fieldKey, value, props.modelValue, emit, props.saving);
};

const saveFlow = async () => {
  updatePageCounts(); // Update counts before saving
  
  // Save current page viewport before saving
  const currentViewport = getViewport();
  savePageViewport(currentPageId.value, currentViewport);
  
  await saveFlowComposable(
    props.primaryKey,
    props.isNew,
    props.modelValue,
    props.item,
    flowName.value,
    updatePageCounts
  );
};

const cloneWorkflow = async () => {
  await cloneWorkflowComposable(
    props.isNew,
    props.item,
    props.modelValue,
    flowName.value
  );
};
// Component event handlers
const handleUpdateFlowName = (name: string) => {
  flowName.value = name;
  boundUpdateField('name', name);
};

const handleModeChange = (newMode: 'edit' | 'view') => {
  internalMode.value = newMode;
  emit('update:mode', newMode);
};

// toggleFollowMode and toggleDescriptions now provided by useFollowMode composable







// focusOnNode, getConnectedNode, and navigateNode are now provided by useFollowMode composable







// Page viewport management (defined before useNodeEvents needs it)
const pageViewports = ref<Record<string, { x: number; y: number; zoom: number }>>({});

// Initialize persistence composable (handles saving, cloning, loading)
const {
  localSaving,
  savedItemId,
  isLoadingInitialData,
  lastEmitVersion,
  updateField,
  saveFlow: saveFlowComposable,
  cloneWorkflow: cloneWorkflowComposable,
  loadFlowData: loadFlowDataComposable,
} = usePersistence(flowNodes, flowEdges, pages, currentPageId, pageViewports, {
  collection: props.collection,
  api,
  notifications,
  onSave: (saved) => {
    // Keep local flowName stable (prefer server echo if provided)
    if (saved?.name && saved.name !== flowName.value) {
      flowName.value = saved.name;
    }
    
    
    
    // Clear ALL edits since data is now persisted in the database
    emit('update:modelValue', {});
    
    // NO refresh needed - in-memory state is already correct after save
    // Emitting refresh causes a race condition where stale data gets loaded
  },
  onError: (e) => {
    debugLog('persistence error', e?.response || e);
  },
});

// Watch for parent modelValue changes (now that lastEmitVersion is available)
watch(() => props.modelValue, (val) => {
  const str = JSON.stringify(val || {});
  if (str !== lastEmitVersion.value) {
    internalEdits.value = { ...(val || {}) };
    debugLog('parent edits sync', val);
  } else {
    debugLog('parent echoed emitted edits');
  }
});

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

// Initialize node events composable (handles node selection, clicking, dragging, deletion)
const {
  onNodeClick,
  onNodeDragStop,
  deleteSelectedNode: deleteSelectedNodeFromComposable,
} = useNodeEvents({
  isEditMode,
  flowNodes,
  flowEdges,
  selectedNode,
  selectedEdge,
  selectedNodes,
  isMultiSelecting,
  updateNodeClasses,
  updateField: boundUpdateField,
  handleEnterPage,
  debugLog,
  pages,
  currentPageId,
  pageViewports,
  getNodes,
  getEdges,
});

// Initialize edge events composable
const {
  onConnectStart,
  onConnectEnd,
  onConnect,
  onEdgeUpdate,
  onEdgeClick,
  deleteSelectedEdge,
} = useEdgeEvents({
  isEditMode,
  flowNodes,
  flowEdges,
  selectedNode,
  selectedEdge,
  updateField: boundUpdateField,
  debugLog,
});

// Initialize canvas events composable
const {
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onPaneClick,
} = useCanvasEvents({
  isEditMode,
  currentPageId, 
  flowNodes,
  project,
  selectedNode,
  selectedEdge,
  selectedNodes,
  isMultiSelecting,
  updateNodeData,
  updateNodeClasses,
  handleOpenCollection: handleOpenCollectionUtil,
});

// Initialize keyboard events composable
const { handleKeyDown } = useKeyboardEvents({
  followMode,
  onNavigate: navigateNode,
});

// Initialize node update handlers composable
const {
  updateFormCollection,
  updateFormCollections,
  updateEndNodeTarget,
  updatePageNodeTarget,
  updateNodeProperty,
  deleteNodeProperty,
  persistFlowData,
} = useNodeUpdateHandlers({
  selectedNode,
  flowNodes,
  flowEdges,
  updateNodeData,
  updateField: boundUpdateField,
});

// onNodeDragStop is now provided by useNodeEvents composable





const handleNavigateToWorkflow = async (workflowId: string | number) => {
  if (!workflowId) return;
  debugLog('navigate-to-workflow requested', workflowId.toString());

  try {
    isLoadingInitialData.value = true;

    // Fetch the workflow data from the API
    const response = await api.get(`/items/workflows/${workflowId}`);
    const workflowData = response?.data?.data;

    if (!workflowData) {
      notifications.add({
        title: 'Workflow Not Found',
        text: `Could not load workflow ${workflowId}`,
        type: 'error'
      });
      return;
    }

    // Load the workflow data into the canvas
    debugLog('Loading workflow data:', workflowData);

    // Parse and load the flow data
    const nodes = workflowData.nodes || workflowData.data?.nodes || [];
    const edges = workflowData.edges || workflowData.data?.edges || [];
    const pagesData = workflowData.pages || workflowData.data?.pages || [];
    const currentPageIdData = workflowData.currentPageId || workflowData.data?.currentPageId || 'root';
    const pageViewportsData = workflowData.pageViewports || workflowData.data?.pageViewports || {};

    // Update the flow state
    flowNodes.value = nodes;
    flowEdges.value = edges;
    pages.value = pagesData;
    currentPageId.value = currentPageIdData;
    pageViewports.value = pageViewportsData;

    // Update the flow name
    flowName.value = workflowData.name || 'Untitled Workflow';

    // Update page counts
    updatePageCounts();

    // Fit view to show all nodes
    nextTick(() => {
      if (flowNodes.value.length > 0) {
        fitView({
          nodes: flowNodes.value.map(n => n.id),
          duration: 400,
          padding: { top: 0.15, bottom: 0.15, left: 0.15, right: 0.15 }
        });
      }
    });

    notifications.add({
      title: 'Workflow Loaded',
      text: workflowData.name || `Workflow ${workflowId}`,
      type: 'success'
    });
  } catch (e: any) {
    const message = e?.response?.data?.errors?.[0]?.message || e.message || 'Failed to load workflow';
    notifications.add({ title: 'Load Failed', text: message, type: 'error' });
    debugLog('Error loading workflow:', e);
  } finally {
    isLoadingInitialData.value = false;
  }
};

const handleOpenCollection = handleOpenCollectionUtil;

// Navigate to workflow with URL update
const handleNavigateToWorkflowWithRoute = (workflowId: string | number) => {
  const workflowIdStr = workflowId.toString();
  debugLog('Navigating to workflow with route:', workflowIdStr);
  router.push(`/workflow/${workflowIdStr}`);
};

// Handle refresh workflows
const handleRefreshWorkflows = async () => {
  loadingWorkflows.value = true;
  try {
    const collectionToUse = props.collection || workflowsCollection.value;
    if (collectionToUse) {
      await loadWorkflows(collectionToUse, props.primaryKey?.toString());
    }
  } finally {
    loadingWorkflows.value = false;
  }
};

// Page navigation handlers
const handleNavigateToPage = (pageId: string) => {
  // Save current viewport state for the current page
  const currentViewport = getViewport();
  savePageViewport(currentPageId.value, currentViewport);
  
  // Navigate to the new page
  navigateToPage(pageId);
  
  // Restore or set viewport for the new page
  nextTick(() => {
    const savedViewport = getPageViewport(pageId);
    if (savedViewport) {
      // Restore saved viewport
      setViewport(savedViewport, { duration: 300 });
    } else if (visibleNodes.value.length > 0) {
      // Fit view to show the nodes on the new page with extra bottom padding for PageSelector
      fitView({ 
        nodes: visibleNodes.value.map(n => n.id),
        duration: 400,
        padding: { top: 0.15, bottom: 0.15, left: 0.15, right: 0.15 }
      });
    }
  });
};

// Page viewport management (pageViewports is defined earlier before useNodeEvents)

const savePageViewport = (pageId: string, viewport: { x: number; y: number; zoom: number }) => {
  pageViewports.value[pageId] = { ...viewport };
};

const getPageViewport = (pageId: string) => {
  return pageViewports.value[pageId] || null;
};

// New page management functions for PageSelector
const handleCreatePage = () => {
  const newPageId = `page-${Date.now()}`;
  const newPageName = `Page ${pages.value.length + 1}`;
  
  // Predefined set of nice colors
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#64748b'];
  const pageColor = colors[pages.value.length % colors.length];
  
  addPage({
    id: newPageId,
    name: newPageName,  
    description: `New page created on ${new Date().toLocaleDateString()}`,
    parentPageId: 'root', // Always create at root level for now
    color: pageColor
  });
  
  // Navigate to the new page
  handleNavigateToPage(newPageId);
  
  // Update node data to persist the page
  updateNodeData();
  
  notifications.add({ 
    title: 'Page Created', 
    text: `"${newPageName}" has been created and is now active`, 
    type: 'success' 
  });
};

const handleDeletePage = (pageId: string) => {
  if (pageId === 'root') return; // Can't delete root page
  
  // If we're currently on the page being deleted, navigate to root
  if (currentPageId.value === pageId) {
    handleNavigateToPage('root');
  }
  
  // Remove the page
  removePage(pageId);
  
  // Remove any page nodes that reference this page
  flowNodes.value = flowNodes.value.filter(node => 
    !(node.type === 'page' && node.data?.targetPageId === pageId)
  );
  
  // Update and persist
  updateNodeData();
};

const handleRenamePage = (pageId: string, newName: string) => {
  if (pageId === 'root') return; // Can't rename root page
  
  const page = pages.value.find(p => p.id === pageId);
  if (page) {
    page.name = newName;
    
    // Page nodes that reference this page don't need updates
    // as they show their own label, not the target page name
    
    // Update and persist
    updateNodeData();
  }
};

// deleteSelectedNode is now provided by useNodeEvents composable as deleteSelectedNodeFromComposable
const deleteSelectedNode = deleteSelectedNodeFromComposable;



// Alignment functions and multi-selection are now provided by useMultiSelection composable

// clearSelection logic is handled by onPaneClick from useCanvasEvents



// Load workflows and collections when primaryKey changes
watch(() => props.primaryKey, async () => {
  // Load workflows for the collection
  const collectionToUse = props.collection || workflowsCollection.value;
  if (collectionToUse) {
    loadingWorkflows.value = true;
    try {
      await loadWorkflows(collectionToUse, props.primaryKey?.toString());
    } finally {
      loadingWorkflows.value = false;
    }
  }
  fetchCollections();
}, { immediate: true });

// Load workflow from URL if ID is present
watch(() => routeWorkflowId.value, async (workflowId) => {
  if (workflowId && workflowId !== props.primaryKey?.toString()) {
    debugLog('Loading workflow from URL:', workflowId);
    await handleNavigateToWorkflow(workflowId);
    
    // Update the URL to use the base path (optional - prevents nested IDs)
    // router.replace({ params: { id: undefined } });
  }
}, { immediate: true });

provide(WORKFLOWS_KEY, availableWorkflows);
provide(CURRENT_WORKFLOW_ID_KEY, computed(() => props.primaryKey?.toString() || null));
provide(IS_EDIT_MODE_KEY, isEditMode);
provide(PAGES_KEY, pages);
provide(ADD_PAGE_KEY, addPage);
provide(UPDATE_NODE_KEY, (nodeId: string, updates: any) => {
  const node = flowNodes.value.find(n => n.id === nodeId);
  if (node && node.data) {
    Object.assign(node.data, updates);
    updateNodeData();
  }
});

// Lifecycle hooks
onMounted(async () => {
  // Initialize module config if accessed as standalone module
  if (!props.collection && isInitialized.value === false) {
    await initializeCollection();
  }
  
  // Hide the default Directus header when using custom headers
  const headerBar = document.querySelector('.header-bar');
  if (headerBar) {
    (headerBar as HTMLElement).style.display = 'none';
  }
   
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

  
  // Clean up page enter event listener
  document.removeEventListener('enter-page', (event: any) => {
    if (event.detail?.pageId) {
      handleEnterPage(event.detail.pageId);
    }
  });
});

// Initialize data watchers composable
useDataWatchers({
  // Props-related refs
  itemData: computed(() => props.item),
  isLoadingInitialData,
  
  // Flow state refs
  flowNodes,
  flowEdges,
  pages,
  currentPageId,
  pageViewports,
  
  // Selection state refs
  selectedNodes,
  isMultiSelecting,
  selectedNode,
  selectedEdge,
  
  // Utility functions
  validateAndNormalizeNodes,
  validateAndNormalizeEdges,
  updatePageCounts,
  createFlowDataStructure,
  compareFlowData,
  updateField: boundUpdateField,
  updateNodeClasses,
  
  // External handlers
  handleOpenCollection,
  
  // Viewport functions
  getPageViewport,
  setViewport,
  fitView,
});


</script>

<template>
	<private-view title="Workflow">
		<!-- <template #headline>
			<v-breadcrumb :items="breadcrumbItems" />
		</template>

		<template #title>
			<h1 class="type-title">Workflow</h1>
		</template> -->

    <template #navigation>
      <navigation-sidebar
        :workflows="availableWorkflows"
        :loading="loadingWorkflows"
        :current-workflow-id="props.primaryKey?.toString() || null"
        @select="handleNavigateToWorkflowWithRoute"
        @refresh="handleRefreshWorkflows"
      />
    </template>

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
			@toggle-follow-mode="setFollowMode"
			@toggle-descriptions="toggleDescriptions"
		/>

			<!-- Main Editor Layout -->
			<div class="editor-layout" :class="layoutClasses">
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
					<ExpandButtons
						:show-node-palette="showNodePalette"
						:show-details-sidebar="showDetailsSidebar"
						:is-edit-mode="isEditMode"
						@toggle-node-palette="toggleNodePalette"
						@toggle-details-sidebar="toggleDetailsSidebar"
					/>



					<!-- Node Description Dialog -->
					<NodeDescriptionDialog
						:node-description="focusedNodeDescriptionWithPosition"
						:show-dialog="Boolean(focusedNodeDescription && followMode && showDescriptions)"
					/>

					<Transition name="page-transition" mode="out-in">
						<VueFlow
							:key="currentPageId"
							v-model:nodes="visibleNodes"
							v-model:edges="visibleEdges"
						:node-types="{
							start: StartNode,
							end: EndNode,
							terminal: TerminalNode,
							process: ProcessNode,
							decision: DecisionNode,

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
						:fit-view-on-init="false"
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
						@node-drag-stop="onNodeDragStop"
					>
						<!-- Controls -->
						<Controls />

						<!-- Background with grid -->
						<Background pattern="dots" :gap="20" :size="1" color="#aaa" />
						</VueFlow>
					</Transition>

					<!-- Page Selector at bottom of canvas -->
					<div class="page-selector-container">
						<PageSelector
							:pages="pages"
							:current-page-id="currentPageId"
							:is-edit-mode="isEditMode"
							@navigate-to-page="handleNavigateToPage"
							@create-page="handleCreatePage"
							@delete-page="handleDeletePage"
							@rename-page="handleRenamePage"
						/>
					</div>

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
					:available-pages="pages"
					:used-workflow-ids="usedWorkflowIds"
					:edits="props.modelValue"
					:item="props.item"
					@update-node-data="updateNodeData"
					@update-edge-data="updateEdgeData"
					@update-form-collection="updateFormCollection"
					@update-form-collections="updateFormCollections"
					@update-end-node-target="updateEndNodeTarget"
					@update-page-node-target="updatePageNodeTarget"
					@delete-selected-node="deleteSelectedNode"
					@delete-selected-edge="deleteSelectedEdge"
					@navigate-to-workflow="handleNavigateToWorkflow"
					@navigate-to-page="handleNavigateToPage"
					@toggle="toggleDetailsSidebar"
				/>
			</div>
		</div>
	</private-view>
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
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--theme--background, #ffffff);
  padding: var(--content-padding);
  padding-top: 0;
  overflow: hidden;
}

.editor-layout {
  flex: 1;
  display: grid;
  grid-template-columns: 250px 1fr 300px;
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
.canvas-container :deep(.vue-flow__node.selected .page-node) {
  outline: 3px solid var(--theme--primary, #0066cc);
  outline-offset: 3px;
  box-shadow: 0 0 8px rgba(0, 102, 204, 0.3);
}

/* Multi-selection styling */
.canvas-container :deep(.vue-flow__node.multi-selected .terminal-node),
.canvas-container :deep(.vue-flow__node.multi-selected .process-node),
.canvas-container :deep(.vue-flow__node.multi-selected .decision-node),
.canvas-container :deep(.vue-flow__node.multi-selected .page-node) {
  outline: 3px solid var(--theme--secondary, #28a745);
  outline-offset: 3px;
  box-shadow: 0 0 8px rgba(40, 167, 69, 0.3);
}

/* Follow mode focused node styling */
.canvas-container :deep(.vue-flow__node.focused .terminal-node),
.canvas-container :deep(.vue-flow__node.focused .process-node),
.canvas-container :deep(.vue-flow__node.focused .decision-node),
.canvas-container :deep(.vue-flow__node.focused .page-node) {
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





/* Page Selector Container */
.page-selector-container {
  position: absolute;
  bottom: 4rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
}

/* Page Transition Animation */
.page-transition-enter-active,
.page-transition-leave-active {
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.page-transition-enter-from {
  opacity: 0;
  transform: translateX(30px) scale(0.95);
  filter: blur(2px);
}

.page-transition-leave-to {
  opacity: 0;
  transform: translateX(-30px) scale(0.95);
  filter: blur(2px);
}

.page-transition-enter-to,
.page-transition-leave-from {
  opacity: 1;
  transform: translateX(0) scale(1);
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

/* Hide scrollbars while maintaining scrollability */
::-webkit-scrollbar {
	width: 0;
	height: 0;
}

::-webkit-scrollbar-track {
	background: transparent;
}

::-webkit-scrollbar-thumb {
	background: transparent;
}

/* Firefox scrollbar hiding */
* {
	scrollbar-width: none;
}

/* Deep targeting for parent containers */
:deep(::-webkit-scrollbar) {
	width: 0;
	height: 0;
}

:deep(::-webkit-scrollbar-track) {
	background: transparent;
}

:deep(::-webkit-scrollbar-thumb) {
	background: transparent;
}

/* Target private-view scrollbar */
:deep(.v-private-view) {
	scrollbar-width: none;
	-ms-overflow-style: none;
}

:deep(.v-private-view::-webkit-scrollbar) {
	width: 0;
	height: 0;
}

::-webkit-scrollbar-track {
	background: transparent;
}

::-webkit-scrollbar-thumb {
	background: transparent;
}

/* Firefox scrollbar hiding */
* {
	scrollbar-width: none;
}

</style>
