import { DEFAULT_PHASES } from './constants';

export interface WorkflowItem {
	id: string;
	order: number;
	title: string;
	workflowId?: string;
	workflowName?: string;
}

export interface Phase {
	id: string;
	title: string;
	color: string;
	workflows: WorkflowItem[];
}

export function createDefaultPhases(): Phase[] {
	return DEFAULT_PHASES.map(phaseConfig => ({
		...phaseConfig,
		workflows: [],
	}));
}

export function convertPhasesToLinksMap(phases: Phase[]): Record<string, WorkflowItem[]> {
	const map: Record<string, WorkflowItem[]> = {};
	
	for (const phase of phases) {
		map[phase.id] = Array.isArray(phase.workflows) 
			? phase.workflows.map(w => ({ ...w })) 
			: [];
	}
	
	map.request_service = map.request_service || [];
	map.evaluate_service = map.evaluate_service || [];
	map.provide_services = map.provide_services || [];
	map.end_of_service = map.end_of_service || [];
	
	return map;
}

export function createPhasesFromLinks(workflowLinks: Record<string, WorkflowItem[]>): Phase[] {
	return DEFAULT_PHASES.map(phaseConfig => {
		const workflows = workflowLinks[phaseConfig.id];
		return {
			...phaseConfig,
			workflows: workflows ? workflows.map(w => ({ ...w })) : [],
		};
	});
}
