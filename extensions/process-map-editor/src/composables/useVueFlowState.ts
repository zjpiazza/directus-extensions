import { ref, computed, watch } from 'vue';
import { useVueFlow } from '@vue-flow/core';
import type { Node, Edge } from '@vue-flow/core';

export function useVueFlowState() {
	const { getViewport, setViewport, onInit, zoomIn, zoomOut, fitView } = useVueFlow();
	
	// Vue Flow state
	const currentZoom = ref(1);
	
	// Default nodes and edges
	const defaultNodes: Node[] = [
		// Phase nodes - positioned with proper spacing: 1/5, 1/5, 2/5, 1/5
		{
			id: 'request-node',
			type: 'phase',
			position: { x: 100, y: 80 },
			data: { label: 'Request\nService/Report', phase: 'request' }
		},
		{
			id: 'evaluate-node',
			type: 'phase',
			position: { x: 300, y: 80 },
			data: { label: 'Evaluate Service', phase: 'evaluate' }
		},
		{
			id: 'provide-node',
			type: 'phase',
			position: { x: 500, y: 80 },
			data: { label: 'Provide Services', phase: 'provide' }
		},
		{
			id: 'reevaluate-node',
			type: 'phase',
			position: { x: 900, y: 80 },
			data: { label: 'Reevaluate Services', phase: 'reevaluate' }
		},
		{
			id: 'end-node',
			type: 'phase',
			position: { x: 1100, y: 200 },
			data: { label: 'End Of Services', phase: 'end' }
		},
		// Decision node
		{
			id: 'decision-node',
			type: 'decision',
			position: { x: 840, y: 200 },
			data: { label: 'Appropriate\nTo\nContinue?', yesLabel: 'Yes', noLabel: 'No' }
		}
	];

	const defaultEdges: Edge[] = [
		// Main flow arrows - horizontal flow across the top
		{ id: 'e1', source: 'request-node', target: 'evaluate-node', type: 'step', sourceHandle: 'right', targetHandle: 'left', markerEnd: 'arrowclosed' },
		{ id: 'e2', source: 'evaluate-node', target: 'provide-node', type: 'step', sourceHandle: 'right', targetHandle: 'left', markerEnd: 'arrowclosed' },
		{ id: 'e3', source: 'provide-node', target: 'reevaluate-node', type: 'step', sourceHandle: 'right', targetHandle: 'left', markerEnd: 'arrowclosed' },
		// From reevaluate down to decision
		{ id: 'e4', source: 'reevaluate-node', target: 'decision-node', type: 'step', sourceHandle: 'bottom', targetHandle: 'right', markerEnd: 'arrowclosed' },
		// From decision to end (No path)
		{ id: 'e5', source: 'decision-node', target: 'end-node', type: 'step', sourceHandle: 'bottom', targetHandle: 'left', label: 'No', markerEnd: 'arrowclosed' },
		// Loop back from decision to provide services (Yes path)
		{ id: 'e6', source: 'decision-node', target: 'provide-node', type: 'step', sourceHandle: 'left', targetHandle: 'bottom', label: 'Yes', markerEnd: 'arrowclosed' }
	];
	
	// Flow nodes and edges state
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

	// Reset to default node and edge layout
	function resetToDefaultLayout() {
		console.log('Resetting to default layout...');
		
		// Reset nodes to original positions
		flowNodes.value = [
			// Phase nodes - positioned with proper spacing: 1/5, 1/5, 2/5, 1/5
			{
				id: 'request-node',
				type: 'phase',
				position: { x: 100, y: 80 },
				data: { label: 'Request\nService/Report', phase: 'request' }
			},
			{
				id: 'evaluate-node',
				type: 'phase',
				position: { x: 300, y: 80 },
				data: { label: 'Evaluate Service', phase: 'evaluate' }
			},
			{
				id: 'provide-node',
				type: 'phase',
				position: { x: 500, y: 80 },
				data: { label: 'Provide Services', phase: 'provide' }
			},
			{
				id: 'reevaluate-node',
				type: 'phase',
				position: { x: 900, y: 80 },
				data: { label: 'Reevaluate Services', phase: 'reevaluate' }
			},
			{
				id: 'end-node',
				type: 'phase',
				position: { x: 1100, y: 200 },
				data: { label: 'End Of Services', phase: 'end' }
			},
			// Decision node
			{
				id: 'decision-node',
				type: 'decision',
				position: { x: 840, y: 200 },
				data: { label: 'Appropriate\nTo\nContinue?', yesLabel: 'Yes', noLabel: 'No' }
			}
		];

		// Reset edges to default
		flowEdges.value = [...defaultEdges];
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