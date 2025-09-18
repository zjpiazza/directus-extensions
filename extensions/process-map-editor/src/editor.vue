<template>
	<div class="process-map-container" :class="{ 'custom-header-active': true }">
		<!-- Main Canvas Area -->
		<div class="canvas-container">
			<!-- Loading State -->
			<div v-if="isInitializing" class="loading-overlay">
				<div class="loading-content">
					<v-icon name="hourglass_empty" class="loading-spinner" />
					<p>Initializing Process Map...</p>
				</div>
			</div>
			
			<!-- Vue Flow Canvas - Only show when fully initialized -->
			<VueFlow
				v-else
				v-model:nodes="flowNodes"
				v-model:edges="flowEdges"
				:nodes-draggable="isEditMode"
				:nodes-connectable="isEditMode"
				:edges-updatable="isEditMode"
				snap-to-grid
				:snap-grid="[20, 20]"
				:zoom-on-scroll="isEditMode"
				:zoom-on-pinch="isEditMode"
				:zoom-on-double-click="false"
				:pan-on-scroll="false"
				:pan-on-scroll-mode="PanOnScrollMode.Free"
				:pan-on-drag="isEditMode"
				:min-zoom="0.1"
				:max-zoom="4"
				:fit-view-on-init="true"
				:default-edge-options="{ type: 'step', animated: true }"
				:class="['vue-flow-canvas', `zoom-level-${Math.round(currentZoom * 10)}`]"
				@nodes-initialized="onNodesInitialized"
				@move="onViewportMove"
			>
				<!-- Custom Node Templates -->
				<template #node-phase="nodeProps">
					<PhaseNode v-bind="nodeProps" />
				</template>
				<template #node-decision="nodeProps">
					<DecisionNode v-bind="nodeProps" />
				</template>

				<!-- Background -->
				<Background pattern="dots" :gap="20" :size="1" color="var(--theme--border-color)" />
				
				<!-- Custom SVG separator line overlay -->
				<div class="separator-overlay">
					<svg class="separator-line-svg" width="100%" height="100%" viewBox="0 0 1200 800">
						<!-- Vertical separator line positioned between Evaluate and Provide Services phases -->
						<!-- <line 
							x1="120" y1="0" 
							x2="120" y2="800" 
							stroke="#7c3aed" 
							stroke-width="8" 
							stroke-linecap="round"
						/> -->
						<!-- Text label for the separator -->
						<!-- <text 
							x="277" 
							y="400" 
							fill="#374151" 
							font-size="14" 
							font-weight="600" 
							letter-spacing="0.5px"
							text-anchor="middle"
							transform="rotate(-90, 277, 400)"
							style="cursor: pointer;"
							@click="editSeparatorText"
						>
							{{ separatorText }}
						</text> -->
					</svg>
				</div>

				<!-- Controls - Hide the default controls -->
				<Controls :show-zoom="false" :show-fit-view="false" :show-interactive="false">
					<!-- We'll move all functionality to our custom cluster -->
				</Controls>

				<!-- Custom Control Cluster - Compact Icon Stack -->
				<div 
					class="control-cluster"
					@mouseenter="isControlsExpanded = true"
					@mouseleave="isControlsExpanded = false"
				>
					<div class="control-stack">
						<!-- Expanded icons (appear above gear when hovered) -->
						<div v-if="isControlsExpanded" class="expanded-icons">
							<button @click="freezeCurrentState" :disabled="isSaving" class="control-icon save-icon" title="Save Process Map">
								<v-icon :name="isSaving ? 'hourglass_empty' : 'save'" />
							</button>
							<button @click="isEditMode = !isEditMode" class="control-icon edit-mode-icon" :title="isEditMode ? 'Switch to View Mode' : 'Switch to Edit Mode'">
								<v-icon :name="isEditMode ? 'visibility' : 'edit'" />
							</button>
							<button @click="fitView" class="control-icon" title="Fit View">
								<v-icon name="center_focus_strong" />
							</button>
							<button @click="resetToDefaultLayout" :disabled="!isEditMode" class="control-icon" :title="isEditMode ? 'Reset Layout' : 'Reset Layout (Edit Mode Only)'">
								<v-icon name="restart_alt" />
							</button>
							<button @click="zoomOut" :disabled="!isEditMode" class="control-icon" :title="isEditMode ? 'Zoom Out' : 'Zoom Out (Edit Mode Only)'">
								<v-icon name="remove" />
							</button>
							<button @click="zoomIn" :disabled="!isEditMode" class="control-icon" :title="isEditMode ? 'Zoom In' : 'Zoom In (Edit Mode Only)'">
								<v-icon name="add" />
							</button>
						</div>
						
						<!-- Always visible gear icon -->
						<div class="gear-icon">
							<v-icon name="settings" />
						</div>
					</div>
				</div>

				<!-- Program Selector - Top Right -->
				<div class="program-selector-overlay">
					<div class="program-selector-compact">
						<label>Program:</label>
						<select v-model="selectedProgram" class="program-select" @change="onProgramChange($event.target.value)">
							<option value="">Select Program</option>
							<option 
								v-for="program in programs" 
								:key="program.id" 
								:value="program.id"
							>
								{{ program.name }}
							</option>
						</select>
					</div>
				</div>
			</VueFlow>
		</div>

		<!-- Swim Lanes Section -->
		<div class="swim-lanes-container">
			<div v-for="phase in phases" :key="phase.id" class="swim-lane">
				<div class="swim-lane-header" :style="{ backgroundColor: phase.color }">
					<h3>{{ phase.title }}</h3>
					<span v-if="isEditMode">
						<!-- Add Workflow Button -->
						<button 
							@click="openAddWorkflowModal(phase.id)"
							class="add-workflow-btn"
						>
							<v-icon name="add" size="small" />
						</button>
					</span>
				</div>
				<div class="swim-lane-content">
					<div class="workflow-management">
						<!-- Draggable Workflow Items -->
						<draggable
							v-model="phase.workflows"
							class="workflow-items"
							group="workflows"
							@change="onWorkflowReorder(phase.id, $event)"
							item-key="id"
							:animation="200"
							ghost-class="workflow-ghost"
							chosen-class="workflow-chosen"
							drag-class="workflow-drag"
							:disabled="!isEditMode"
						>
							<template #item="{ element: workflow }">
								<div class="workflow-item-container">
									<div
										class="workflow-item"
										@click="openWorkflow(workflow.workflowId || workflow.id)"
										v-if="workflow.workflowId || workflow.id"
									>
									<div class="workflow-item-content">
										<v-icon v-if="isEditMode" name="drag_indicator" class="drag-handle" size="small" />
										<v-icon name="description" size="small" />
										<span class="workflow-title">{{ workflow.title }}</span>
									</div>
										<button
											v-if="isEditMode"
											@click.stop="removeWorkflow(phase.id, workflow.id)"
											class="remove-workflow-btn"
											title="Remove Workflow"
										>
											<v-icon name="close" size="small" />
										</button>
									</div>
								</div>
							</template>
						</draggable>
					</div>
				</div>
			</div>
		</div>

		<!-- Add Workflow Modal -->
		<div v-if="showAddWorkflowModal" class="modal-overlay" @click="closeAddWorkflowModal">
			<div class="modal-content" @click.stop>
				<div class="modal-header">
					<h3>Add Workflow to {{ getPhaseTitle(selectedPhaseId) }}</h3>
					<button @click="closeAddWorkflowModal" class="modal-close-btn">
						<v-icon name="close" />
					</button>
				</div>
				<div class="modal-body">
					<div class="form-field">
						<label>Select Workflow:</label>
						<select v-model="selectedWorkflowId" class="workflow-select">
							<option value="">Choose a workflow</option>
							<option 
								v-for="workflow in availableWorkflows" 
								:key="workflow.id" 
								:value="workflow.id"
							>
								{{ workflow.name }}
							</option>
						</select>
					</div>
					<div class="form-field">
						<label>Custom Label (optional):</label>
						<v-input
							v-model="customWorkflowLabel"
							placeholder="Enter custom label or leave empty to use workflow name"
						/>
					</div>
				</div>
				<div class="modal-footer">
					<button @click="closeAddWorkflowModal" class="btn-secondary">
						Cancel
					</button>
					<button 
						@click="addWorkflowToPhase" 
						:disabled="!selectedWorkflowId"
						class="btn-primary"
					>
						Add Workflow
					</button>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed, nextTick } from 'vue';
import { VueFlow, PanOnScrollMode, useVueFlow } from '@vue-flow/core';
import { Background } from '@vue-flow/background';
import { Controls } from '@vue-flow/controls';
import type { Node, Edge } from '@vue-flow/core';
import draggable from 'vuedraggable';

import PhaseNode from './components/PhaseNode.vue';
import DecisionNode from './components/DecisionNode.vue';
import CustomHeader from './components/CustomHeader.vue';
import { useApi } from '@directus/extensions-sdk';

// Define props that match what Directus passes to editors
interface Props {
	collection: string;
	primaryKey?: string | number | null;
	item?: Record<string, any> | null;
	initialValues?: Record<string, any>;
	loading?: boolean;
	disabled?: boolean;
	// Core Directus interface props
	value?: Record<string, any>;
	field?: string;
	width?: string;
	type?: string;
	// Editor-specific props
	isNew?: boolean;
	edits?: Record<string, any>;
	fields?: any[];
	saving?: boolean;
	validationErrors?: any[];
	collectionInfo?: any;
	permissions?: any;
}

const props = withDefaults(defineProps<Props>(), {
	item: () => ({}),
	initialValues: () => ({}),
	loading: false,
	disabled: false,
	value: () => ({}),
});

// Emit the correct Directus interface events
const emit = defineEmits<{
	input: [value: Record<string, any>];
	'update:edits': [value: Record<string, any>];
	save: [];
	refresh: [];
	delete: [];
	archive: [];
	'save-as-copy': [];
}>();

interface WorkflowItem {
	id: string;
	title: string;
	workflowId?: string;
	workflowName?: string;
}

interface Phase {
	id: string;
	title: string;
	color: string;
	workflows: WorkflowItem[];
}

// Custom header logic
const shouldUseCustomHeader = computed(() => {
	const customHeader = (props.collectionInfo?.meta as any)?.custom_header_component;
	return !!customHeader && customHeader !== null;
});

const customHeaderName = computed(() => {
	return (props.collectionInfo?.meta as any)?.custom_header_component || 'custom-header-basic';
});

const selectedProgramName = computed(() => {
	if (!selectedProgram.value) return '';
	const program = programs.value.find(p => p.id === selectedProgram.value);
	return program?.name || '';
});



const title = computed(() => {
	return props.isNew 
		? `Creating ${props.collectionInfo?.name || props.collection}` 
		: `Editing ${props.collectionInfo?.name || props.collection}`;
});

// API composable for fetching programs
const api = useApi();

// Programs data
const programs = ref<Array<{ id: string | number; name: string }>>([]);
const selectedProgram = ref<string | number | null>(null);

// Workflow links data
const workflowLinks = ref<Array<any>>([]);
// Map program ID -> { phaseId -> workflows[] }
const programWorkflowLinks = ref<Record<string, Record<string, any[]>>>({});

// Workflow management
const showAddWorkflowModal = ref(false);
const selectedPhaseId = ref<string | null>(null);
const selectedWorkflowId = ref<string | null>(null);
const customWorkflowLabel = ref('');
const availableWorkflows = ref<Array<{ id: string; name: string }>>([]);

// Separator text state
const separatorText = ref('SIGNED SERVICE PLAN')
const { getViewport, setViewport, onInit } = useVueFlow();
const currentZoom = ref(1);
const isControlsExpanded = ref(false);
const isEditMode = ref(false);
const isInitializing = ref(true); // Add loading state
const viewportScale = computed(() => {
	// Create a responsive scale factor based on viewport zoom and screen size
	const baseScale = Math.min(window.innerWidth / 1200, window.innerHeight / 800);
	return Math.max(0.5, Math.min(2, baseScale * currentZoom.value));
});

// Watch for zoom changes and update node scaling
watch(() => getViewport(), (viewport) => {
	if (viewport) {
		currentZoom.value = viewport.zoom;
	}
}, { deep: true });

onInit(() => {
	// Initialize zoom tracking
	const viewport = getViewport();
	if (viewport) {
		currentZoom.value = viewport.zoom;
	}
});

// Freeze/Save viewport and node positions
const isSaving = ref(false);

async function freezeCurrentState() {
	try {
		isSaving.value = true;
		
		// Get current viewport state
		const viewport = getViewport();
		
		// Prepare the complete state data
		// Ensure current phases are synced into program map before save
		syncProgramFromPhases();
		const completeState = {
			nodes: flowNodes.value.map(node => ({
				id: node.id,
				position: { ...node.position },
				type: node.type,
				data: { ...node.data }
			})),
			edges: flowEdges.value.map(edge => ({
				id: edge.id,
				source: edge.source,
				target: edge.target,
				type: edge.type,
				label: edge.label,
				sourceHandle: edge.sourceHandle,
				targetHandle: edge.targetHandle,
				markerEnd: edge.markerEnd,
				animated: edge.animated,
				style: edge.style,
				// Preserve any other edge properties
				...edge
			})),
			phases: phases.value,
			selectedProgram: selectedProgram.value,
			separatorText: separatorText.value,
			// Store workflow links grouped by phase
			workflowLinks: phases.value.reduce((acc, phase) => {
				acc[phase.id] = phase.workflows || [];
				return acc;
			}, {} as Record<string, any[]>),
			// Also persist per-program mappings for fast switching
			programWorkflowLinks: programWorkflowLinks.value,
			viewport: {
				x: viewport.x,
				y: viewport.y,
				zoom: viewport.zoom
			}
		};

		// Build the patch payload - always save to "state" field
		const patchData = {
			state: completeState
		};

		// For singleton collections, use the singleton endpoint
		const endpoint = `/items/${props.collection}`;

		// Make the PATCH request to singleton
		await api.patch(endpoint, patchData);

		// Also emit the input event to keep Directus form in sync
		emit('input', completeState);

		console.log('Process map state saved successfully via PATCH');
		
	} catch (error) {
		console.error('Failed to save process map state:', error);
	} finally {
		isSaving.value = false;
	}
}

// Load saved state if it exists
async function loadSavedState() {
	try {
		console.log('Loading saved state...');
		console.log('Props value:', props.value);
		console.log('Props item:', props.item);
		
		// Load from props.value (Directus standard)
		if (props.value && Object.keys(props.value).length > 0) {
			const savedData = props.value;
			console.log('Loading from props.value:', savedData);
			
			if (savedData.nodes) {
				console.log('Restoring saved nodes:', savedData.nodes);
				flowNodes.value = savedData.nodes;
			}
			if (savedData.edges) {
				console.log('Restoring saved edges:', savedData.edges);
				flowEdges.value = savedData.edges;
			}
			if (savedData.selectedProgram) {
				selectedProgram.value = savedData.selectedProgram;
			}
			if (savedData.separatorText) {
				separatorText.value = savedData.separatorText;
			}
			
			// Load workflow links from saved state
			if (savedData.programWorkflowLinks) {
				programWorkflowLinks.value = savedData.programWorkflowLinks;
				applyPhasesForCurrentProgram();
			} else if (savedData.workflowLinks) {
				// Backward compatibility: single set of workflow links not per program
				programWorkflowLinks.value[getProgramKey(savedData.selectedProgram)] = savedData.workflowLinks;
				applyPhasesForCurrentProgram();
			} else if (savedData.phases) {
				// Backward compatibility: phases array
				phases.value = savedData.phases;
				syncProgramFromPhases();
			} else {
				// Initialize with default phases if no saved data
				initializeDefaultPhases();
				syncProgramFromPhases();
			}
			
			if (savedData.viewport) {
				setTimeout(() => {
					setViewport(savedData.viewport);
				}, 100);
			}
			console.log('Saved state loaded from props.value');
			return;
		}

		// Fallback: try to load from item data - always look for "state" field
		if (props.item && Object.keys(props.item).length > 0) {
			const savedData = props.item.state;
			console.log('Loading from item.state:', savedData);
			
			if (savedData && typeof savedData === 'object') {
				if (savedData.nodes) {
					console.log('Restoring saved nodes from item:', savedData.nodes);
					flowNodes.value = savedData.nodes;
				}
				if (savedData.edges) {
					console.log('Restoring saved edges from item:', savedData.edges);
					flowEdges.value = savedData.edges;
				}
				if (savedData.selectedProgram) {
					selectedProgram.value = savedData.selectedProgram;
				}
				if (savedData.separatorText) {
					separatorText.value = savedData.separatorText;
				}
				
				// Load workflow links from saved state
				if (savedData.programWorkflowLinks) {
					programWorkflowLinks.value = savedData.programWorkflowLinks;
					applyPhasesForCurrentProgram();
				} else if (savedData.workflowLinks) {
					// Backward compatibility: single set of workflow links not per program
					programWorkflowLinks.value[getProgramKey(savedData.selectedProgram)] = savedData.workflowLinks;
					applyPhasesForCurrentProgram();
				} else if (savedData.phases) {
					phases.value = savedData.phases;
					syncProgramFromPhases();
				} else {
					initializeDefaultPhases();
					syncProgramFromPhases();
				}
				
				if (savedData.viewport) {
					setTimeout(() => {
						setViewport(savedData.viewport);
					}, 100);
				}
				console.log('Saved state loaded from item data');
			} else {
				console.log('No saved state found, initializing defaults');
				initializeDefaultPhases();
			}
		} else {
			console.log('No saved state found, initializing defaults');
			initializeDefaultPhases();
		}
	} catch (error) {
		console.error('Failed to load saved state:', error);
		initializeDefaultPhases();
	}
}

// Function to fetch programs from the collection
async function fetchPrograms() {
	try {
		const response = await api.get('/items/programs', {
			params: {
				fields: ['id', 'name'],
				limit: -1, // Get all programs
			},
		});
		programs.value = response.data.data || [];
		console.log('Fetched programs:', programs.value);
		
		// Set default program if available
		if (programs.value.length > 0 && !selectedProgram.value && programs.value[0]) {
			selectedProgram.value = programs.value[0].id;
			console.log('Set default program:', selectedProgram.value, 'Program name:', programs.value[0].name);
		}
	} catch (error) {
		console.error('Error fetching programs:', error);
		programs.value = [];
	}
}

// Keep UI in sync when selected program changes externally (e.g., from props)
watch(() => selectedProgram.value, () => {
	applyPhasesForCurrentProgram();
});

// Handle program selection change
async function onProgramChange(programId: string | number) {
	// Save current program state into map
	syncProgramFromPhases();
	// Switch program
	selectedProgram.value = programId;
	console.log('Selected program:', programId);
	// Apply phases for new program
	applyPhasesForCurrentProgram();
	await nextTick();
	// Persist selection + current state snapshot
	await freezeCurrentState();
}

// Framework phases data - will be initialized dynamically
const phases = ref<Phase[]>([]);

// Vue Flow nodes and edges
const flowNodes = ref<Node[]>([
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
]);

const flowEdges = ref<Edge[]>([
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
]);

// Watch for value changes (Directus standard)
watch(() => props.value, (newVal) => {
	if (newVal && typeof newVal === 'object') {
		if (newVal.nodes) flowNodes.value = newVal.nodes || [];
		if (newVal.edges) flowEdges.value = newVal.edges || [];
		if (newVal.phases) phases.value = newVal.phases || [];
		if (newVal.selectedProgram) selectedProgram.value = newVal.selectedProgram;
		if (newVal.separatorText) separatorText.value = newVal.separatorText;
		if (newVal.viewport) {
			setTimeout(() => {
				setViewport(newVal.viewport);
			}, 100);
		}
	}
}, { deep: true, immediate: true });

// Draft state representing current editor data
const draftState = computed(() => ({
	nodes: flowNodes.value,
	edges: flowEdges.value,
	phases: phases.value,
	selectedProgram: selectedProgram.value,
	separatorText: separatorText.value,
	viewport: getViewport() || { x: 0, y: 0, zoom: 1 }
}));

// Emit input event when draft state changes (Directus standard)
watch(draftState, (val) => {
	if (props.disabled) return; // don't emit if component disabled
	
	// Emit the input event for Directus form integration
	emit('input', val);
}, { deep: true });

// Methods
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

function openWorkflow(workflowId: string) {
	// Safety check for undefined workflowId
	if (!workflowId) {
		console.warn('Cannot open workflow: workflowId is undefined');
		return;
	}
	// Open the specific workflow in a new tab
	const workflowUrl = `/admin/content/workflows/${workflowId}`;
	window.open(workflowUrl, '_blank');
}

// Workflow Management Functions
async function fetchAvailableWorkflows() {
	try {
		console.log('Fetching available workflows...');
		const response = await api.get('/items/workflows', {
			params: {
				fields: ['id', 'name'],
				limit: -1,
			},
		});
		console.log('Workflows response:', response.data);
		availableWorkflows.value = response.data.data || [];
		console.log('Available workflows:', availableWorkflows.value);
	} catch (error) {
		console.error('Error fetching workflows:', error);
		availableWorkflows.value = [];
	}
}

function openAddWorkflowModal(phaseId: string) {
	selectedPhaseId.value = phaseId;
	selectedWorkflowId.value = null;
	customWorkflowLabel.value = '';
	showAddWorkflowModal.value = true;
}

function closeAddWorkflowModal() {
	showAddWorkflowModal.value = false;
	selectedPhaseId.value = null;
	selectedWorkflowId.value = null;
	customWorkflowLabel.value = '';
}

function getPhaseTitle(phaseId: string | null): string {
	const phase = phases.value.find(p => p.id === phaseId);
	return phase?.title || 'Unknown Phase';
}

function generateWorkflowLinkId(): string {
	return 'wl-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

async function addWorkflowToPhase() {
	console.log('Adding workflow to phase...');
	console.log('Selected phase ID:', selectedPhaseId.value);
	console.log('Selected workflow ID:', selectedWorkflowId.value);
	
	if (!selectedPhaseId.value || !selectedWorkflowId.value) return;
	
	const selectedWorkflow = availableWorkflows.value.find(w => w.id === selectedWorkflowId.value);
	if (!selectedWorkflow) return;

	const phaseIndex = phases.value.findIndex(p => p.id === selectedPhaseId.value);
	if (phaseIndex === -1) return;

	const phase = phases.value[phaseIndex];
	console.log('Found phase:', phase);
	console.log('Current workflows in phase:', phase.workflows);

	// Create new workflow link
	const newWorkflowLink = {
		id: generateWorkflowLinkId(),
		workflowId: selectedWorkflowId.value,
		title: customWorkflowLabel.value || selectedWorkflow.name,
		order: phase.workflows.length
	};

	console.log('New workflow link:', newWorkflowLink);

	// Create new array to trigger reactivity
	const updatedWorkflows = [...phase.workflows, newWorkflowLink];
	
	// Update the phase with new workflows array
	phases.value[phaseIndex] = {
		...phase,
		workflows: updatedWorkflows
	};
	
	console.log('Updated workflows in phase:', phases.value[phaseIndex].workflows);
	
	// Force Vue to re-render by triggering reactivity
	await nextTick();
	
	// Keep per-program map in sync
	syncProgramFromPhases();
	// Save changes
	await freezeCurrentState();
	
	closeAddWorkflowModal();
}

async function removeWorkflow(phaseId: string, workflowLinkId: string) {
	const phase = phases.value.find(p => p.id === phaseId);
	if (!phase) return;

	// Remove workflow from phase
	const index = phase.workflows.findIndex(w => w.id === workflowLinkId);
	if (index !== -1) {
		phase.workflows.splice(index, 1);
		
		// Update order for remaining workflows
		phase.workflows.forEach((workflow, idx) => {
			workflow.order = idx;
		});
		
		// Keep per-program map in sync
		syncProgramFromPhases();
	// Keep per-program map in sync
	syncProgramFromPhases();
	// Save changes
	await freezeCurrentState();
	}
}

async function onWorkflowReorder(phaseId: string, event: any) {
	const phase = phases.value.find(p => p.id === phaseId);
	if (!phase) return;

	// Update order for all workflows in the phase
	phase.workflows.forEach((workflow, index) => {
		workflow.order = index;
	});
	
	// Save changes
	await freezeCurrentState();
}

// Helper functions for state management
function loadWorkflowLinksFromState(workflowLinks: Record<string, any[]>) {
	phases.value = [
		{
			id: 'request_service',
			title: 'REQUEST SERVICE/REPORT',
			color: 'var(--theme--primary, #7c3aed)',
			workflows: workflowLinks.request_service || []
		},
		{
			id: 'evaluate_service',
			title: 'EVALUATE SERVICE',
			color: 'var(--theme--primary, #7c3aed)',
			workflows: workflowLinks.evaluate_service || []
		},
		{
			id: 'provide_services',
			title: 'PROVIDE SERVICES AND REEVALUATE SERVICES',
			color: 'var(--theme--primary, #7c3aed)',
			workflows: workflowLinks.provide_services || []
		},
		{
			id: 'end_of_service',
			title: 'END OF SERVICES',
			color: 'var(--theme--primary, #7c3aed)',
			workflows: workflowLinks.end_of_service || []
		}
	];
}

function getProgramKey(id: string | number | null | undefined): string {
	return id !== null && id !== undefined && id !== '' ? String(id) : 'default';
}

function phasesToLinksMap(phasesArr: Phase[]): Record<string, any[]> {
	const map: Record<string, any[]> = {};
	for (const phase of phasesArr) {
		map[phase.id] = Array.isArray(phase.workflows) ? [...phase.workflows] : [];
	}
	// Ensure all known keys exist
	map.request_service = map.request_service || [];
	map.evaluate_service = map.evaluate_service || [];
	map.provide_services = map.provide_services || [];
	map.end_of_service = map.end_of_service || [];
	return map;
}

function applyPhasesForCurrentProgram() {
	const key = getProgramKey(selectedProgram.value);
	const links = programWorkflowLinks.value[key] || {};
	loadWorkflowLinksFromState(links);
}

function syncProgramFromPhases(programId?: string | number | null) {
	const key = getProgramKey(programId ?? selectedProgram.value);
	programWorkflowLinks.value[key] = phasesToLinksMap(phases.value);
}

function initializeDefaultPhases() {
	phases.value = [
		{
			id: 'request_service',
			title: 'REQUEST SERVICE/REPORT',
			color: 'var(--theme--primary, #7c3aed)',
			workflows: []
		},
		{
			id: 'evaluate_service',
			title: 'EVALUATE SERVICE',
			color: 'var(--theme--primary, #7c3aed)',
			workflows: []
		},
		{
			id: 'provide_services',
			title: 'PROVIDE SERVICES AND REEVALUATE SERVICES',
			color: 'var(--theme--primary, #7c3aed)',
			workflows: []
		},
		{
			id: 'end_of_service',
			title: 'END OF SERVICES',
			color: 'var(--theme--primary, #7c3aed)',
			workflows: []
		}
	];
}

// Handle separator text editing
function editSeparatorText() {
	const newText = prompt('Enter separator text:', separatorText.value);
	if (newText !== null) {
		separatorText.value = newText.trim() || 'SIGNED SERVICE PLAN';
		// Save the updated state
		freezeCurrentState();
	}
}

// Vue Flow control functions
const { zoomIn, zoomOut, fitView } = useVueFlow();

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
	
	// Reset edges to original connections
	flowEdges.value = [
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
	
	// Fit view after resetting
	setTimeout(() => {
		fitView();
	}, 100);
	
	console.log('Layout reset to defaults');
}

// Initialize from props
onMounted(async () => {
	try {
		// Set initializing state
		isInitializing.value = true;
		
		// Hide the default Directus header
		const headerBar = document.querySelector('.header-bar');
		if (headerBar) {
			(headerBar as HTMLElement).style.display = 'none';
		}
		
		// Fetch programs and available workflows first
		await fetchPrograms();
		await fetchAvailableWorkflows();
		
		// Then load saved state from props or item data
		await loadSavedState();
		// After loading, ensure the current program’s phases are applied
		applyPhasesForCurrentProgram();
		
		// Debug: Log current nodes
		console.log('Current flowNodes after initialization:', flowNodes.value);
		console.log('Separator node exists:', flowNodes.value.find(n => n.type === 'separator'));
		
		// Add a small delay to ensure everything is properly initialized
		await nextTick();
		
		// Mark initialization as complete
		isInitializing.value = false;
		
		console.log('Process map initialization completed');
	} catch (error) {
		console.error('Error during initialization:', error);
		// Even on error, mark as not initializing to show the canvas
		isInitializing.value = false;
	}
});
</script>

<style scoped>
.process-map-container {
	display: flex;
	flex-direction: column;
	height: 100vh;
	background: var(--theme--background, #f8fafc);
}

.process-map-header {
	display: flex;
	align-items: center;
	padding: 1rem;
	background: var(--theme--primary, #7c3aed);
	color: var(--theme--primary-foreground, white);
}

.info-icon {
	background: rgba(255, 255, 255, 0.2);
	border-radius: 50%;
	width: 32px;
	height: 32px;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	flex-shrink: 0;
}

.header-center {
	flex: 1;
	display: flex;
	justify-content: center;
}

.header-center h2 {
	margin: 0;
	font-size: 1.5rem;
	font-weight: 600;
	text-align: center;
	white-space: nowrap;
}

.header-right {
	flex-shrink: 0;
}

.program-selector {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	font-size: 0.875rem;
}

.program-selector label {
	font-weight: 500;
	white-space: nowrap;
}

.program-selector :deep(.v-select) {
	min-width: 300px;
	background: var(--theme--background-accent, rgba(255, 255, 255, 0.1));
	border-radius: 4px;
}

.program-selector :deep(.v-select .v-input) {
	background: transparent;
	border: 1px solid var(--theme--border-color-subdued, rgba(255, 255, 255, 0.3));
	color: var(--theme--primary-foreground, white);
}

.program-selector :deep(.v-select .v-input::placeholder) {
	color: var(--theme--foreground-subdued, rgba(255, 255, 255, 0.7));
}

.info-icon {
	position: absolute;
	left: 1rem;
	top: 50%;
	transform: translateY(-50%);
	background: var(--theme--background-accent, rgba(255, 255, 255, 0.2));
	border-radius: 50%;
	width: 32px;
	height: 32px;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
}

.canvas-container {
	flex: 1;
	height: 60vh;
	position: relative;
	border-bottom: 2px solid var(--theme--border-color, #e5e7eb);
}

/* Adjust layout when custom header is active */
.custom-header-active .canvas-container {
	height: calc(100vh - 200px); /* Adjust for header height */
}

.vue-flow-canvas {
	width: 100%;
	height: 100%;
}

.swim-lanes-container {
	display: grid;
	grid-template-columns: 1fr 1fr 2fr 1fr;
	height: 40vh;
	background: var(--theme--background, white);
	border-top: 1px solid var(--theme--border-color, #e5e7eb);
}

.swim-lane {
	border-right: 1px solid var(--theme--border-color, #e5e7eb);
	display: flex;
	flex-direction: column;
}

.swim-lane:last-child {
	border-right: none;
}

.swim-lane-header {
	padding: 0.75rem;
	color: var(--theme--primary-foreground, white);
	font-weight: 600;
	text-align: center;
	font-size: 0.875rem;
	min-height: 60px;
	display: flex;
	align-items: center;
	justify-content: space-between;
	position: relative;
}

.swim-lane-header h3 {
	margin: 0;
	line-height: 1.2;
	position: absolute;
	left: 50%;
	transform: translateX(-50%);
	flex: 1;
}

.swim-lane-header span {
	margin-left: auto;
	z-index: 1;
}

.add-workflow-btn {
	background: var(--theme--background-accent, rgba(255, 255, 255, 0.2));
	border: 1px solid var(--theme--border-color-subdued, rgba(255, 255, 255, 0.3));
	border-radius: 4px;
	color: var(--theme--primary-foreground, white);
	padding: 4px;
	cursor: pointer;
	transition: all 0.2s ease;
	display: flex;
	align-items: center;
	justify-content: center;
}

.add-workflow-btn:hover {
	background: var(--theme--background-accent-hover, rgba(255, 255, 255, 0.3));
	border-color: var(--theme--border-color, rgba(255, 255, 255, 0.5));
}

.swim-lane-content {
	flex: 1;
	padding: 1rem;
	display: flex;
	flex-direction: column;
	gap: 1rem;
}

.workflow-items {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
}

.workflow-item {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	padding: 0.5rem;
	background: var(--theme--background, #f8fafc);
	border: 1px solid var(--theme--border-color, #e5e7eb);
	border-radius: 4px;
	cursor: pointer;
	font-size: 0.75rem;
	line-height: 1.2;
	transition: all 0.2s ease;
	color: var(--theme--primary, #7c3aed);
}

.workflow-item:hover {
	background: var(--theme--background-accent, #ede9fe);
	border-color: var(--theme--primary, #7c3aed);
	transform: translateY(-1px);
	box-shadow: 0 2px 4px var(--theme--primary-shadow, rgba(124, 58, 237, 0.1));
}

/* Vue Flow custom styling */
:deep(.vue-flow) {
	background: var(--theme--background, #f8fafc);
}

:deep(.vue-flow__background) {
	background: var(--theme--background, #f8fafc);
}

:deep(.vue-flow__edge-path) {
	stroke: var(--theme--foreground-subdued, #6b7280);
	stroke-width: 2;
}

:deep(.vue-flow__edge.animated .vue-flow__edge-path) {
	stroke-dasharray: 5;
	animation: dashdraw 0.5s linear infinite;
}

:deep(.vue-flow__edge-label) {
	background: var(--theme--background, white);
	padding: 2px 6px;
	border-radius: 3px;
	font-size: 11px;
	font-weight: 600;
	color: var(--theme--foreground, #374151);
}

@keyframes dashdraw {
	to {
		stroke-dashoffset: -10;
	}
}

/* Responsive zoom classes for optimal viewing at different zoom levels */
.vue-flow.zoom-small :deep(.vue-flow__node) {
	transform-origin: center;
}

.vue-flow.zoom-medium :deep(.vue-flow__node) {
	transform-origin: center;
}

.vue-flow.zoom-large :deep(.vue-flow__node) {
	transform-origin: center;
}

/* Custom freeze button styling to match other controls */
:deep(.vue-flow__controls-button) {
	background: transparent;
	border: none;
	color: var(--theme--foreground);
	width: 32px;
	height: 32px;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	transition: all 0.2s ease;
	border-radius: var(--theme--border-radius);
	margin: 2px;
}

/* Style all Vue Flow control buttons for better contrast */
:deep(.vue-flow__controls) {
	background: var(--theme--background-accent, rgba(255, 255, 255, 0.95));
	backdrop-filter: blur(8px);
	border: 1px solid var(--theme--border-color);
	border-radius: var(--theme--border-radius);
	box-shadow: 0 4px 12px var(--theme--shadow, rgba(0, 0, 0, 0.15));
}

:deep(.vue-flow__controls button) {
	background: transparent;
	border: none;
	color: var(--theme--foreground);
	width: 32px;
	height: 32px;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	transition: all 0.2s ease;
	border-radius: var(--theme--border-radius);
	margin: 2px;
}

:deep(.vue-flow__controls button:hover),
:deep(.vue-flow__controls-button:hover) {
	background: var(--theme--primary);
	color: var(--theme--primary-foreground);
	transform: scale(1.05);
}

:deep(.vue-flow__controls button svg) {
	width: 16px;
	height: 16px;
	fill: currentColor;
}

:deep(.vue-flow__controls-button:disabled) {
	opacity: 0.6;
	cursor: not-allowed;
	transform: none;
	background: transparent;
}

:deep(.vue-flow__controls-button .v-icon) {
	font-size: 16px;
}

/* Hide the default Directus header when using custom header */
:deep(.header-bar) {
	display: none !important;
}

/* Alternative selectors to ensure header is hidden */
:deep(header.header-bar) {
	display: none !important;
}

:deep(.private-view .header-bar) {
	display: none !important;
}

/* Loading Overlay */
.loading-overlay {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: var(--theme--background, #f8fafc);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 1000;
}

.loading-content {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 1rem;
	color: var(--theme--foreground-subdued);
}

.loading-spinner {
	font-size: 2rem;
	animation: spin 2s linear infinite;
}

.loading-content p {
	margin: 0;
	font-size: 0.875rem;
	font-weight: 500;
}

@keyframes spin {
	from {
		transform: rotate(0deg);
	}
	to {
		transform: rotate(360deg);
	}
}

/* Control Cluster - Compact Icon Stack */
.control-cluster {
	position: absolute;
	bottom: 20px;
	left: 20px;
	z-index: 1000;
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.control-stack {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 8px;
}

.expanded-icons {
	display: flex;
	flex-direction: column;
	gap: 8px;
	animation: slideUpFadeIn 0.3s ease forwards;
}

@keyframes slideUpFadeIn {
	from {
		opacity: 0;
		transform: translateY(20px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

.control-icon {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 44px;
	height: 44px;
	background: var(--theme--background-accent, rgba(255, 255, 255, 0.95));
	backdrop-filter: blur(8px);
	color: var(--theme--foreground);
	border: 1px solid var(--theme--border-color);
	border-radius: var(--theme--border-radius);
	cursor: pointer;
	transition: all 0.2s ease;
	box-shadow: 0 2px 8px var(--theme--shadow, rgba(0, 0, 0, 0.1));
}

.control-icon:hover {
	background: var(--theme--success, #10b981);
	color: white;
	transform: translateY(-2px) scale(1.05);
	box-shadow: 0 4px 12px var(--theme--shadow-accent, rgba(0, 0, 0, 0.15));
}

.control-icon:hover .v-icon {
	color: white;
}

.control-icon:disabled {
	opacity: 0.6;
	cursor: not-allowed;
	transform: none;
}

.control-icon .v-icon {
	font-size: 18px;
	color: inherit;
}

.save-icon {
	background: var(--theme--success, #10b981);
	color: white;
}

.save-icon:hover:not(:disabled) {
	background: var(--theme--success-accent, #059669);
}

.save-icon .v-icon {
	color: white;
}

.edit-mode-icon {
	background: var(--theme--warning, #f59e0b);
	color: white;
}

.edit-mode-icon:hover:not(:disabled) {
	background: var(--theme--warning-accent, #d97706);
}

.edit-mode-icon .v-icon {
	color: white;
}

.gear-icon {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 48px;
	height: 48px;
	background: var(--theme--background-accent, rgba(255, 255, 255, 0.95));
	backdrop-filter: blur(8px);
	color: var(--theme--foreground);
	border: 1px solid var(--theme--border-color);
	border-radius: var(--theme--border-radius);
	cursor: pointer;
	transition: all 0.2s ease;
	box-shadow: 0 2px 8px var(--theme--shadow, rgba(0, 0, 0, 0.1));
}

.gear-icon:hover {
	color: var(--theme--primary);
	transform: scale(1.1) rotate(90deg);
	box-shadow: 0 4px 12px var(--theme--shadow-accent, rgba(0, 0, 0, 0.15));
}

.gear-icon .v-icon {
	font-size: 20px;
}

/* Program Selector Overlay - Top Right */
.program-selector-overlay {
	position: absolute;
	top: 20px;
	right: 20px;
	z-index: 1000;
	background: var(--theme--background-accent, rgba(255, 255, 255, 0.95));
	backdrop-filter: blur(8px);
	border: 1px solid var(--theme--border-color);
	border-radius: var(--theme--border-radius);
	box-shadow: 0 4px 12px var(--theme--shadow-accent, rgba(0, 0, 0, 0.15));
	padding: 16px;
	min-width: 280px;
}

.program-selector-compact {
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.program-selector-compact label {
	font-size: 0.875rem;
	font-weight: 600;
	color: var(--theme--foreground);
	margin: 0;
}

.program-selector-compact :deep(.v-select) {
	width: 100%;
}

.program-selector-compact :deep(.v-input) {
	min-height: 40px;
	font-size: 0.875rem;
}

.program-select {
	padding: 0.5rem;
	border: 1px solid var(--theme--form--field--input--border-color);
	border-radius: var(--theme--border-radius);
	background: var(--theme--form--field--input--background);
	color: var(--theme--form--field--input--foreground);
	font-size: 0.875rem;
	min-height: 40px;
	width: 100%;
}

.program-select:focus {
	outline: none;
	border-color: var(--theme--primary);
}

/* Workflow Management Styles */
.workflow-management {
	display: flex;
	flex-direction: column;
	gap: 1rem;
	height: 100%;
}

.add-workflow-btn {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	padding: 0.5rem 0.75rem;
	/* background: var(--theme--primary); */
	color: var(--theme--primary-foreground);
	border: none;
	border-radius: var(--theme--border-radius);
	font-size: 0.75rem;
	font-weight: 500;
	cursor: pointer;
	transition: all 0.2s ease;
	align-self: flex-start;
}

.add-workflow-btn:hover {
	background: var(--theme--primary-accent);
	transform: translateY(-1px);
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.add-workflow-btn .v-icon {
	font-size: 14px;
}

.workflow-items {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
	min-height: 100px;
}

.workflow-item-container {
	transition: all 0.2s ease;
}

.workflow-item {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0.5rem;
	background: var(--theme--background, #f8fafc);
	border: 1px solid var(--theme--border-color, #e5e7eb);
	border-radius: 4px;
	cursor: pointer;
	font-size: 0.75rem;
	line-height: 1.2;
	transition: all 0.2s ease;
	color: var(--theme--primary, #7c3aed);
}

.workflow-item:hover {
	background: var(--theme--background-accent, #ede9fe);
	border-color: var(--theme--primary, #7c3aed);
	transform: translateY(-1px);
	box-shadow: 0 2px 4px var(--theme--primary-shadow, rgba(124, 58, 237, 0.1));
}

.workflow-item-content {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	flex: 1;
}

.drag-handle {
	cursor: grab;
	color: var(--theme--foreground-subdued, #9ca3af);
	opacity: 0.7;
}

.drag-handle:hover {
	opacity: 1;
}

.workflow-title {
	flex: 1;
}

.remove-workflow-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 20px;
	height: 20px;
	background: transparent;
	color: var(--theme--danger, #ef4444);
	border: none;
	border-radius: 50%;
	cursor: pointer;
	transition: all 0.2s ease;
	opacity: 0.7;
}

.remove-workflow-btn:hover {
	background: var(--theme--danger-background, #fef2f2);
	opacity: 1;
	transform: scale(1.1);
}

.remove-workflow-btn .v-icon {
	font-size: 12px;
}

/* VueDraggable drag states */
.workflow-ghost {
	opacity: 0.5;
	background: var(--theme--primary-background, #e0e7ff) !important;
	transform: rotate(5deg);
}

.workflow-chosen {
	opacity: 0.8;
	transform: scale(1.05);
	box-shadow: 0 4px 8px var(--theme--primary-shadow, rgba(124, 58, 237, 0.2));
}

.workflow-drag {
	opacity: 0.9;
	transform: rotate(5deg);
	z-index: 1000;
}

/* Drag and Drop States */
.workflow-ghost {
	opacity: 0.5;
	background: var(--theme--primary-background-accent, #ddd6fe) !important;
}

.workflow-chosen {
	transform: rotate(2deg);
	box-shadow: 0 4px 8px var(--theme--shadow, rgba(0, 0, 0, 0.2));
}

.workflow-drag {
	transform: rotate(5deg);
	z-index: 1000;
}

/* Modal Styles */
.modal-overlay {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: var(--theme--overlay, rgba(0, 0, 0, 0.5));
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 2000;
}

.modal-content {
	background: var(--theme--background, white);
	border-radius: var(--theme--border-radius);
	box-shadow: 0 10px 25px var(--theme--shadow-modal, rgba(0, 0, 0, 0.15));
	max-width: 500px;
	width: 90%;
	max-height: 80vh;
	overflow: hidden;
}

.modal-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 1.5rem;
	border-bottom: 1px solid var(--theme--border-color);
}

.modal-header h3 {
	margin: 0;
	font-size: 1.125rem;
	font-weight: 600;
	color: var(--theme--foreground);
}

.modal-close-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 32px;
	height: 32px;
	background: transparent;
	border: none;
	border-radius: var(--theme--border-radius);
	cursor: pointer;
	color: var(--theme--foreground-subdued);
	transition: all 0.2s ease;
}

.modal-close-btn:hover {
	background: var(--theme--background-accent);
	color: var(--theme--foreground);
}

.modal-body {
	padding: 1.5rem;
	display: flex;
	flex-direction: column;
	gap: 1rem;
}

.modal-footer {
	display: flex;
	align-items: center;
	justify-content: flex-end;
	gap: 0.75rem;
	padding: 1.5rem;
	border-top: 1px solid var(--theme--border-color);
}

.form-field {
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
}

.form-field label {
	font-size: 0.875rem;
	font-weight: 500;
	color: var(--theme--foreground);
}

.workflow-select {
	padding: 0.5rem;
	border: 1px solid var(--theme--form--field--input--border-color);
	border-radius: var(--theme--border-radius);
	background: var(--theme--form--field--input--background);
	color: var(--theme--form--field--input--foreground);
	font-size: 0.875rem;
	min-height: 40px;
}

.workflow-select:focus {
	outline: none;
	border-color: var(--theme--primary);
}

.btn-primary {
	padding: 0.5rem 1rem;
	background: var(--theme--success, #10b981);
	color: white;
	border: none;
	border-radius: var(--theme--border-radius);
	font-size: 0.875rem;
	font-weight: 500;
	cursor: pointer;
	transition: all 0.2s ease;
}

.btn-primary:hover:not(:disabled) {
	background: var(--theme--success-accent, #059669);
	transform: translateY(-1px);
	box-shadow: 0 2px 4px var(--theme--shadow, rgba(0, 0, 0, 0.1));
}

.btn-primary:disabled {
	opacity: 0.6;
	cursor: not-allowed;
	transform: none;
}

.btn-secondary {
	padding: 0.5rem 1rem;
	background: transparent;
	color: var(--theme--foreground);
	border: 1px solid var(--theme--border-color);
	border-radius: var(--theme--border-radius);
	font-size: 0.875rem;
	font-weight: 500;
	cursor: pointer;
	transition: all 0.2s ease;
}

.btn-secondary:hover {
	background: var(--theme--background-accent);
	transform: translateY(-1px);
	box-shadow: 0 2px 4px var(--theme--shadow, rgba(0, 0, 0, 0.1));
}

/* Separator Line Styles */
.separator-overlay {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	pointer-events: none;
	z-index: 1000;
}

.separator-line-svg {
	width: 100%;
	height: 100%;
	position: relative;
	z-index: 1001;
}

.separator-line-svg line {
	pointer-events: none;
}

.separator-line-svg text {
	cursor: pointer;
	transition: fill 0.2s ease;
	pointer-events: auto;
}

.separator-line-svg text:hover {
	fill: var(--theme--primary, #7c3aed);
}
</style>
