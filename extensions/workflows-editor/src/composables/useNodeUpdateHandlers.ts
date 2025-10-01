import type { Node, Edge } from '@vue-flow/core';
import type { Ref } from 'vue';

export interface NodeUpdateHandlerOptions {
  selectedNode: Ref<Node | null>;
  flowNodes: Ref<Node[]>;
  flowEdges: Ref<Edge[]>;
  updateNodeData: () => void;
  updateField: (field: string, value: any) => void;
}

export function useNodeUpdateHandlers(options: NodeUpdateHandlerOptions) {
  const { selectedNode, flowNodes, flowEdges, updateNodeData, updateField } = options;

  const persistFlowData = () => {
    updateField('data', {
      nodes: flowNodes.value,
      edges: flowEdges.value,
    });
  };

  const updateFormCollection = (collectionName: string) => {
    if (
      selectedNode.value && 
      selectedNode.value.type === 'process' && 
      selectedNode.value.data.subtype === 'form'
    ) {
      selectedNode.value.data.targetCollection = collectionName;
      updateNodeData();
      persistFlowData();
    }
  };

  const updateFormCollections = (collections: Array<{ collection: string; label?: string }>) => {
    if (
      selectedNode.value && 
      selectedNode.value.type === 'process' && 
      selectedNode.value.data.subtype === 'form'
    ) {
      selectedNode.value.data.targetCollections = collections;
      
      if (collections.length > 0) {
        delete selectedNode.value.data.targetCollection;
      }
      
      updateNodeData();
      persistFlowData();
    }
  };

  const updateEndNodeTarget = (workflowId: string) => {
    if (selectedNode.value && selectedNode.value.type === 'end') {
      if (!workflowId) {
        delete selectedNode.value.data.targetWorkflowId;
      } else {
        selectedNode.value.data.targetWorkflowId = workflowId;
      }
      
      updateNodeData();
      persistFlowData();
    }
  };

  const updatePageNodeTarget = (pageId: string) => {
    if (selectedNode.value && selectedNode.value.type === 'page') {
      if (!pageId) {
        delete selectedNode.value.data.targetPageId;
      } else {
        selectedNode.value.data.targetPageId = pageId;
      }
      
      updateNodeData();
      persistFlowData();
    }
  };

  const updateNodeProperty = (property: string, value: any) => {
    if (selectedNode.value?.data) {
      selectedNode.value.data[property] = value;
      updateNodeData();
      persistFlowData();
    }
  };

  const deleteNodeProperty = (property: string) => {
    if (selectedNode.value?.data) {
      delete selectedNode.value.data[property];
      updateNodeData();
      persistFlowData();
    }
  };

  return {
    updateFormCollection,
    updateFormCollections,
    updateEndNodeTarget,
    updatePageNodeTarget,
    updateNodeProperty,
    deleteNodeProperty,
    persistFlowData,
  };
}
