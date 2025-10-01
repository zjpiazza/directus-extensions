import { type Ref, nextTick } from 'vue';
import type { Edge, Connection } from '@vue-flow/core';

export interface EdgeUpdateEvent {
  edge: Edge;
  connection: Connection;
}

interface EdgeEventOptions {
  isEditMode: Ref<boolean>;
  flowNodes: Ref<any[]>;
  flowEdges: Ref<Edge[]>;
  selectedNode: Ref<any>;
  selectedEdge: Ref<Edge | null>;
  updateField: (field: string, value: any) => void;
  defaultEdgeType?: Ref<string | undefined>;
  debugLog?: (...args: any[]) => void;
}

/**
 * Composable for handling edge events
 * Manages edge connections, updates, clicks, and deletions
 */
export function useEdgeEvents(options: EdgeEventOptions) {
  const {
    isEditMode,
    flowNodes,
    flowEdges,
    selectedNode,
    selectedEdge,
    updateField,
    defaultEdgeType,
    debugLog = console.log,
  } = options;

  /**
   * Handle connection start
   */
  const onConnectStart = (event: any) => {
    debugLog('onConnectStart', event);
    debugLog('Edit mode:', isEditMode.value);
  };

  /**
   * Handle connection end
   */
  const onConnectEnd = (event: any) => {
    debugLog('onConnectEnd', event);
    debugLog('Current edges count:', flowEdges.value.length);
    debugLog('Event details:', {
      type: event?.type,
      target: event?.target,
      currentTarget: event?.currentTarget,
      clientX: event?.clientX,
      clientY: event?.clientY
    });
  };

  /**
   * Handle new edge connection
   */
  const onConnect = (connection: Connection) => {
    debugLog('onConnect: TRIGGERED with connection:', connection);
    debugLog('Connection details:', {
      source: connection.source,
      target: connection.target,
      sourceHandle: connection.sourceHandle,
      targetHandle: connection.targetHandle
    });
    debugLog('Edit mode:', isEditMode.value);

    if (!isEditMode.value) {
      debugLog('❌ Not in edit mode, ignoring connection');
      return;
    }

    // Validate connection
    if (!connection.source || !connection.target) {
      debugLog('❌ Invalid connection: missing source or target', { source: connection.source, target: connection.target });
      return;
    }

    // Prevent self-connections
    if (connection.source === connection.target) {
      debugLog('❌ Prevented self-connection');
      return;
    }

    // Check if edge already exists
    const existingEdge = flowEdges.value.find(edge =>
      edge.source === connection.source &&
      edge.target === connection.target &&
      edge.sourceHandle === connection.sourceHandle &&
      edge.targetHandle === connection.targetHandle
    );

    if (existingEdge) {
      debugLog('❌ Edge already exists, skipping duplicate');
      return;
    }

    // Get default edge type from workflow settings
    const edgeType = defaultEdgeType?.value || 'bezier';
    
    // Create a proper edge object with all required properties
    const newEdge: Edge = {
      id: `edge-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      source: connection.source!,
      target: connection.target!,
      sourceHandle: connection.sourceHandle,
      targetHandle: connection.targetHandle,
      type: edgeType,
      animated: true,
      style: { strokeWidth: 2 },
      markerEnd: 'arrowclosed' as any,
      data: { label: '' },
    };

    debugLog('✅ Creating new edge', newEdge);
    
    // Use direct array replacement for better reactivity
    flowEdges.value = [...flowEdges.value, newEdge];
    
    debugLog('✅ Edge added to array, total edges:', flowEdges.value.length);
    debugLog('✅ Current flowEdges:', flowEdges.value);

    // Immediately update the field to persist the change
    nextTick(() => {
      debugLog('💾 Persisting edges to field');
      updateField('data', {
        nodes: flowNodes.value,
        edges: flowEdges.value,
      });
      debugLog('💾 Field updated');
    });
  };

  /**
   * Handle edge update (reconnection)
   */
  const onEdgeUpdate = (event: EdgeUpdateEvent) => {
    if (!isEditMode.value) return;

    // Validate the update
    if (!event.connection.source || !event.connection.target) {
      debugLog('Invalid edge update: missing source or target');
      return;
    }

    // Prevent self-connections
    if (event.connection.source === event.connection.target) {
      debugLog('Prevented self-connection during edge update');
      return;
    }

    // Find the edge to update
    const edgeIndex = flowEdges.value.findIndex(edge => edge.id === event.edge.id);
    if (edgeIndex !== -1) {
      // Check if the new connection would create a duplicate edge
      const wouldDuplicate = flowEdges.value.some((edge, index) =>
        index !== edgeIndex &&
        edge.source === event.connection.source &&
        edge.target === event.connection.target &&
        edge.sourceHandle === event.connection.sourceHandle &&
        edge.targetHandle === event.connection.targetHandle
      );

      if (wouldDuplicate) {
        debugLog('Edge update would create duplicate, skipping');
        return;
      }

      // Update the edge with new connection by creating a new edge object
      const currentEdge = flowEdges.value[edgeIndex];
      if (currentEdge) {
        const updatedEdge: Edge = {
          ...currentEdge,
          source: event.connection.source!,
          target: event.connection.target!,
          sourceHandle: event.connection.sourceHandle,
          targetHandle: event.connection.targetHandle,
        };
        
        flowEdges.value[edgeIndex] = updatedEdge;

        // Immediately update the field to persist the change
        nextTick(() => {
          updateField('data', {
            nodes: flowNodes.value,
            edges: flowEdges.value,
          });
        });
      }
    }
  };

  /**
   * Handle edge click - select edge
   */
  const onEdgeClick = (event: { edge: Edge }) => {
    selectedEdge.value = event.edge;
    selectedNode.value = null; // Clear node selection when edge is selected
  };

  /**
   * Delete the currently selected edge
   */
  const deleteSelectedEdge = () => {
    if (selectedEdge.value) {
      const edgeId = selectedEdge.value.id;
      flowEdges.value = flowEdges.value.filter((edge: Edge) => edge.id !== edgeId);
      selectedEdge.value = null;

      // Update the field to persist the changes
      updateField('data', {
        nodes: flowNodes.value,
        edges: flowEdges.value,
      });
    }
  };

  return {
    onConnectStart,
    onConnectEnd,
    onConnect,
    onEdgeUpdate,
    onEdgeClick,
    deleteSelectedEdge,
  };
}
