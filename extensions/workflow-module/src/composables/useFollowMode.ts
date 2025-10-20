import { ref, computed, onMounted, onUnmounted, type Ref } from 'vue';
import type { Node, Edge } from '@vue-flow/core';

export interface FollowModeOptions {
  onFocus?: (nodeId: string) => void;
  onNavigate?: (direction: 'up' | 'down' | 'left' | 'right', nextNodeId: string | null) => void;
  fitView?: (options: any) => void;
}

export function useFollowMode(
  flowNodes: Ref<Node[]>,
  flowEdges: Ref<Edge[]>,
  options: FollowModeOptions = {}
) {
  const followMode = ref(false);
  const focusedNodeId = ref<string | null>(null);
  const showDescriptions = ref(false);

  const focusedNode = computed(() => {
    if (!focusedNodeId.value) return null;
    return flowNodes.value.find(node => node.id === focusedNodeId.value) || null;
  });

  const focusedNodeDescription = computed(() => {
    if (!focusedNode.value || !showDescriptions.value) return null;
    
    const description = focusedNode.value.data?.description?.trim();
    const displayDescription = description || 'No description available for this node.';
    
    return {
      id: focusedNode.value.id,
      title: focusedNode.value.data?.name || focusedNode.value.data?.label || 'Untitled',
      description: displayDescription,
      type: focusedNode.value.type,
      position: focusedNode.value.position,
      hasDescription: !!description
    };
  });

  const directionToHandle: Record<string, string> = {
    up: 'top',
    down: 'bottom',
    left: 'left',
    right: 'right'
  };

  const getConnectedNode = (nodeId: string, direction: 'up' | 'down' | 'left' | 'right'): string | null => {
    const targetHandle = directionToHandle[direction];
    
    const outgoingEdge = flowEdges.value.find(edge => 
      edge.source === nodeId && edge.sourceHandle === targetHandle
    );
    
    if (outgoingEdge) {
      return outgoingEdge.target;
    }
    
    const incomingEdge = flowEdges.value.find(edge => 
      edge.target === nodeId && edge.targetHandle === targetHandle
    );
    
    if (incomingEdge) {
      return incomingEdge.source;
    }
    
    return null;
  };

  const focusOnNode = (nodeId: string) => {
    const node = flowNodes.value.find(n => n.id === nodeId);
    if (!node) return;
    
    focusedNodeId.value = nodeId;
    
    flowNodes.value.forEach(n => {
      if (n.class && typeof n.class === 'string') {
        n.class = n.class.replace(/\s*focused\s*/g, ' ').trim();
      }
    });
    
    const targetNode = flowNodes.value.find(n => n.id === nodeId);
    if (targetNode) {
      const currentClass = typeof targetNode.class === 'string' ? targetNode.class : '';
      targetNode.class = (currentClass + ' focused').trim();
    }
    
    options.onFocus?.(nodeId);
    
    if (options.fitView) {
      options.fitView({
        nodes: [nodeId],
        duration: 400,
        padding: { top: 0.3, bottom: 0.3, left: 0.3, right: 0.3 },
        maxZoom: 1.5,
        minZoom: 1.2
      });
    }
  };

  const navigateNode = (direction: 'up' | 'down' | 'left' | 'right') => {
    if (!followMode.value || !focusedNodeId.value) return;
    
    const nextNodeId = getConnectedNode(focusedNodeId.value, direction);
    
    options.onNavigate?.(direction, nextNodeId);
    
    if (nextNodeId) {
      focusOnNode(nextNodeId);
    }
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (!followMode.value) return;
    
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
      event.preventDefault();
      
      switch (event.key) {
        case 'ArrowUp':
          navigateNode('up');
          break;
        case 'ArrowDown':
          navigateNode('down');
          break;
        case 'ArrowLeft':
          navigateNode('left');
          break;
        case 'ArrowRight':
          navigateNode('right');
          break;
      }
    }
  };

  const enableFollowMode = () => {
    followMode.value = true;
    
    if (!focusedNodeId.value && flowNodes.value.length > 0) {
      const firstNode = flowNodes.value[0];
      if (firstNode?.id) {
        focusOnNode(firstNode.id);
      }
    } else if (focusedNodeId.value) {
      focusOnNode(focusedNodeId.value);
    }
  };

  const disableFollowMode = () => {
    followMode.value = false;
    
    flowNodes.value.forEach(n => {
      if (n.class && typeof n.class === 'string') {
        n.class = n.class.replace(/\s*focused\s*/g, ' ').trim();
      }
    });
    
    focusedNodeId.value = null;
    showDescriptions.value = false;
  };

  const toggleFollowMode = (enabled: boolean) => {
    if (enabled) {
      enableFollowMode();
    } else {
      disableFollowMode();
    }
  };

  const toggleDescriptions = (enabled: boolean) => {
    showDescriptions.value = enabled;
  };

  onMounted(() => {
    document.addEventListener('keydown', handleKeyDown);
  });

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeyDown);
  });

  return {
    followMode,
    focusedNodeId,
    showDescriptions,
    focusedNode,
    focusedNodeDescription,
    
    focusOnNode,
    navigateNode,
    getConnectedNode,
    
    enableFollowMode,
    disableFollowMode,
    toggleFollowMode,
    toggleDescriptions,
  };
}
