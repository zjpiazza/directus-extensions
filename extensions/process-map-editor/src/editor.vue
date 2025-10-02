<template>
	<div class="process-map-container" :class="{ 'custom-header-active': true }">
		<!-- Main Canvas Area -->
		<ProcessMapCanvas
			:is-initializing="isInitializing"
			:flow-nodes="flowNodes"
			:flow-edges="flowEdges"
			:is-edit-mode="isEditMode"
			:current-zoom="currentZoom"
			:separator-text="separatorText"
			@update:flow-nodes="flowNodes = $event"
			@update:flow-edges="flowEdges = $event"
			@nodes-initialized="onNodesInitialized"
			@viewport-move="onViewportMove"
			@edit-separator-text="editSeparatorText"
		/>

		<!-- Custom Control Cluster -->
		<ProcessMapControls
			:is-edit-mode="isEditMode"
			:is-saving="isSaving"
			@save="freezeCurrentState"
			@toggle-edit-mode="isEditMode = !isEditMode"
			@fit-view="fitView"
			@reset-layout="resetToDefaultLayout"
			@zoom-out="zoomOut"
			@zoom-in="zoomIn"
		/>

		<!-- Program Selector -->
		<ProgramSelector
			v-model="selectedProgram"
			:programs="programs"
		/>

		<!-- Swim Lanes Section -->
		<SwimLanes
			:phases="phases"
			:is-edit-mode="isEditMode"
			@add-workflow="openAddWorkflowModal"
			@remove-workflow="removeWorkflow"
			@open-workflow="openWorkflow"
			@workflow-reorder="onWorkflowReorder"
		/>

		<!-- Add Workflow Modal -->
		<WorkflowModal
			:is-visible="showAddWorkflowModal"
			:phase-title="getPhaseTitle(selectedPhaseId)"
			:available-workflows="availableWorkflows"
			@close="closeAddWorkflowModal"
			@add-workflow="addWorkflowToPhase"
		/>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed, nextTick } from 'vue';
import { useVueFlow } from '@vue-flow/core';

// Import new components
import ProcessMapCanvas from './components/ProcessMapCanvas.vue';
import ProcessMapControls from './components/ProcessMapControls.vue';
import ProgramSelector from './components/ProgramSelector.vue';
import SwimLanes from './components/SwimLanes.vue';
import WorkflowModal from './components/WorkflowModal.vue';

// Import composables
import { useProcessMapEditor } from './composables/useProcessMapEditor';

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

// Use the main composable
const {
	// State
	isInitializing,
	isEditMode,
	isSaving,
	currentZoom,
	separatorText,
	
	// Programs
	programs,
	selectedProgram,
	
	// Flow state
	flowNodes,
	flowEdges,
	phases,
	
	// Workflows
	showAddWorkflowModal,
	selectedPhaseId,
	availableWorkflows,
	
	// Methods
	freezeCurrentState,
	editSeparatorText,
	openAddWorkflowModal,
	closeAddWorkflowModal,
	addWorkflowToPhase,
	removeWorkflow,
	openWorkflow,
	onWorkflowReorder,
	getPhaseTitle,
	onNodesInitialized,
	onViewportMove,
	resetToDefaultLayout,
	
	// Vue Flow methods
	fitView,
	zoomIn,
	zoomOut,
	
	// Initialization
	initializeData
} = useProcessMapEditor(props, emit);

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

// Initialize from props
onMounted(async () => {
	console.log('onMounted: Starting initialization');
	try {
		// Set initializing state
		isInitializing.value = true;
		console.log('onMounted: isInitializing set to true');
		
		// Hide the default Directus header
		const headerBar = document.querySelector('.header-bar');
		if (headerBar) {
			(headerBar as HTMLElement).style.display = 'none';
		}
		
	// Initialize using the composable
	await initializeData();
		
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
</style>
<style>
/* Import the necessary styles for Vue Flow to work */
@import '@vue-flow/core/dist/style.css';
@import '@vue-flow/core/dist/theme-default.css';
@import '@vue-flow/controls/dist/style.css';
</style>