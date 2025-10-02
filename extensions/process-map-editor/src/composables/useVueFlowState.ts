import { ref, computed, watch } from 'vue';
import { useVueFlow } from '@vue-flow/core';
import type { Node, Edge } from '@vue-flow/core';
import { createDefaultNodes } from '../domain/utils/nodeFactory';
import { createDefaultEdges } from '../domain/utils/edgeFactory';

export function useVueFlowState() {
	const { getViewport, setViewport, onInit, zoomIn, zoomOut, fitView } = useVueFlow();
	
	const currentZoom = ref(1);
	
	const defaultNodes = createDefaultNodes();
	const defaultEdges = createDefaultEdges();
	
	const flowNodes = ref<Node[]>([...defaultNodes]);
	const flowEdges = ref<Edge[]>([...defaultEdges]);

	// Computed zoom level class
	const zoomLevelClass = computed(() => `zoom-level-${Math.round(currentZoom.value * 10)}`);

	// Initialize Vue Flow
	onInit(() => {
		// Initialize zoom tracking
		const viewport = getViewport();
		if (viewport) {
			currentZoom.value = viewport.zoom;
		}
	});

	// Watch for zoom changes and update node scaling
	watch(() => getViewport(), (viewport) => {
		if (viewport) {
			currentZoom.value = viewport.zoom;
		}
	}, { deep: true });

	// Vue Flow event handlers
	function onNodesInitialized() {
		// Fit view after nodes are initialized
		setTimeout(() => {
			// Optional: Custom positioning logic
		}, 100);
	}

	function onViewportMove(event: { flowTransform: { x: number; y: number; zoom: number } }) {
		// Update current zoom when viewport moves
		currentZoom.value = event.flowTransform.zoom;
	}

	function resetToDefaultLayout() {
		console.log('Resetting to default layout...');
		flowNodes.value = createDefaultNodes();
		flowEdges.value = createDefaultEdges();
	}

	// Get current complete state for saving
	function getCurrentFlowState() {
		return {
			nodes: flowNodes.value.map(node => ({
				id: node.id,
				position: { ...node.position },
				type: node.type,
				data: { ...node.data }
			})),
			edges: flowEdges.value.map(edge => ({
				...edge,
				id: edge.id,
				source: edge.source,
				target: edge.target
			})),
			viewport: getViewport() || { x: 0, y: 0, zoom: 1 }
		};
	}

	// Load flow state from saved data
	function loadFlowState(savedState: { nodes?: Node[], edges?: Edge[], viewport?: any }) {
		if (savedState.nodes) {
			console.log('Restoring saved nodes:', savedState.nodes);
			flowNodes.value = savedState.nodes;
		}
		if (savedState.edges) {
			console.log('Restoring saved edges:', savedState.edges);
			flowEdges.value = savedState.edges;
		}
		if (savedState.viewport) {
			setTimeout(() => {
				setViewport(savedState.viewport);
			}, 100);
		}
	}

	return {
		// State
		flowNodes,
		flowEdges,
		currentZoom,
		
		// Computed
		zoomLevelClass,
		
		// Vue Flow methods
		zoomIn,
		zoomOut,
		fitView,
		getViewport,
		setViewport,
		
		// Event handlers
		onNodesInitialized,
		onViewportMove,
		
		// Methods
		resetToDefaultLayout,
		getCurrentFlowState,
		loadFlowState,
	};
}