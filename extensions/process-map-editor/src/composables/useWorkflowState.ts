import { ref, nextTick } from 'vue';
import type { WorkflowItem, Phase } from './useProcessMapState';

export interface WorkflowData {
	id: string;
	name: string;
}

export function useWorkflowState() {
	// Workflow management state
	const showAddWorkflowModal = ref(false);
	const selectedPhaseId = ref<string | null>(null);
	const selectedWorkflowId = ref<string | null>(null);
	const customWorkflowLabel = ref('');
	const availableWorkflows = ref<WorkflowData[]>([]);

	// Modal management
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

	// Workflow management functions
	function generateWorkflowLinkId(): string {
		return 'wl-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
	}

	async function addWorkflowToPhase(
		phases: Phase[], 
		onPhasesUpdate: (phases: Phase[]) => void,
		onSave: () => Promise<void>
	) {
		console.log('Adding workflow to phase...');
		console.log('Selected phase ID:', selectedPhaseId.value);
		console.log('Selected workflow ID:', selectedWorkflowId.value);
		
		if (!selectedPhaseId.value || !selectedWorkflowId.value) return;
		
		const selectedWorkflow = availableWorkflows.value.find(w => w.id === selectedWorkflowId.value);
		if (!selectedWorkflow) return;

		const phaseIndex = phases.findIndex(p => p.id === selectedPhaseId.value);
		if (phaseIndex === -1) return;

		const phase = phases[phaseIndex];
		if (!phase) return;
		
		console.log('Found phase:', phase);
		console.log('Current workflows in phase:', phase.workflows);

		// Create new workflow link
		const newWorkflowLink: WorkflowItem = {
			id: generateWorkflowLinkId(),
			workflowId: selectedWorkflowId.value,
			title: customWorkflowLabel.value || selectedWorkflow.name,
			order: phase.workflows.length
		};

		console.log('New workflow link:', newWorkflowLink);

		// Create new array to trigger reactivity
		const updatedWorkflows = [...phase.workflows, newWorkflowLink];
		
		// Create updated phases array with explicit typing
		const updatedPhases = [...phases];
		updatedPhases[phaseIndex] = {
			id: phase.id,
			title: phase.title,
			color: phase.color,
			workflows: updatedWorkflows
		};
		
		console.log('Updated workflows in phase:', updatedPhases[phaseIndex].workflows);
		
		// Update phases through callback
		onPhasesUpdate(updatedPhases);
		
		// Force Vue to re-render by triggering reactivity
		await nextTick();
		
		// Save changes
		await onSave();
		
		closeAddWorkflowModal();
	}

	async function removeWorkflow(
		phases: Phase[], 
		phaseId: string, 
		workflowLinkId: string,
		onPhasesUpdate: (phases: Phase[]) => void,
		onSave: () => Promise<void>
	) {
		const phaseIndex = phases.findIndex(p => p.id === phaseId);
		if (phaseIndex === -1) return;

		const phase = phases[phaseIndex];
		if (!phase) return;
		
		const workflowIndex = phase.workflows.findIndex(w => w.id === workflowLinkId);
		if (workflowIndex === -1) return;

		// Remove workflow from phase
		const updatedWorkflows = [...phase.workflows];
		updatedWorkflows.splice(workflowIndex, 1);
		
		// Update order for remaining workflows
		updatedWorkflows.forEach((workflow, idx) => {
			workflow.order = idx;
		});

		// Create updated phases array with explicit typing
		const updatedPhases = [...phases];
		updatedPhases[phaseIndex] = {
			id: phase.id,
			title: phase.title,
			color: phase.color,
			workflows: updatedWorkflows
		};

		// Update phases through callback
		onPhasesUpdate(updatedPhases);
		
		// Save changes
		await onSave();
	}

	async function onWorkflowReorder(
		phases: Phase[], 
		phaseId: string, 
		_event: any,
		onPhasesUpdate: (phases: Phase[]) => void,
		onSave: () => Promise<void>
	) {
		const phaseIndex = phases.findIndex(p => p.id === phaseId);
		if (phaseIndex === -1) return;

		const phase = phases[phaseIndex];
		if (!phase) return;
		
		// Update order for all workflows in the phase
		const updatedWorkflows = phase.workflows.map((workflow, index) => ({
			...workflow,
			order: index
		}));

		// Create updated phases array with explicit typing
		const updatedPhases = [...phases];
		updatedPhases[phaseIndex] = {
			id: phase.id,
			title: phase.title,
			color: phase.color,
			workflows: updatedWorkflows
		};

		// Update phases through callback
		onPhasesUpdate(updatedPhases);
		
		// Save changes
		await onSave();
	}

	function getPhaseTitle(phases: Phase[], phaseId: string | null): string {
		const phase = phases.find(p => p.id === phaseId);
		return phase?.title || 'Unknown Phase';
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

	function setAvailableWorkflows(workflows: WorkflowData[]) {
		availableWorkflows.value = workflows;
	}

	return {
		// State
		showAddWorkflowModal,
		selectedPhaseId,
		selectedWorkflowId,
		customWorkflowLabel,
		availableWorkflows,
		
		// Methods
		openAddWorkflowModal,
		closeAddWorkflowModal,
		addWorkflowToPhase,
		removeWorkflow,
		onWorkflowReorder,
		getPhaseTitle,
		openWorkflow,
		setAvailableWorkflows,
		generateWorkflowLinkId,
	};
}