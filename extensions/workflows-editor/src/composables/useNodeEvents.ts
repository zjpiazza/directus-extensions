import { type Ref } from 'vue';
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
    console.log('🔍 Nodes after drag stop:', JSON.stringify(flowNodes.value.map(n => ({ id: n.id, position: n.position })), null, 2));
    
    const flowData: any = {
      nodes: flowNodes.value,
      edges: flowEdges.value,
    };
    
    // Include page data if available
    if (pages) {
      flowData.pages = pages.value;
    }
    if (currentPageId) {
      flowData.currentPageId = currentPageId.value;
    }
    if (pageViewports) {
      flowData.pageViewports = pageViewports.value;
    }
    
    updateField('data', JSON.parse(JSON.stringify(flowData)));
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

      // Update the field to persist the changes
      updateField('data', {
        nodes: flowNodes.value,
        edges: flowEdges.value,
      });
    }
  };

  return {
    onNodeClick,
    onNodeDragStop,
    deleteSelectedNode,
  };
}
