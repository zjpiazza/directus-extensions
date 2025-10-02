import { describe, it, expect } from 'vitest';
import { useProcessMapState } from '../composables/useProcessMapState';
import { useProgramState } from '../composables/useProgramState';
import { useWorkflowState } from '../composables/useWorkflowState';

describe('Composables', () => {
	it('should initialize useProcessMapState with default values', () => {
		const {
			phases,
			separatorText,
			programWorkflowLinks,
			isEditMode,
			isInitializing,
		} = useProcessMapState();

		expect(phases.value).toEqual([]);
		expect(separatorText.value).toBe('SIGNED SERVICE PLAN');
		expect(programWorkflowLinks.value).toEqual({});
		expect(isEditMode.value).toBe(false);
		expect(isInitializing.value).toBe(true);
	});

	it('should initialize useProgramState with default values', () => {
		const {
			programs,
			selectedProgram,
			selectedProgramName,
		} = useProgramState();

		expect(programs.value).toEqual([]);
		expect(selectedProgram.value).toBe(null);
		expect(selectedProgramName.value).toBe('');
	});

	it('should initialize useWorkflowState with default values', () => {
		const {
			showAddWorkflowModal,
			selectedPhaseId,
			selectedWorkflowId,
			customWorkflowLabel,
			availableWorkflows,
		} = useWorkflowState();

		expect(showAddWorkflowModal.value).toBe(false);
		expect(selectedPhaseId.value).toBe(null);
		expect(selectedWorkflowId.value).toBe(null);
		expect(customWorkflowLabel.value).toBe('');
		expect(availableWorkflows.value).toEqual([]);
	});

	it('should create default phases correctly', () => {
		const { phases, initializeDefaultPhases } = useProcessMapState();
		
		initializeDefaultPhases();
		
		expect(phases.value).toHaveLength(4);
		expect(phases.value[0]?.id).toBe('request_service');
		expect(phases.value[1]?.id).toBe('evaluate_service');
		expect(phases.value[2]?.id).toBe('provide_services');
		expect(phases.value[3]?.id).toBe('end_of_service');
		
		// Each phase should have empty workflows array
		phases.value.forEach((phase: any) => {
			expect(phase.workflows).toEqual([]);
		});
	});

	it('should handle program selection', () => {
		const { programs, selectedProgram, setPrograms, selectProgram } = useProgramState();
		
		const testPrograms = [
			{ id: '1', name: 'Program 1' },
			{ id: '2', name: 'Program 2' }
		];
		
		setPrograms(testPrograms);
		
		expect(programs.value).toEqual(testPrograms);
		expect(selectedProgram.value).toBe('1'); // Should auto-select first program
		
		selectProgram('2');
		expect(selectedProgram.value).toBe('2');
	});
});