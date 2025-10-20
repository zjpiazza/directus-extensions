import { type Ref, type ComputedRef } from 'vue';
import type { Node, Edge } from '@vue-flow/core';

interface NodeEventOptions {
  isEditMode: Ref<boolean>;
  flowNodes: Ref<Node[]>;
  flowEdges: Ref<Edge[]>;
  selectedNode: Ref<Node | null>;
  selectedEdge: Ref<any>;
  selectedNodes: Ref<Set<string>>;
  isMultiSelecting: Ref<boolean>;
  updateNodeClasses: () => void;
  updateField: (field: string, value: any) => void;
  handleEnterPage?: (pageId: string) => void;
  debugLog?: (...args: any[]) => void;
  // Optional page-related data
  pages?: Ref<any[]>;
  currentPageId?: Ref<string>;
  pageViewports?: Ref<Record<string, any>>;
  // Vue Flow getters - these are ComputedRefs that directly contain the arrays
  getNodes?: ComputedRef<Node[]>;
  getEdges?: ComputedRef<Edge[]>;
}

/**
 * Composable for handling node events
 * Manages node selection, clicking, dragging, and deletion
 */
export function useNodeEvents(options: NodeEventOptions) {
  const {
    isEditMode,
    flowNodes,
    flowEdges,
    selectedNode,
    selectedEdge,
    selectedNodes,
    isMultiSelecting,
    updateNodeClasses,
    updateField,
    handleEnterPage,
    debugLog = console.log,
    pages,
    currentPageId,
    pageViewports,
    getNodes,
    getEdges,
  } = options;

  /**
   * Handle node click - manages selection and page navigation
   */
  const onNodeClick = (event: { node: Node; event: MouseEvent }) => {  
    const nodeId = event.node.id;
    
    // Handle page node navigation in view mode
    if (event.node.type === 'page' && !isEditMode.value && event.node.data?.targetPageId) {
      handleEnterPage?.(event.node.data.targetPageId);
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

  /**
   * Handle node drag stop - persist position changes
   */
  const onNodeDragStop = () => {
    debugLog('Node drag stopped, marking as dirty');
    
    // Get current nodes and edges from Vue Flow (includes updated positions)
    // getNodes and getEdges are ComputedRefs, access them with .value
    const currentNodes = getNodes?.value || flowNodes.value;
    const currentEdges = getEdges?.value || flowEdges.value;
    
    console.log('🔍 Nodes after drag stop:', JSON.stringify(currentNodes.map((n: Node) => ({ id: n.id, position: n.position })), null, 2));
    
    // Deep clone to ensure Vue reactivity detects the change
    const nodesClone = JSON.parse(JSON.stringify(currentNodes));
    const edgesClone = JSON.parse(JSON.stringify(currentEdges));
    
    // Update the reactive refs first (this updates the local state)
    flowNodes.value = nodesClone;
    flowEdges.value = edgesClone;
    
    // Then persist to database
    updateField('nodes', nodesClone);
    updateField('edges', edgesClone);
    
    if (pages) {
      updateField('pages', JSON.parse(JSON.stringify(pages.value)));
    }
    if (currentPageId) {
      updateField('currentPageId', currentPageId.value);
    }
    if (pageViewports) {
      updateField('pageViewports', JSON.parse(JSON.stringify(pageViewports.value)));
    }
  };

  /**
   * Delete the currently selected node and its connected edges
   */
  const deleteSelectedNode = () => {
    if (selectedNode.value) {
      const nodeId = selectedNode.value.id;
      flowNodes.value = flowNodes.value.filter((node: Node) => node.id !== nodeId);
      flowEdges.value = flowEdges.value.filter((edge: Edge) =>
        edge.source !== nodeId && edge.target !== nodeId
      );
      selectedNode.value = null;

      updateField('nodes', flowNodes.value);
      updateField('edges', flowEdges.value);
    }
  };

  return {
    onNodeClick,
    onNodeDragStop,
    deleteSelectedNode,
  };
}
