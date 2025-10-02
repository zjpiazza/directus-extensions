import { ref } from 'vue';
import { useApi } from '@directus/extensions-sdk';
import type { Program } from './useProgramState';
import type { WorkflowData } from './useWorkflowState';

export function useDirectusApi() {
	const api = useApi();
	const isLoading = ref(false);
	const error = ref<string | null>(null);

	// Programs API
	async function fetchPrograms(): Promise<Program[]> {
		try {
			isLoading.value = true;
			error.value = null;
			
			const response = await api.get('/items/programs', {
				params: {
					fields: ['id', 'name'],
					limit: -1, // Get all programs
				},
			});
			
			const programs = response.data.data || [];
			console.log('Fetched programs:', programs);
			
			return programs;
		} catch (err) {
			console.error('Error fetching programs:', err);
			error.value = 'Failed to fetch programs';
			return [];
		} finally {
			isLoading.value = false;
		}
	}

	// Workflows API
	async function fetchAvailableWorkflows(): Promise<WorkflowData[]> {
		try {
			isLoading.value = true;
			error.value = null;
			
			console.log('Fetching available workflows...');
			const response = await api.get('/items/workflows', {
				params: {
					fields: ['id', 'name'],
					limit: -1,
				},
			});
			
			console.log('Workflows response:', response.data);
			const workflows = response.data.data || [];
			console.log('Available workflows:', workflows);
			
			return workflows;
		} catch (err) {
			console.error('Error fetching workflows:', err);
			error.value = 'Failed to fetch workflows';
			return [];
		} finally {
			isLoading.value = false;
		}
	}

	// State management - could be extended for CRUD operations on process maps
	async function saveProcessMapState(state: any): Promise<boolean> {
		try {
			isLoading.value = true;
			error.value = null;
			
			// This is handled by Directus form system via emit('input', state)
			// But could be extended for direct API calls if needed
			console.log('Process map state would be saved:', state);
			
			return true;
		} catch (err) {
			console.error('Error saving process map state:', err);
			error.value = 'Failed to save process map state';
			return false;
		} finally {
			isLoading.value = false;
		}
	}

	// Generic Directus API helper
	async function fetchCollection<T = any>(
		collection: string, 
		params: Record<string, any> = {}
	): Promise<T[]> {
		try {
			isLoading.value = true;
			error.value = null;
			
			const response = await api.get(`/items/${collection}`, { params });
			return response.data.data || [];
		} catch (err) {
			console.error(`Error fetching ${collection}:`, err);
			error.value = `Failed to fetch ${collection}`;
			return [];
		} finally {
			isLoading.value = false;
		}
	}

	// Create item in collection
	async function createItem<T = any>(
		collection: string, 
		data: Record<string, any>
	): Promise<T | null> {
		try {
			isLoading.value = true;
			error.value = null;
			
			const response = await api.post(`/items/${collection}`, data);
			return response.data.data;
		} catch (err) {
			console.error(`Error creating item in ${collection}:`, err);
			error.value = `Failed to create item in ${collection}`;
			return null;
		} finally {
			isLoading.value = false;
		}
	}

	// Update item in collection
	async function updateItem<T = any>(
		collection: string, 
		id: string | number, 
		data: Record<string, any>
	): Promise<T | null> {
		try {
			isLoading.value = true;
			error.value = null;
			
			const response = await api.patch(`/items/${collection}/${id}`, data);
			return response.data.data;
		} catch (err) {
			console.error(`Error updating item in ${collection}:`, err);
			error.value = `Failed to update item in ${collection}`;
			return null;
		} finally {
			isLoading.value = false;
		}
	}

	// Delete item from collection
	async function deleteItem(collection: string, id: string | number): Promise<boolean> {
		try {
			isLoading.value = true;
			error.value = null;
			
			await api.delete(`/items/${collection}/${id}`);
			return true;
		} catch (err) {
			console.error(`Error deleting item from ${collection}:`, err);
			error.value = `Failed to delete item from ${collection}`;
			return false;
		} finally {
			isLoading.value = false;
		}
	}

	function clearError() {
		error.value = null;
	}

	return {
		// State
		isLoading,
		error,
		
		// Programs
		fetchPrograms,
		
		// Workflows
		fetchAvailableWorkflows,
		
		// Process Map State
		saveProcessMapState,
		
		// Generic CRUD
		fetchCollection,
		createItem,
		updateItem,
		deleteItem,
		
		// Utils
		clearError,
	};
}