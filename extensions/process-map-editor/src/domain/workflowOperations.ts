import type { Phase, WorkflowItem } from './phaseManagement';

export function generateWorkflowLinkId(): string {
	return 'wl-' + Date.now() + '-' + Math.random().toString(36).substring(2, 11);
}

export function addWorkflow(
	phases: Phase[],
	phaseId: string,
	workflowId: string,
	title: string,
): Phase[] | null {
	const phaseIndex = phases.findIndex(p => p.id === phaseId);
	if (phaseIndex === -1) return null;

	const phase = phases[phaseIndex];
	if (!phase) return null;

	const newWorkflowLink: WorkflowItem = {
		id: generateWorkflowLinkId(),
		workflowId: workflowId,
		title: title,
		order: phase.workflows.length,
	};

	const updatedWorkflows = [...phase.workflows, newWorkflowLink];
	const updatedPhases = [...phases];
	updatedPhases[phaseIndex] = {
		...phase,
		workflows: updatedWorkflows,
	};

	return updatedPhases;
}

export function removeWorkflow(
	phases: Phase[],
	phaseId: string,
	workflowLinkId: string,
): Phase[] | null {
	const phaseIndex = phases.findIndex(p => p.id === phaseId);
	if (phaseIndex === -1) return null;

	const phase = phases[phaseIndex];
	if (!phase) return null;

	const workflowIndex = phase.workflows.findIndex(w => w.id === workflowLinkId);
	if (workflowIndex === -1) return null;

	const updatedWorkflows = [...phase.workflows];
	updatedWorkflows.splice(workflowIndex, 1);

	updatedWorkflows.forEach((workflow, idx) => {
		workflow.order = idx;
	});

	const updatedPhases = [...phases];
	updatedPhases[phaseIndex] = {
		...phase,
		workflows: updatedWorkflows,
	};

	return updatedPhases;
}

export function reorderWorkflows(
	phases: Phase[],
	phaseId: string,
): Phase[] | null {
	const phaseIndex = phases.findIndex(p => p.id === phaseId);
	if (phaseIndex === -1) return null;

	const phase = phases[phaseIndex];
	if (!phase) return null;

	const updatedWorkflows = phase.workflows.map((workflow, index) => ({
		...workflow,
		order: index,
	}));

	const updatedPhases = [...phases];
	updatedPhases[phaseIndex] = {
		...phase,
		workflows: updatedWorkflows,
	};

	return updatedPhases;
}

export function getPhaseTitle(phases: Phase[], phaseId: string | null): string {
	const phase = phases.find(p => p.id === phaseId);
	return phase?.title || 'Unknown Phase';
}
