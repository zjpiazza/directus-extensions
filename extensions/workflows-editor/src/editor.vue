<script setup lang="ts">
import { computed, ref, watch, nextTick, provide, onMounted, onUnmounted } from 'vue';
import { VueFlow, ConnectionMode, useVueFlow } from '@vue-flow/core';
import type { Node, Edge, EdgeUpdateEvent, Connection } from '@vue-flow/core';
import { Controls } from '@vue-flow/controls';
import { Background } from '@vue-flow/background';
import type { Field, ValidationError } from '@directus/types';
import { useApi } from '@directus/extensions-sdk';


// Import your custom node components
import { TerminalNode, ProcessNode, DecisionNode, OffPageNode, CustomHeader } from '@directus-extensions/vue-flow-shared';

interface Props {
	collection: string;
	primaryKey?: string | null;
	isNew: boolean;
	item: Record<string, any> | null;
	edits: Record<string, any>;
	fields: Field[];
	loading: boolean;
	saving: boolean;
	validationErrors: ValidationError[];
	collectionInfo: any;
	permissions: any;
	mode?: 'edit' | 'view';
}

const props = withDefaults(defineProps<Props>(), {
	mode: 'edit',
});

// Check if user can edit based on permissions
const canEdit = computed(() => {
	// Check for create permission on new items, update permission on existing items
	if (props.isNew) {
		return props.permissions?.create !== false;
	}
	return props.permissions?.update !== false;
});

const emit = defineEmits<{
	'update:edits': [value: Record<string, any>];
	save: [];
	refresh: [];
	delete: [];
	archive: [];
	'save-as-copy': [];
	'update:mode': [mode: 'edit' | 'view'];
}>();

// API and navigation setup
const api = useApi();
const currentWorkflowId = computed(() => props.primaryKey || props.item?.id || 'new');

// Mode-based behavior
const isEditMode = computed(() => props.mode === 'edit');
const isViewMode = computed(() => props.mode === 'view');

// Follow mode state
const followMode = ref(false);
const focusedNodeId = ref<string | null>(null);
const availableWorkflows = ref<Array<{ id: string; name: string }>>([]);

// Provide API and current workflow ID to child components
provide('api', api);
provide('currentWorkflowId', currentWorkflowId.value);
provide('collection', props.collection);
provide('availableWorkflows', availableWorkflows);

// Fetch available workflows from Directus
const fetchWorkflows = async () => {
	try {
		if (!api) {
			console.warn('API not available for fetching workflows');
			return;
		}

		// Only fetch workflows if we're not creating a new item
		if (currentWorkflowId.value === '+' || !currentWorkflowId.value) {
			availableWorkflows.value = [];
			return;
		}

		// Use the current collection for fetching other workflows
		const response = await api.get(`/items/${props.collection}`, {
			params: {
				fields: ['id', 'name'],
				filter: {
					id: {
						_neq: currentWorkflowId.value // Exclude current workflow
					}
				}
			}
		});

		availableWorkflows.value = response.data.data || [];
	} catch (error) {
		console.error('Failed to fetch workflows:', error);
		availableWorkflows.value = [];
	}
};

// Function to fetch available collections for form nodes
const fetchCollections = async () => {
	try {
		const response = await api.get('/collections', {
			params: {
				fields: ['collection', 'meta.name']
			}
		});

		availableCollections.value = response.data.data
			.filter((collection: any) => !collection.collection.startsWith('directus_')) // Filter out system collections
			.map((collection: any) => ({
				value: collection.collection,
				text: collection.meta?.name || collection.collection
			}));
	} catch (error) {
		console.error('Failed to fetch collections:', error);
		availableCollections.value = [];
	}
};

// Handle workflow navigation
const navigateToWorkflow = (workflowId: string) => {
	// Update the field data to ensure current state is saved
	updateField('data', {
		nodes: flowNodes.value,
		edges: flowEdges.value,
	});
	
	// Use the correct Directus URL format for collections and open in new tab
	const targetUrl = `/admin/content/${props.collection}/${workflowId}`;
	window.open(targetUrl, '_blank');
};

// Handle collection opening in new window
const openCollection = (collectionName: string) => {
	// Construct the URL for creating a new entry in the collection
	const collectionUrl = `/admin/content/${collectionName}/+`;
	// Open in a new window/tab
	window.open(collectionUrl, '_blank');
};

// Vue Flow composable
const { project, fitView, updateEdge, zoomTo, getViewport, setViewport, addEdges } = useVueFlow();


// Flow state
const selectedNode = ref<Node | null>(null);
const availableCollections = ref<any[]>([]);
const showDescriptionModal = ref(false);
const flowNodes = ref<Node[]>([
	// Initialize with some example nodes for testing
	{
		id: '1',
		type: 'input',
		position: { x: 250, y: 5 },
		label: 'Start Node',
		data: { label: 'Start Node', description: 'Starting point of the flow' },
	},
	{
		id: '2',
		type: 'default',
		position: { x: 100, y: 100 },
		label: 'Process Node',
		data: { label: 'Process Node', description: 'Processing step' },
	},
	{
		id: '3',
		type: 'output',
		position: { x: 400, y: 200 },
		label: 'End Node',
		data: { label: 'End Node', description: 'End point of the flow' },
	},
]);
const flowEdges = ref<Edge[]>([
	{
		id: 'e1-2',
		source: '1',
		target: '2',
	},
	{
		id: 'e2-3',
		source: '2',
		target: '3',
		animated: true,
	},
]);

// Node types for the palette
const nodeTypes = [
	{ type: 'terminal', label: 'Terminal', icon: 'radio_button_checked' }, // Start/End (oval)
	{ type: 'process', subtype: 'task', label: 'Task', icon: 'crop_square' }, // Task process (blue rectangle)
	{ type: 'process', subtype: 'form', label: 'Form', icon: 'description' }, // Form process (green rectangle)
	{ type: 'decision', label: 'Decision', icon: 'change_history' }, // Decision (diamond)
	{ type: 'offpage', label: 'Off-page Connector', icon: 'home' }, // Off-page connector (house shape)
];

// Custom header logic
const shouldUseCustomHeader = computed(() => {
	const customHeader = (props.collectionInfo?.meta as any)?.custom_header_component;
	return !!customHeader && customHeader !== null;
});

const customHeaderName = computed(() => {
	return (props.collectionInfo?.meta as any)?.custom_header_component || 'custom-header-basic';
});

const title = computed(() => {
	return props.isNew 
		? `Creating ${props.collectionInfo?.name || props.collection}` 
		: `Editing ${props.collectionInfo?.name || props.collection}`;
});

const hasChanges = computed(() => {
	// Check if there are any edits in the props.edits object
	return Object.keys(props.edits).length > 0;
});

// Fetch workflows and collections on component mount
onMounted(() => {
	// Hide the default Directus header when using custom headers
	if (shouldUseCustomHeader.value) {
		const headerBar = document.querySelector('.header-bar');
		if (headerBar) {
			(headerBar as HTMLElement).style.display = 'none';
		}
	}
	
	// Add keyboard event listener for follow mode navigation
	document.addEventListener('keydown', handleKeyDown);
	
	fetchWorkflows();
	fetchCollections();
});

onUnmounted(() => {
	// Clean up keyboard event listener
	document.removeEventListener('keydown', handleKeyDown);
});

// Initialize flow data from item
watch(() => props.item, (newItem) => {
	if (newItem?.data) {
		try {
			const flowData = typeof newItem.data === 'string'
				? JSON.parse(newItem.data)
				: newItem.data;

			flowNodes.value = flowData.nodes || [];
			// Convert existing edges to step type and make them animated
			flowEdges.value = (flowData.edges || []).map((edge: Edge) => ({
				...edge,
				type: 'step',
				animated: true,
			}));

			// Fit view after loading data
			if (flowData.nodes && flowData.nodes.length > 0) {
				nextTick(() => {
					fitView({ padding: 0.1, includeHiddenNodes: false });
				});
			}
		} catch {
			// Error parsing flow data
			flowNodes.value = [];
			flowEdges.value = [];
		}
	}
}, { immediate: true });

// Watch for changes in nodes/edges and update edits
watch([flowNodes, flowEdges], () => {
	const flowData = {
		nodes: flowNodes.value,
		edges: flowEdges.value,
	};

	updateField('data', JSON.stringify(flowData));
}, { deep: true });

// Only fit view on initial load, not when nodes change
// watch(flowNodes, (newNodes) => {
// 	if (newNodes.length > 0) {
// 		// Use nextTick to ensure DOM is updated
// 		nextTick(() => {
// 			fitView({ padding: 0.1, includeHiddenNodes: false });
// 		});
// 	}
// }, { deep: true });

function updateField(fieldKey: string, value: any) {
	// Prevent field updates during save to avoid triggering hasEdits after save completes
	if (props.saving) return;
	
	const newEdits = { ...props.edits };
	newEdits[fieldKey] = value;
	emit('update:edits', newEdits);
}

function saveFlow() {
	// Clear local edits immediately to prevent navigation warning
	emit('update:edits', {});
	emit('save');
}

// Handle custom header events
function handleUpdateFlowName(name: string) {
	updateField('name', name);
}

function handleModeChange(newMode: 'edit' | 'view') {
	emit('update:mode', newMode);
}

// Follow mode functionality
function toggleFollowMode(enabled: boolean) {
	followMode.value = enabled;
	
	if (enabled) {
		// If no node is focused, focus on the first node
		if (!focusedNodeId.value && flowNodes.value.length > 0) {
			const firstNode = flowNodes.value[0];
			if (firstNode?.id) {
				focusOnNode(firstNode.id);
			}
		} else if (focusedNodeId.value) {
			// Re-focus on current node to zoom in
			focusOnNode(focusedNodeId.value);
		}
	} else {
		// Remove focused class from all nodes when follow mode is disabled
		flowNodes.value.forEach(n => {
			if (n.class && typeof n.class === 'string') {
				n.class = n.class.replace(/\s*(focused|decision-focused)\s*/g, ' ').trim();
			}
		});
		focusedNodeId.value = null;
	}
}

function focusOnNode(nodeId: string) {
	const node = flowNodes.value.find(n => n.id === nodeId);
	if (!node) return;
	
	focusedNodeId.value = nodeId;
	
	// Remove focused class from all nodes
	flowNodes.value.forEach(n => {
		if (n.class && typeof n.class === 'string') {
			n.class = n.class.replace(/\s*(focused|decision-focused)\s*/g, ' ').trim();
		}
	});
	
	// Add focused class to the target node
	const targetNode = flowNodes.value.find(n => n.id === nodeId);
	if (targetNode) {
		const currentClass = typeof targetNode.class === 'string' ? targetNode.class : '';
		// Add both focused class and type-specific class for styling
		const focusClass = targetNode.type === 'decision' ? ' focused decision-focused' : ' focused';
		targetNode.class = (currentClass + focusClass).trim();
	}
	
	// Move the viewport to the node with smooth animation
	fitView({
		nodes: [nodeId],
		duration: 400,
		padding: 0.3,
		maxZoom: 1.5,
		minZoom: 1.2
	});
}

// Get connected nodes based on direction
function getConnectedNode(nodeId: string, direction: 'up' | 'down' | 'left' | 'right'): string | null {
	const edges = flowEdges.value;
	const currentNode = flowNodes.value.find(n => n.id === nodeId);
	if (!currentNode) return null;
	
	// Find edges connected to this node
	const connectedEdges = edges.filter(edge => 
		edge.source === nodeId || edge.target === nodeId
	);
	
	// For simplicity, we'll use a basic approach:
	// up/down: follow output/input connections
	// left/right: find nodes to the left/right based on position
	
	if (direction === 'down') {
		// Follow outgoing connections (this node is source)
		const outgoingEdge = connectedEdges.find(edge => edge.source === nodeId);
		return outgoingEdge?.target || null;
	}
	
	if (direction === 'up') {
		// Follow incoming connections (this node is target)
		const incomingEdge = connectedEdges.find(edge => edge.target === nodeId);
		return incomingEdge?.source || null;
	}
	
	// For left/right, find nearest node in that direction
	const allNodes = flowNodes.value.filter(n => n && n.id !== nodeId);
	const currentPos = currentNode.position;
	
	let targetNodes = allNodes;
	
	if (direction === 'left') {
		targetNodes = allNodes.filter(n => n && n.position && n.position.x < currentPos.x);
	} else if (direction === 'right') {
		targetNodes = allNodes.filter(n => n && n.position && n.position.x > currentPos.x);
	}
	
	// Find the closest node
	if (targetNodes.length === 0) return null;
	
	let closest = targetNodes[0];
	if (!closest || !closest.position) return null;
	
	for (let i = 1; i < targetNodes.length; i++) {
		const node = targetNodes[i];
		if (!node || !node.position) continue;
		
		const closestDist = Math.sqrt(
			Math.pow(currentPos.x - closest.position.x, 2) + 
			Math.pow(currentPos.y - closest.position.y, 2)
		);
		const nodeDist = Math.sqrt(
			Math.pow(currentPos.x - node.position.x, 2) + 
			Math.pow(currentPos.y - node.position.y, 2)
		);
		if (nodeDist < closestDist) {
			closest = node;
		}
	}
	
	return closest?.id || null;
}

// Navigate between nodes using arrow keys
function navigateNode(direction: 'up' | 'down' | 'left' | 'right') {
	if (!followMode.value || !focusedNodeId.value) return;
	
	const nextNodeId = getConnectedNode(focusedNodeId.value, direction);
	if (nextNodeId) {
		focusOnNode(nextNodeId);
	}
}

// Handle keyboard navigation
function handleKeyDown(event: KeyboardEvent) {
	if (!followMode.value) return;
	
	// Prevent default behavior for arrow keys
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
}

// Node palette drag and drop
function onDragStart(event: DragEvent, nodeType: any) {
	if (event.dataTransfer) {
		event.dataTransfer.setData('application/vueflow', JSON.stringify(nodeType));
		event.dataTransfer.effectAllowed = 'move';
	}
}

function onDragOver(event: DragEvent) {
	if (!isEditMode.value) return;
	
	event.preventDefault();

	if (event.dataTransfer) {
		event.dataTransfer.dropEffect = 'move';
	}

	// Add visual feedback for drop zone
	const canvasElement = document.querySelector('.canvas-container') as HTMLElement;
	if (canvasElement) {
		canvasElement.classList.add('drag-over');
	}
}

function onDragLeave(event: DragEvent) {
	if (!isEditMode.value) return;
	
	// Remove visual feedback when leaving the drop zone
	const canvasElement = document.querySelector('.canvas-container') as HTMLElement;
	if (canvasElement && !canvasElement.contains(event.relatedTarget as HTMLElement)) {
		canvasElement.classList.remove('drag-over');
	}
}

function onDrop(event: DragEvent) {
	if (!isEditMode.value) return;
	
	const data = event.dataTransfer?.getData('application/vueflow');

	// Remove visual feedback
	const canvasElement = document.querySelector('.canvas-container') as HTMLElement;
	if (canvasElement) {
		canvasElement.classList.remove('drag-over');
	}

	if (data) {
		const nodeType = JSON.parse(data);

		// Get the canvas container element for proper positioning
		const vueFlowElement = document.querySelector('.canvas-container .vue-flow') as HTMLElement;
		if (!vueFlowElement) return;

		const canvasBounds = vueFlowElement.getBoundingClientRect();

		// Convert screen coordinates to flow coordinates
		const position = project({
			x: event.clientX - canvasBounds.left,
			y: event.clientY - canvasBounds.top
		});

		const newNode: Node = {
			id: `${nodeType.type}-${Date.now()}`,
			type: nodeType.type,
			position,
			label: `${nodeType.label} Node`, // Vue Flow expects label at root level
			data: {
				label: `${nodeType.label} Node`, // Also in data for custom nodes
				description: '',
				...(nodeType.subtype && { subtype: nodeType.subtype }), // Add subtype if present
				...(nodeType.subtype === 'form' && { targetCollection: '' }), // Initialize targetCollection for form nodes
			},
		};

		flowNodes.value.push(newNode);
	}
}

// Node selection and editing
function onNodeClick(event: { node: Node }) {
	selectedNode.value = event.node;
}

function onEdgeClick(_event: any) {
	selectedNode.value = null;
}

function updateNodeData() {
	// Trigger reactivity
	flowNodes.value = [...flowNodes.value];
}

function updateProcessSubtype(subtype: 'task' | 'form') {
	if (selectedNode.value && selectedNode.value.type === 'process') {
		selectedNode.value.data.subtype = subtype;
		if (subtype === 'form' && !selectedNode.value.data.targetCollection) {
			selectedNode.value.data.targetCollection = '';
		}
		updateNodeData();
	}
}

function updateFormCollection(collectionName: string) {
	if (selectedNode.value && selectedNode.value.type === 'process' && selectedNode.value.data.subtype === 'form') {
		selectedNode.value.data.targetCollection = collectionName;
		updateNodeData();
	}
}

function updateOffPageTarget(workflowId: string) {
	if (selectedNode.value && selectedNode.value.type === 'offpage') {
		selectedNode.value.data.targetWorkflowId = workflowId;
		updateNodeData();
		
		// Save the changes
		updateField('data', {
			nodes: flowNodes.value,
			edges: flowEdges.value,
		});
	}
}

function deleteSelectedNode() {
	if (selectedNode.value) {
		const nodeId = selectedNode.value.id;
		flowNodes.value = flowNodes.value.filter((node: Node) => node.id !== nodeId);

		flowEdges.value = flowEdges.value.filter((edge: Edge) =>
			edge.source !== nodeId && edge.target !== nodeId
		);

		selectedNode.value = null;
	}
}

// Edge connections
function onConnect(connection: Connection) {
	const newEdge: Edge = {
		id: `edge-${Date.now()}`,
		type: 'step',
		animated: true,
		...connection,
	};

	// Use Vue Flow's addEdges action instead of direct array mutation
	addEdges([newEdge]);

	// Save the changes to the field data after a short delay to ensure Vue Flow has updated
	nextTick(() => {
		updateField('data', {
			nodes: flowNodes.value,
			edges: flowEdges.value,
		});
	});
}

function onEdgeUpdate(event: EdgeUpdateEvent) {
	console.log('onEdgeUpdate called with:', event);
	const { edge: oldEdge, connection: newConnection } = event;
	
	console.log('Old edge:', oldEdge, 'New connection:', newConnection);

	// Use Vue Flow's built-in updateEdge function
	updateEdge(oldEdge, newConnection);
	
	console.log('Used Vue Flow updateEdge function');
	
	// Save the changes to the field data after a short delay to ensure Vue Flow has updated
	nextTick(() => {
		updateField('data', {
			nodes: flowNodes.value,
			edges: flowEdges.value,
		});
		
		console.log('Field data updated and saved in nextTick');
		console.log('Current edges:', flowEdges.value);
	});
