import type { Node, Edge } from '@vue-flow/core';
import { debugLog } from '../utils/debugHelpers';

/**
 * Data Transformation Composable
 * Handles JSON parsing, serialization, data validation, and comparison operations
 */
export function useDataTransformation() {
  
  /**
   * Safely parse data as JSON string or return as object
   */
  const parseFlowData = (data: any) => {
    if (!data) return { nodes: [], edges: [] };
    
    try {
      return typeof data === 'string' ? JSON.parse(data) : data;
    } catch (error) {
      debugLog('Failed to parse flow data', error);
      return { nodes: [], edges: [] };
    }
  };

  /**
   * Serialize data to JSON string with error handling
   */
  const serializeFlowData = (data: any): string => {
    try {
      return JSON.stringify(data);
    } catch (error) {
      debugLog('Failed to serialize flow data', error);
      return '{}';
    }
  };

  /**
   * Create a complete flow data structure for persistence
   */
  const createFlowDataStructure = (
    nodes: Node[],
    edges: Edge[],
    pages: any[],
    currentPageId: string,
    pageViewports: Record<string, { x: number; y: number; zoom: number }>
  ) => {
    return {
      nodes,
      edges,
      pages,
      currentPageId,
      pageViewports,
    };
  };

  /**
   * Validate and normalize nodes from loaded data
   */
  const validateAndNormalizeNodes = (
    nodes: Node[] = [],
    handleOpenCollection?: (collectionName: string) => void
  ): Node[] => {
    return nodes.map((node: Node, index: number) => {
      // Clean any multi-selection classes from persisted data
      const cleanClass = (typeof node.class === 'string' && node.class) 
        ? node.class.replace(/\s*multi-selected\s*/g, ' ').trim()
        : '';
        
      return {
        ...node,
        // Ensure every node has a stable id (fallback if missing)
        id: node.id || `node-${index}-${Date.now()}`,
        class: cleanClass,
        data: {
          label: node.data?.label || 'Unnamed',
          name: node.data?.name || node.data?.label || 'Unnamed',
          description: node.data?.description || '',
          ...node.data,
          // Provide the openCollection function to process nodes
          ...(node.type === 'process' && handleOpenCollection && { openCollection: handleOpenCollection }),
        },
      };
    });
  };

  /**
   * Validate and normalize edges from loaded data
   */
  const validateAndNormalizeEdges = (edges: Edge[] = []): Edge[] => {
    return edges.map((edge: Edge) => ({
      ...edge,
      id: edge.id || `edge-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      type: edge.type || 'step',
      animated: edge.animated !== false,
      style: edge.style || { strokeWidth: 2 },
      markerEnd: edge.markerEnd || 'arrowclosed',
      data: { label: edge.data?.label || '', ...edge.data }, // Ensure data structure with label
    }));
  };

  /**
   * Compare two data structures for equality (deep comparison using JSON)
   */
  const compareFlowData = (
    current: { nodes: Node[]; edges: Edge[] },
    loaded: any
  ): { nodesMatch: boolean; edgesMatch: boolean } => {
    if (!loaded || typeof loaded !== 'object') {
      return { nodesMatch: false, edgesMatch: false };
    }

    try {
      const currentNodesJson = JSON.stringify(current.nodes);
      const loadedNodesJson = JSON.stringify(loaded.nodes || []);
      const currentEdgesJson = JSON.stringify(current.edges);
      const loadedEdgesJson = JSON.stringify(loaded.edges || []);
      
      return {
        nodesMatch: currentNodesJson === loadedNodesJson,
        edgesMatch: currentEdgesJson === loadedEdgesJson,
      };
    } catch (error) {
      debugLog('Failed to compare flow data', error);
      return { nodesMatch: false, edgesMatch: false };
    }
  };

  /**
   * Check if current data has diverged from original data
   */
  const hasDataDiverged = (
    originalData: any,
    currentNodes: Node[],
    currentEdges: Edge[]
  ): boolean => {
    try {
      const original = parseFlowData(originalData);
      const current = { nodes: currentNodes, edges: currentEdges };
      const { nodesMatch, edgesMatch } = compareFlowData(current, original);
      return !nodesMatch || !edgesMatch;
    } catch (error) {
      debugLog('Failed to check data divergence', error);
      return false;
    }
  };

  /**
   * Create a drag/drop data transfer payload
   */
  const createDragTransferData = (nodeType: any): string => {
    return serializeFlowData(nodeType);
  };

  /**
   * Parse drag/drop data transfer payload
   */
  const parseDragTransferData = (data: string | null) => {
    if (!data) return null;
    
    try {
      return JSON.parse(data);
    } catch (error) {
      debugLog('Failed to parse drag transfer data', error);
      return null;
    }
  };

  /**
   * Create a data preview string for debugging (truncated JSON)
   */
  const createDataPreview = (data: any, maxLength: number = 200): string => {
    if (!data) return 'no data';
    
    try {
      const jsonString = typeof data === 'string' ? data : JSON.stringify(data);
      return jsonString.length > maxLength 
        ? jsonString.substring(0, maxLength) + '...'
        : jsonString;
    } catch (error) {
      return 'invalid data';
    }
  };

  /**
   * Deep clone an object using JSON serialization (simple approach)
   */
  const deepClone = <T>(obj: T): T => {
    try {
      return JSON.parse(JSON.stringify(obj));
    } catch (error) {
      debugLog('Failed to deep clone object', error);
      return obj;
    }
  };

  return {
    // JSON operations
    parseFlowData,
    serializeFlowData,
    
    // Data structure operations
    createFlowDataStructure,
    validateAndNormalizeNodes,
    validateAndNormalizeEdges,
    
    // Comparison operations
    compareFlowData,
    hasDataDiverged,
    
    // Drag/drop operations
    createDragTransferData,
    parseDragTransferData,
    
    // Utility operations
    createDataPreview,
    deepClone,
  };
}