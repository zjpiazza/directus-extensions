import { ref, computed } from 'vue';
import { useVueFlow } from '@vue-flow/core';
import { useApi } from '@directus/extensions-sdk';

export function usePrograms() {
	const api = useApi();
	const programs = ref<Array<{ id: string; name: string }>>([]);
	const selectedProgram = ref<string | null>(null);
	const workflowLinks = ref<Array<any>>([]);

	const fetchPrograms = async () => {
		try {
			const response = await api.get('/items/programs');
			programs.value = response.data.data.map((program: any) => ({
				id: program.id,
				name: program.name
			}));
		} catch (error) {
			console.error('Failed to fetch programs:', error);
		}
	};

	const fetchWorkflowLinks = async () => {
		try {
			const response = await api.get('/items/process_workflows');
			workflowLinks.value = response.data.data;
		} catch (error) {
			console.error('Failed to fetch workflow links:', error);
		}
	};

	return {
		programs,
		selectedProgram,
		workflowLinks,
		fetchPrograms,
		fetchWorkflowLinks
	};
}

export function useViewport(): {
	getViewport: any;
	setViewport: any;
	onInit: any;
	currentZoom: any;
	viewportScale: any;
} {
	const { getViewport, setViewport, onInit } = useVueFlow();
	const currentZoom = ref(1);
	
	const viewportScale = computed(() => {
		// Create a responsive scale factor based on viewport zoom and screen size
		const baseScale = Math.min(window.innerWidth / 1200, window.innerHeight / 800);
		return Math.max(0.5, Math.min(2, baseScale * currentZoom.value));
	});

	return {
		getViewport,
		setViewport,
		onInit,
		currentZoom,
		viewportScale
	};
}
