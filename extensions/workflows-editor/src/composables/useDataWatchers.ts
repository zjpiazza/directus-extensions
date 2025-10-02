import { watch, nextTick } from 'vue';
import type { Ref } from 'vue';
import type { Node, Edge } from '@vue-flow/core';
import type { Page } from './useWorkflowData';

/**
 * Composable for managing data loading and flow change watchers
 * Handles initial data loading and dirty state tracking
 */
export function useDataWatchers({
  // Props-related refs
  itemData,
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
  parseFlowData,
  validateAndNormalizeNodes,
  validateAndNormalizeEdges,
  updatePageCounts,
  createDataPreview,
  createFlowDataStructure,
  compareFlowData,
  updateField,
  updateNodeClasses,
  
  // External handlers
  handleOpenCollection,
  
  // Viewport functions
  getPageViewport,
  setViewport,
  fitView,
}: {
  // Props-related refs
  itemData: Ref<any>;
  isLoadingInitialData: Ref<boolean>;
  
  // Flow state refs
  flowNodes: Ref<Node[]>;
  flowEdges: Ref<Edge[]>;
  pages: Ref<Page[]>;
  currentPageId: Ref<string>;
  pageViewports: Ref<Record<string, { x: number; y: number; zoom: number }>>;
  
  // Selection state refs
  selectedNodes: Ref<Set<any>>;
  isMultiSelecting: Ref<boolean>;
  selectedNode: Ref<any>;
  selectedEdge: Ref<any>;
  
  // Utility functions
  parseFlowData: (data: any) => any;
  validateAndNormalizeNodes: (nodes: any[], handler: any) => Node[];
  validateAndNormalizeEdges: (edges: any[]) => Edge[];
  updatePageCounts: () => void;
  createDataPreview: (data: any, length: number) => any;
  createFlowDataStructure: (nodes: Node[], edges: Edge[], pages: Page[], currentPageId: string, pageViewports: any) => any;
  compareFlowData: (current: any, loaded: any) => { nodesMatch: boolean; edgesMatch: boolean };
  updateField: (field: string, value: any) => void;
  updateNodeClasses: () => void;
  
  // External handlers
  handleOpenCollection: any;
  
  // Viewport functions
  getPageViewport: (pageId: string) => any;
  setViewport: (viewport: any) => void;
  fitView: (options: any) => void;
}) {
  // Watch for props.item changes to load workflow data
  watch(() => itemData.value, (newItem) => {
    const newData = newItem?.data;
    console.log('🔄 props.item changed, loading data:', {
      hasItem: !!newItem,
      hasData: !!newData,
      dataType: typeof newData,
      dataPreview: createDataPreview(newData, 200),
    });
    
    // Set flag to suppress emits during load
    isLoadingInitialData.value = true;
    
    // Clear selection state when loading new data
    selectedNodes.value.clear();
    isMultiSelecting.value = false;
    selectedNode.value = null;
    selectedEdge.value = null;
    
    if (newData) {
      try {
        const flowData = parseFlowData(newData);
        
        console.log('📥 Loading flow data:', {
          nodesCount: flowData.nodes?.length,
          edgesCount: flowData.edges?.length,
          pagesCount: flowData.pages?.length,
          currentPageId: flowData.currentPageId,
          hasPageViewports: !!flowData.pageViewports,
        });

        // Validate and normalize nodes and edges using data transformation composable
        flowNodes.value = validateAndNormalizeNodes(flowData.nodes, handleOpenCollection);
        flowEdges.value = validateAndNormalizeEdges(flowData.edges);
        
        // Load pages data
        pages.value = flowData.pages || [];
        currentPageId.value = flowData.currentPageId || 'root';
        
        // Load page viewports
        pageViewports.value = flowData.pageViewports || {};
        
        // Update page counts after loading
        updatePageCounts();

        const validatedNodes = flowNodes.value;
        if (validatedNodes && validatedNodes.length > 0) {
          nextTick(() => {
            // Restore the saved viewport for the current page instead of calling fitView
            const savedViewport = getPageViewport(currentPageId.value);
            if (savedViewport) {
              setViewport(savedViewport);
            } else {
              // Only call fitView for new workflows without saved viewport
              fitView({
                padding: { top: 0.1, bottom: 0.1, left: 0.1, right: 0.1 },
                includeHiddenNodes: false
              });
            }
            // Clear the loading flag after UI updates
            isLoadingInitialData.value = false;
          });
        } else {
          // Clear the loading flag immediately if no nodes
          isLoadingInitialData.value = false;
        }
      } catch {
        flowNodes.value = [];
        flowEdges.value = [];
        pages.value = [];
        currentPageId.value = 'root';
        isLoadingInitialData.value = false;
      }
    } else {
      isLoadingInitialData.value = false;
    }
  }, { immediate: true });

  // Watch for changes to nodes and edges to mark item as dirty
  watch([flowNodes, flowEdges], () => {
    // Skip emitting during initial data load
    if (isLoadingInitialData.value) {
      console.log('⏸️ flow changed during load (suppressing emit)', { 
        nodes: flowNodes.value.length, 
        edges: flowEdges.value.length,
        isLoadingInitialData: isLoadingInitialData.value 
      });
      return;
    }
    
    // Compare current state with loaded data to avoid false dirty state
    const currentFlowData = createFlowDataStructure(
      flowNodes.value,
      flowEdges.value,
      pages.value,
      currentPageId.value,
      pageViewports.value
    );
    
    const loadedData = itemData.value?.data;
    
    // If we have loaded data, compare it with current state
    if (loadedData && typeof loadedData === 'object') {
      const { nodesMatch, edgesMatch } = compareFlowData(
        { nodes: currentFlowData.nodes, edges: currentFlowData.edges },
        loadedData
      );
      
      if (nodesMatch && edgesMatch) {
        console.log('⏭️ flow changed but matches loaded data (skipping emit)', {
          nodes: flowNodes.value.length,
          edges: flowEdges.value.length,
          nodesMatch,
          edgesMatch
        });
        return;
      }
      
      // Log first node position to debug what's different
      const currentFirstNode = currentFlowData.nodes[0];
      const loadedFirstNode = loadedData.nodes?.[0];
      console.log('🔄 flow changed (emitting - data differs from loaded)', { 
        nodes: flowNodes.value.length, 
        edges: flowEdges.value.length,
        nodesMatch,
        edgesMatch,
        currentFirstNodePos: currentFirstNode ? { x: currentFirstNode.position?.x, y: currentFirstNode.position?.y } : 'none',
        loadedFirstNodePos: loadedFirstNode ? { x: loadedFirstNode.position?.x, y: loadedFirstNode.position?.y } : 'none'
      });
    } else {
      console.log('🔄 flow changed (emitting - no loaded data to compare)', { 
        nodes: flowNodes.value.length, 
        edges: flowEdges.value.length 
      });
    }
    
    updateField('data', currentFlowData);
  }, { deep: true });

  // Watch for changes in multi-selection to update visual classes
  watch([selectedNodes, isMultiSelecting], () => {
    updateNodeClasses();
  }, { deep: true });
}