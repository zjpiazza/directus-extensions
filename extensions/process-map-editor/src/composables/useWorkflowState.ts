import { ref, nextTick } from 'vue';
import type { Phase } from '../domain/phaseManagement';
import { 
	generateWorkflowLinkId, 
	addWorkflow, 
	removeWorkflow as removeWorkflowFromPhase, 
	reorderWorkflows, 
	getPhaseTitle as getPhaseTitleUtil 
} from '../domain/workflowOperations';

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

		const title = customWorkflowLabel.value || selectedWorkflow.name;
		const updatedPhases = addWorkflow(phases, selectedPhaseId.value, selectedWorkflowId.value, title);
		
		if (!updatedPhases) return;
		
		onPhasesUpdate(updatedPhases);
		await nextTick();
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
		const updatedPhases = removeWorkflowFromPhase(phases, phaseId, workflowLinkId);
		if (!updatedPhases) return;

		onPhasesUpdate(updatedPhases);
		await onSave();
	}

	async function onWorkflowReorder(
		phases: Phase[], 
		phaseId: string, 
		_event: any,
		onPhasesUpdate: (phases: Phase[]) => void,
		onSave: () => Promise<void>
	) {
		const updatedPhases = reorderWorkflows(phases, phaseId);
		if (!updatedPhases) return;

		onPhasesUpdate(updatedPhases);
		await onSave();
	}

	function getPhaseTitle(phases: Phase[], phaseId: string | null): string {
		return getPhaseTitleUtil(phases, phaseId);
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