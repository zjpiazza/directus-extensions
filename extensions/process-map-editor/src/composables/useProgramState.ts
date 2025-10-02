import { ref, computed } from 'vue';
import type { Ref } from 'vue';

export interface Program {
	id: string | number;
	name: string;
}

export function useProgramState() {
	// Program state
	const programs = ref<Program[]>([]);
	const selectedProgram = ref<string | number | null>(null);
	
	// Computed properties
	const selectedProgramName = computed(() => {
		if (!selectedProgram.value) return null;
		const program = programs.value.find(p => p.id === selectedProgram.value);
		return program?.name ?? null;
	});

	// Methods
	function setPrograms(newPrograms: Program[]) {
		// Filter out invalid programs (must have id and name)
		const validPrograms = newPrograms.filter(p => p && p.id && p.name);
		programs.value = validPrograms;
		
		console.log('Setting programs:', validPrograms.length, 'valid programs from', newPrograms.length, 'total');
		
		// Set default program if available and none is selected
		if (validPrograms.length > 0 && !selectedProgram.value && validPrograms[0]) {
			selectedProgram.value = validPrograms[0].id;
			console.log('Set default program:', selectedProgram.value, 'Program name:', validPrograms[0].name);
		}
	}

	function selectProgram(programId: string | number | null) {
		selectedProgram.value = programId;
	}

	function getProgramById(id: string | number): Program | undefined {
		return programs.value.find(p => p.id === id);
	}

	return {
		// State
		programs: readonly(programs),
		selectedProgram,
		
		// Computed
		selectedProgramName,
		
		// Methods
		setPrograms,
		selectProgram,
		getProgramById,
	};
}

// Helper function to make refs readonly
function readonly<T>(ref: Ref<T>): Readonly<Ref<T>> {
	return ref as Readonly<Ref<T>>;
}