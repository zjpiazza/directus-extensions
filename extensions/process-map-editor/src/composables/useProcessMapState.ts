import { ref, computed } from 'vue';
import type { Node, Edge } from '@vue-flow/core';

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

export interface ProcessMapState {
	nodes: Node[];
	edges: Edge[];
	phases: Phase[];
	selectedProgram: string | number | null;
	separatorText: string;
	programWorkflowLinks: Record<string, Record<string, any[]>>;
	viewport: { x: number; y: number; zoom: number };
}

export function useProcessMapState() {
	// Core state
	const phases = ref<Phase[]>([]);
	const separatorText = ref('SIGNED SERVICE PLAN');
	const programWorkflowLinks = ref<Record<string, Record<string, any[]>>>({});
	const isEditMode = ref(false);
	const isInitializing = ref(true);
	
	// Controls state
	const isControlsExpanded = ref(false);
	const isSaving = ref(false);
	
	// Computed state
	const viewportScale = computed(() => {
		const baseScale = Math.min(window.innerWidth / 1200, window.innerHeight / 800);
		return Math.max(0.5, Math.min(2, baseScale));
	});

	// Helper functions
	function getProgramKey(id: string | number | null | undefined): string {
		return id !== null && id !== undefined && id !== '' ? String(id) : 'default';
	}

	function phasesToLinksMap(phasesArr: Phase[]): Record<string, any[]> {
		const map: Record<string, any[]> = {};
		for (const phase of phasesArr) {
			map[phase.id] = Array.isArray(phase.workflows) ? phase.workflows.map(w => ({ ...w })) : [];
		}
		// Ensure all known keys exist
		map.request_service = map.request_service || [];
		map.evaluate_service = map.evaluate_service || [];
		map.provide_services = map.provide_services || [];
		map.end_of_service = map.end_of_service || [];
		return map;
	}

	function loadWorkflowLinksFromState(workflowLinks: Record<string, any[]>) {
		phases.value = [
			{
				id: 'request_service',
				title: 'REQUEST SERVICE/REPORT',
				color: 'var(--theme--primary, #7c3aed)',
				workflows: workflowLinks.request_service ? workflowLinks.request_service.map(w => ({ ...w })) : []
			},
			{
				id: 'evaluate_service',
				title: 'EVALUATE SERVICE',
				color: 'var(--theme--primary, #7c3aed)',
				workflows: workflowLinks.evaluate_service ? workflowLinks.evaluate_service.map(w => ({ ...w })) : []
			},
			{
				id: 'provide_services',
				title: 'PROVIDE SERVICES AND REEVALUATE SERVICES',
				color: 'var(--theme--primary, #7c3aed)',
				workflows: workflowLinks.provide_services ? workflowLinks.provide_services.map(w => ({ ...w })) : []
			},
			{
				id: 'end_of_service',
				title: 'END OF SERVICES',
				color: 'var(--theme--primary, #7c3aed)',
				workflows: workflowLinks.end_of_service ? workflowLinks.end_of_service.map(w => ({ ...w })) : []
			}
		];
	}

	function initializeDefaultPhases() {
		console.log('INIT: initializeDefaultPhases() called - this will create empty phases');
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

	function syncProgramFromPhases(programId?: string | number | null, selectedProgram?: string | number | null) {
		console.log('SYNC: syncProgramFromPhases() called for program:', programId ?? selectedProgram);
		const key = getProgramKey(programId ?? selectedProgram);
		const linksMap = phasesToLinksMap(phases.value);
		programWorkflowLinks.value[key] = linksMap;
	}

	function applyPhasesForCurrentProgram(selectedProgram: string | number | null) {
		const key = getProgramKey(selectedProgram);
		const links = programWorkflowLinks.value[key] || {};
		console.log('Applying phases for program:', key, 'Links:', links);
		loadWorkflowLinksFromState(links);
	}

	// Separator text editing
	function editSeparatorText() {
		const newText = prompt('Enter separator text:', separatorText.value);
		if (newText !== null) {
			separatorText.value = newText.trim() || 'SIGNED SERVICE PLAN';
		}
	}

	return {
		// State
		phases,
		separatorText,
		programWorkflowLinks,
		isEditMode,
		isInitializing,
		isControlsExpanded,
		isSaving,
		
		// Computed
		viewportScale,
		
		// Methods
		getProgramKey,
		phasesToLinksMap,
		loadWorkflowLinksFromState,
		initializeDefaultPhases,
		syncProgramFromPhases,
		applyPhasesForCurrentProgram,
		editSeparatorText,
	};
}