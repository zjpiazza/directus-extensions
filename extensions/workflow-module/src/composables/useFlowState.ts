import { ref, computed, type Ref } from 'vue';
import type { Node, Edge } from '@vue-flow/core';

export interface FlowSelection {
  selectedNode: Ref<Node | null>;
  selectedEdge: Ref<Edge | null>;
  selectedNodes: Ref<Set<string>>;
  isMultiSelecting: Ref<boolean>;
}

export interface FlowState {
  nodes: Ref<Node[]>;
  edges: Ref<Edge[]>;
  selection: FlowSelection;
}

export function useFlowState(initialNodes: Node[] = [], initialEdges: Edge[] = []) {
  const flowNodes = ref<Node[]>(initialNodes);
  const flowEdges = ref<Edge[]>(initialEdges);
  
  const selectedNode = ref<Node | null>(null);
  const selectedEdge = ref<Edge | null>(null);
  const selectedNodes = ref<Set<string>>(new Set());
  const isMultiSelecting = ref(false);

  const addNode = (node: Node) => {
    flowNodes.value.push(node);
  };

  const removeNode = (nodeId: string) => {
    flowNodes.value = flowNodes.value.filter((node: Node) => node.id !== nodeId);
    flowEdges.value = flowEdges.value.filter((edge: Edge) =>
      edge.source !== nodeId && edge.target !== nodeId
    );
    
    if (selectedNode.value?.id === nodeId) {
      selectedNode.value = null;
    }
    
    selectedNodes.value.delete(nodeId);
  };

  const updateNode = (nodeId: string, updates: Partial<Node>) => {
    const nodeIndex = flowNodes.value.findIndex(n => n.id === nodeId);
    if (nodeIndex !== -1) {
      const existingNode = flowNodes.value[nodeIndex];
      if (existingNode) {
        flowNodes.value[nodeIndex] = { 
          ...existingNode, 
          ...updates,
          id: existingNode.id,
          position: updates.position || existingNode.position
        };
      }
    }
  };

  const updateNodeData = () => {
    flowNodes.value = [...flowNodes.value];
  };

  const addEdge = (edge: Edge) => {
    flowEdges.value.push(edge);
  };

  const removeEdge = (edgeId: string) => {
    flowEdges.value = flowEdges.value.filter(edge => edge.id !== edgeId);
    
    if (selectedEdge.value?.id === edgeId) {
      selectedEdge.value = null;
    }
  };

  const updateEdge = (edgeId: string, updates: Partial<Edge>) => {
    const edgeIndex = flowEdges.value.findIndex(e => e.id === edgeId);
    if (edgeIndex !== -1) {
      const existingEdge = flowEdges.value[edgeIndex];
      if (existingEdge) {
        flowEdges.value[edgeIndex] = { 
          ...existingEdge, 
          ...updates,
          id: existingEdge.id
        };
      }
    }
  };

  const selectNode = (node: Node | null) => {
    selectedNode.value = node;
    selectedEdge.value = null;
  };

  const selectEdge = (edge: Edge | null) => {
    selectedEdge.value = edge;
    selectedNode.value = null;
  };

  const clearSelection = () => {
    selectedNode.value = null;
    selectedEdge.value = null;
  };

  const toggleNodeSelection = (nodeId: string) => {
    const newSet = new Set(selectedNodes.value);
    if (newSet.has(nodeId)) {
      newSet.delete(nodeId);
    } else {
      newSet.add(nodeId);
    }
    selectedNodes.value = newSet;
    isMultiSelecting.value = newSet.size > 0;
  };

  const addToSelection = (nodeId: string) => {
    const newSet = new Set(selectedNodes.value);
    newSet.add(nodeId);
    selectedNodes.value = newSet;
    isMultiSelecting.value = true;
  };

  const removeFromSelection = (nodeId: string) => {
    const newSet = new Set(selectedNodes.value);
    newSet.delete(nodeId);
    selectedNodes.value = newSet;
    isMultiSelecting.value = newSet.size > 0;
  };

  const clearMultiSelection = () => {
    selectedNodes.value = new Set();
    isMultiSelecting.value = false;
  };

  const selectMultipleNodes = (nodeIds: string[]) => {
    selectedNodes.value = new Set(nodeIds);
    isMultiSelecting.value = nodeIds.length > 0;
  };

  const getNode = (nodeId: string): Node | undefined => {
    return flowNodes.value.find(n => n.id === nodeId);
  };

  const getEdge = (edgeId: string): Edge | undefined => {
    return flowEdges.value.find(e => e.id === edgeId);
  };

  const getNodesByType = (type: string): Node[] => {
    return flowNodes.value.filter(n => n.type === type);
  };

  const getEdgesBySource = (sourceId: string): Edge[] => {
    return flowEdges.value.filter(e => e.source === sourceId);
  };

  const getEdgesByTarget = (targetId: string): Edge[] => {
    return flowEdges.value.filter(e => e.target === targetId);
  };

  const hasSelection = computed(() => 
    selectedNode.value !== null || selectedEdge.value !== null
  );

  const hasMultiSelection = computed(() => 
    selectedNodes.value.size > 1
  );

  return {
    flowNodes,
    flowEdges,
    
    selectedNode,
    selectedEdge,
    selectedNodes,
    isMultiSelecting,
    
    hasSelection,
    hasMultiSelection,
    
    addNode,
    removeNode,
    updateNode,
    updateNodeData,
    
    addEdge,
    removeEdge,
    updateEdge,
    
    selectNode,
    selectEdge,
    clearSelection,
    
    toggleNodeSelection,
    addToSelection,
    removeFromSelection,
    clearMultiSelection,
    selectMultipleNodes,
    
    getNode,
    getEdge,
    getNodesByType,
    getEdgesBySource,
    getEdgesByTarget,
  };
}
