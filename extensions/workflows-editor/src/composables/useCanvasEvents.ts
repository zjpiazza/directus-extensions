import { type Ref } from 'vue';
import type { Node } from '@vue-flow/core';

interface CanvasEventOptions {
  isEditMode: Ref<boolean>;
  currentPageId: Ref<string | null>;
  flowNodes: Ref<Node[]>;
  project: (position: { x: number; y: number }) => { x: number; y: number };
  selectedNode: Ref<Node | null>;
  selectedEdge: Ref<any>;
  selectedNodes: Ref<Set<string>>;
  isMultiSelecting: Ref<boolean>;
  updateNodeData: () => void;
  updateNodeClasses: () => void;
  defaultNodeSize?: Ref<string | undefined>;
  handleOpenCollection?: (collectionName: string) => void;
}

/**
 * Composable for handling canvas drag and drop events
 * Manages node creation from palette, drag feedback, and canvas clicks
 */
export function useCanvasEvents(options: CanvasEventOptions) {
  const {
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
    defaultNodeSize,
    handleOpenCollection,
  } = options;

  /**
   * Handle drag start from node palette
   */
  const onDragStart = (event: DragEvent, nodeType: any) => {
    if (event.dataTransfer) {
      event.dataTransfer.setData('application/vueflow', JSON.stringify(nodeType));
      event.dataTransfer.effectAllowed = 'move';
    }
  };

  /**
   * Handle drag over canvas
   */
  const onDragOver = (event: DragEvent) => {
    if (!isEditMode.value) return;

    event.preventDefault();

    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  };

  /**
   * Handle drag leave canvas
   */
  const onDragLeave = () => {
    if (!isEditMode.value) return;
  };

  /**
   * Handle drop on canvas - create new node
   */
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
    const nodeSize = defaultNodeSize?.value || 'medium';
    
    const newNode: Node = {
      id: `${nodeType.type}-${Date.now()}`,
      type: nodeType.type,
      position,
      data: {
        label: nodeType.label,
        name: nodeType.label,
        description: '',
        nodeSize,
        pageId: currentPageId.value,
        ...(nodeType.subtype && { subtype: nodeType.subtype }),
        ...(nodeType.subtype === 'form' && { targetCollection: '' }),
        ...(nodeType.type === 'process' && handleOpenCollection && { openCollection: handleOpenCollection }),
        ...(nodeType.type === 'page' && { 
          targetPageId: null,
          nodeCount: 0,
          color: '#3b82f6'
        }),
      },
    };

    flowNodes.value.push(newNode);
    
    // Update node data and persist
    updateNodeData();
  };

  /**
   * Handle click on empty canvas area - clear selections
   */
  const onPaneClick = () => {
    selectedNode.value = null;
    selectedEdge.value = null;
    selectedNodes.value.clear();
    isMultiSelecting.value = false;
    
    // Update visual feedback
    updateNodeClasses();
  };

  return {
    onDragStart,
    onDragOver,
    onDragLeave,
    onDrop,
    onPaneClick,
  };
}
