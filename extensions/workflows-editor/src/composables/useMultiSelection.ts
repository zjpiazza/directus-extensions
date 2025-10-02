import { ref, watch, type Ref } from 'vue';
import type { Node } from '@vue-flow/core';

export interface MultiSelectionOptions {
  onSelectionChange?: (selectedIds: string[]) => void;
  notifications?: {
    add: (payload: { title: string; text?: string; type?: string }) => void;
  };
}

export function useMultiSelection(
  flowNodes: Ref<Node[]>,
  options: MultiSelectionOptions = {}
) {
  const selectedNodes = ref<Set<string>>(new Set());
  const isMultiSelecting = ref(false);

  const updateNodeClasses = () => {
    flowNodes.value.forEach(node => {
      const currentClass = (typeof node.class === 'string' ? node.class : '') || '';
      let newClass = currentClass.replace(/\s*multi-selected\s*/g, ' ').trim();
      
      if (selectedNodes.value.has(node.id) && isMultiSelecting.value) {
        newClass = (newClass + ' multi-selected').trim();
      }
      
      node.class = newClass;
    });
  };

  watch([selectedNodes, isMultiSelecting], () => {
    updateNodeClasses();
    options.onSelectionChange?.(Array.from(selectedNodes.value));
  });

  const toggleNodeSelection = (nodeId: string, isCtrlKey: boolean = false) => {
    if (isCtrlKey) {
      if (selectedNodes.value.has(nodeId)) {
        selectedNodes.value.delete(nodeId);
      } else {
        selectedNodes.value.add(nodeId);
      }
      isMultiSelecting.value = selectedNodes.value.size > 1;
    } else {
      if (isMultiSelecting.value) {
        selectedNodes.value.clear();
      }
      selectedNodes.value.clear();
      selectedNodes.value.add(nodeId);
      isMultiSelecting.value = false;
    }
    
    updateNodeClasses();
  };

  const clearSelection = () => {
    selectedNodes.value.clear();
    isMultiSelecting.value = false;
    updateNodeClasses();
  };

  const getActualNodeDimensions = (nodeId: string): { width: number; height: number } => {
    const nodeElement = document.querySelector(`[data-id="${nodeId}"]`);
    if (nodeElement) {
      const rect = nodeElement.getBoundingClientRect();
      return { width: rect.width, height: rect.height };
    }
    
    const node = flowNodes.value.find(n => n.id === nodeId);
    if (!node) return { width: 160, height: 56 };
    
    switch (node.type) {
      case 'process':
        return { width: 160, height: 56 };
      case 'decision':
        return { width: 136, height: 136 };
      case 'start':
      case 'end':
      case 'terminal':
        return { width: 160, height: 56 };
      case 'page':
        return { width: 60, height: 48 };
      default:
        return { width: 160, height: 56 };
    }
  };

  const getNodeCenter = (node: Node): { x: number; y: number } => {
    const dimensions = getActualNodeDimensions(node.id);
    return {
      x: node.position.x + dimensions.width / 2,
      y: node.position.y + dimensions.height / 2
    };
  };





  const selectAll = () => {
    flowNodes.value.forEach(node => {
      selectedNodes.value.add(node.id);
    });
    isMultiSelecting.value = selectedNodes.value.size > 1;
    updateNodeClasses();
  };

  const invertSelection = () => {
    const newSelection = new Set<string>();
    flowNodes.value.forEach(node => {
      if (!selectedNodes.value.has(node.id)) {
        newSelection.add(node.id);
      }
    });
    selectedNodes.value = newSelection;
    isMultiSelecting.value = selectedNodes.value.size > 1;
    updateNodeClasses();
  };

  return {
    selectedNodes,
    isMultiSelecting,
    
    toggleNodeSelection,
    clearSelection,
    selectAll,
    invertSelection,
    
    getActualNodeDimensions,
    getNodeCenter,
    updateNodeClasses,
  };
}
