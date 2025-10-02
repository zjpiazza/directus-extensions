import { ref, computed } from 'vue';
import type { Node, Edge } from '@vue-flow/core';
import { DEFAULT_SEPARATOR_TEXT } from '../domain/constants';
import { 
	createDefaultPhases, 
	convertPhasesToLinksMap, 
	createPhasesFromLinks,
	type Phase,
	type WorkflowItem 
} from '../domain/phaseManagement';
import { normalizeProgramKey } from '../domain/utils/dataTransformers';

export type { Phase, WorkflowItem };

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
	const phases = ref<Phase[]>([]);
	const separatorText = ref(DEFAULT_SEPARATOR_TEXT);
	const programWorkflowLinks = ref<Record<string, Record<string, any[]>>>({});
	const isEditMode = ref(false);
	const isInitializing = ref(true);
	
	const isControlsExpanded = ref(false);
	const isSaving = ref(false);
	
	const viewportScale = computed(() => {
		const baseScale = Math.min(window.innerWidth / 1200, window.innerHeight / 800);
		return Math.max(0.5, Math.min(2, baseScale));
	});

	function getProgramKey(id: string | number | null | undefined): string {
		return normalizeProgramKey(id);
	}

	function phasesToLinksMap(phasesArr: Phase[]): Record<string, any[]> {
		return convertPhasesToLinksMap(phasesArr);
	}

	function loadWorkflowLinksFromState(workflowLinks: Record<string, any[]>) {
		phases.value = createPhasesFromLinks(workflowLinks);
	}

	function initializeDefaultPhases() {
		console.log('INIT: initializeDefaultPhases() called - this will create empty phases');
		phases.value = createDefaultPhases();
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

	function editSeparatorText() {
		const newText = prompt('Enter separator text:', separatorText.value);
		if (newText !== null) {
			separatorText.value = newText.trim() || DEFAULT_SEPARATOR_TEXT;
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