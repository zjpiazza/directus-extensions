import { ref, computed } from 'vue';
import type { Node, Edge } from '@vue-flow/core';

export interface WorkflowData {
  nodes: Node[];
  edges: Edge[];
}

export function useWorkflowData(initialData?: WorkflowData) {
  const flowNodes = ref<Node[]>(initialData?.nodes || []);

  const flowEdges = ref<Edge[]>(initialData?.edges || []);

  const selectedNode = ref<Node | null>(null);

  // Computed properties
  const workflowData = computed((): WorkflowData => ({
    nodes: flowNodes.value,
    edges: flowEdges.value,
  }));

  // Methods
  const updateNodeData = () => {
    flowNodes.value = [...flowNodes.value];
  };

  const addNode = (node: Node) => {
    flowNodes.value.push(node);
  };

  const removeNode = (nodeId: string) => {
    flowNodes.value = flowNodes.value.filter((node: Node) => node.id !== nodeId);
    flowEdges.value = flowEdges.value.filter((edge: Edge) =>
      edge.source !== nodeId && edge.target !== nodeId
    );
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

  const addEdge = (edge: Edge) => {
    flowEdges.value.push(edge);
  };

  const removeEdge = (edgeId: string) => {
    flowEdges.value = flowEdges.value.filter(edge => edge.id !== edgeId);
  };

  const selectNode = (node: Node | null) => {
    selectedNode.value = node;
  };

  const clearSelection = () => {
    selectedNode.value = null;
  };

  return {
    // Reactive data
    flowNodes,
    flowEdges,
    selectedNode,
    workflowData,

    // Methods
    updateNodeData,
    addNode,
    removeNode,
    updateNode,
    addEdge,
    removeEdge,
    selectNode,
    clearSelection,
  };
}
