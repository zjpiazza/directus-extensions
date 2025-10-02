import { watch, nextTick, computed } from 'vue';
import { useProcessMapState } from './useProcessMapState';
import { useProgramState } from './useProgramState';
import { useWorkflowState } from './useWorkflowState';
import { useVueFlowState } from './useVueFlowState';
import { useDirectusApi } from './useDirectusApi';

export interface ProcessMapEditorProps {
	value?: any;
	item?: any;
	isNew?: boolean;
	disabled?: boolean;
	collectionInfo?: any;
	collection?: string;
}

export function useProcessMapEditor(
	props: ProcessMapEditorProps,
	emit: (event: 'input', value: any) => void
) {
	// Initialize all composables
	const processMapState = useProcessMapState();
	const programState = useProgramState();
	const workflowState = useWorkflowState();
	const vueFlowState = useVueFlowState();
	const directusApi = useDirectusApi();

	const {
		phases,
		separatorText,
		programWorkflowLinks,
		isEditMode,
		isInitializing,
		isControlsExpanded,
		isSaving,
		viewportScale,
		initializeDefaultPhases,
		syncProgramFromPhases,
		applyPhasesForCurrentProgram,
		editSeparatorText,
	} = processMapState;

	const {
		programs,
		selectedProgram,
		selectedProgramName,
		setPrograms,
		selectProgram,
	} = programState;

	const {
		showAddWorkflowModal,
		selectedPhaseId,
		selectedWorkflowId,
		customWorkflowLabel,
		availableWorkflows,
		openAddWorkflowModal,
		closeAddWorkflowModal,
		getPhaseTitle,
		openWorkflow,
		setAvailableWorkflows,
	} = workflowState;

	const {
		flowNodes,
		flowEdges,
		currentZoom,
		zoomLevelClass,
		zoomIn,
		zoomOut,
		fitView,
		onNodesInitialized,
		onViewportMove,
		resetToDefaultLayout,
		getCurrentFlowState,
		loadFlowState,
	} = vueFlowState;

	// Computed properties
	const title = computed(() => {
		return props.isNew 
			? `Creating ${props.collectionInfo?.name || props.collection}` 
			: `Editing ${props.collectionInfo?.name || props.collection}`;
	});

	const shouldUseCustomHeader = computed(() => {
		const customHeader = (props.collectionInfo?.meta as any)?.custom_header_component;
		return !!customHeader && customHeader !== null;
	});

	const customHeaderName = computed(() => {
		return (props.collectionInfo?.meta as any)?.custom_header_component || 'custom-header-basic';
	});

	// Draft state representing current editor data
	const draftState = computed(() => ({
		nodes: flowNodes.value,
		edges: flowEdges.value,
		phases: phases.value,
		selectedProgram: selectedProgram.value,
		separatorText: separatorText.value,
		programWorkflowLinks: programWorkflowLinks.value,
		viewport: vueFlowState.getViewport() || { x: 0, y: 0, zoom: 1 }
	}));

	// State management functions
	async function freezeCurrentState() {
		try {
			isSaving.value = true;
			
			// Get current flow state
			const flowState = getCurrentFlowState();
			
			// Prepare the complete state data
			const completeState = {
				...flowState,
				phases: phases.value,
				selectedProgram: selectedProgram.value,
				separatorText: separatorText.value,
				programWorkflowLinks: programWorkflowLinks.value,
			};

			// Emit the input event to keep Directus form in sync
			emit('input', completeState);

			console.log('Process map state saved successfully via emit');
			
		} catch (error) {
			console.error('Failed to save process map state:', error);
		} finally {
			isSaving.value = false;
		}
	}

	// Load saved state if it exists
	async function loadSavedState() {
		try {
			console.log('Loading saved state...');
			console.log('Props value:', props.value);
			console.log('Props item:', props.item);
			
			// Load from props.value (Directus standard)
			if (props.value && Object.keys(props.value).length > 0) {
				const savedData = props.value;
				console.log('Loading from props.value:', savedData);
				
				// Load flow state
				loadFlowState(savedData);
				
				if (savedData.selectedProgram) {
					selectProgram(savedData.selectedProgram);
				}
				if (savedData.separatorText) {
					separatorText.value = savedData.separatorText;
				}
				
				// Load workflow links from saved state
				if (savedData.programWorkflowLinks) {
					console.log('LOADING programWorkflowLinks from saved state:', JSON.stringify(savedData.programWorkflowLinks, null, 2));
					programWorkflowLinks.value = savedData.programWorkflowLinks;
					applyPhasesForCurrentProgram(selectedProgram.value);
				} else if (savedData.workflowLinks) {
					// Backward compatibility: single set of workflow links not per program
					console.log('LOADING workflowLinks (backward compatibility):', JSON.stringify(savedData.workflowLinks, null, 2));
					programWorkflowLinks.value[processMapState.getProgramKey(savedData.selectedProgram)] = savedData.workflowLinks;
					applyPhasesForCurrentProgram(selectedProgram.value);
				} else if (savedData.phases) {
					// Backward compatibility: phases array
					console.log('LOADING phases (backward compatibility):', savedData.phases);
					phases.value = savedData.phases;
					syncProgramFromPhases(selectedProgram.value);
				} else {
					// Initialize with default phases if no saved data
					console.log('NO SAVED DATA - initializing default phases');
					initializeDefaultPhases();
					syncProgramFromPhases(selectedProgram.value);
				}
				
				console.log('Saved state loaded from props.value');
				return;
			}

			// Fallback: try to load from item data - always look for "state" field
			if (props.item && Object.keys(props.item).length > 0) {
				const savedData = props.item.state;
				console.log('Loading from item.state:', savedData);
				
				if (savedData && typeof savedData === 'object') {
					// Load flow state
					loadFlowState(savedData);
					
					if (savedData.selectedProgram) {
						selectProgram(savedData.selectedProgram);
					}
					if (savedData.separatorText) {
						separatorText.value = savedData.separatorText;
					}
					
					// Load workflow links from saved state
					if (savedData.programWorkflowLinks) {
						console.log('LOADING programWorkflowLinks from item.state:', JSON.stringify(savedData.programWorkflowLinks, null, 2));
						programWorkflowLinks.value = savedData.programWorkflowLinks;
						applyPhasesForCurrentProgram(selectedProgram.value);
					} else if (savedData.workflowLinks) {
						// Backward compatibility
						console.log('LOADING workflowLinks from item.state (backward compatibility):', JSON.stringify(savedData.workflowLinks, null, 2));
						programWorkflowLinks.value[processMapState.getProgramKey(savedData.selectedProgram)] = savedData.workflowLinks;
						applyPhasesForCurrentProgram(selectedProgram.value);
					} else if (savedData.phases) {
						console.log('LOADING phases from item.state (backward compatibility):', savedData.phases);
						phases.value = savedData.phases;
						syncProgramFromPhases(selectedProgram.value);
					} else {
						console.log('NO SAVED DATA in item.state - initializing default phases');
						initializeDefaultPhases();
						syncProgramFromPhases(selectedProgram.value);
					}
					
					console.log('Saved state loaded from item data');
				} else {
					console.log('No saved state found, initializing defaults');
					initializeDefaultPhases();
				}
			} else {
				console.log('No saved state found, initializing defaults');
				initializeDefaultPhases();
			}
		} catch (error) {
			console.error('Failed to load saved state:', error);
			initializeDefaultPhases();
		}
	}

	// Initialize data
	async function initializeData() {
		try {
			isInitializing.value = true;
			
			// Fetch programs and workflows in parallel
			const [programsData, workflowsData] = await Promise.all([
				directusApi.fetchPrograms(),
				directusApi.fetchAvailableWorkflows()
			]);
			
			// Set data
			setPrograms(programsData);
			setAvailableWorkflows(workflowsData);
			
			// Load saved state
			await loadSavedState();
			
		} catch (error) {
			console.error('Error during initialization:', error);
		} finally {
			isInitializing.value = false;
		}
	}

	// Watch for program changes
	watch(() => selectedProgram.value, async (newProgramId, oldProgramId) => {
		if (newProgramId !== oldProgramId) {
			console.log('Program changed from', oldProgramId, 'to', newProgramId);
			
			// Save current program state into map before switching
			if (oldProgramId) {
				console.log('Syncing old program', oldProgramId, 'with current phases');
				syncProgramFromPhases(oldProgramId);
			}
			
			// Apply phases for new program
			await nextTick();
			applyPhasesForCurrentProgram(newProgramId);
			await nextTick();
			
			// Persist selection + current state snapshot
			await freezeCurrentState();
		}
	});

	// Watch for value changes (Directus standard)
	watch(() => props.value, (newVal) => {
		if (newVal && typeof newVal === 'object') {
			loadFlowState(newVal);
			if (newVal.phases) phases.value = newVal.phases || [];
			if (newVal.selectedProgram) selectProgram(newVal.selectedProgram);
			if (newVal.separatorText) separatorText.value = newVal.separatorText;
		}
	}, { deep: true, immediate: true });

	// Emit input event when draft state changes (Directus standard)
	watch(draftState, (val) => {
		if (props.disabled) return;
		emit('input', val);
	}, { deep: true });

	// Workflow management functions that integrate with state
	async function addWorkflowToPhase() {
		await workflowState.addWorkflowToPhase(
			phases.value,
			(updatedPhases) => {
				phases.value = updatedPhases;
				syncProgramFromPhases(selectedProgram.value);
			},
			freezeCurrentState
		);
	}

	async function removeWorkflow(phaseId: string, workflowLinkId: string) {
		await workflowState.removeWorkflow(
			phases.value,
			phaseId,
			workflowLinkId,
			(updatedPhases) => {
				phases.value = updatedPhases;
				syncProgramFromPhases(selectedProgram.value);
			},
			freezeCurrentState
		);
	}

	async function onWorkflowReorder(phaseId: string, event: any) {
		await workflowState.onWorkflowReorder(
			phases.value,
			phaseId,
			event,
			(updatedPhases) => {
				phases.value = updatedPhases;
			},
			freezeCurrentState
		);
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
		programs,
		selectedProgram,
		selectedProgramName,
		showAddWorkflowModal,
		selectedPhaseId,
		selectedWorkflowId,
		customWorkflowLabel,
		availableWorkflows,
		flowNodes,
		flowEdges,
		currentZoom,
		
		// Computed
		title,
		shouldUseCustomHeader,
		customHeaderName,
		draftState,
		viewportScale,
		zoomLevelClass,
		
		// Methods
		initializeData,
		freezeCurrentState,
		loadSavedState,
		editSeparatorText,
		
		// Program methods
		selectProgram,
		
		// Workflow methods
		openAddWorkflowModal,
		closeAddWorkflowModal,
		addWorkflowToPhase,
		removeWorkflow,
		onWorkflowReorder,
		getPhaseTitle: (phaseId: string | null) => getPhaseTitle(phases.value, phaseId),
		openWorkflow,
		
		// Vue Flow methods
		zoomIn,
		zoomOut,
		fitView,
		onNodesInitialized,
		onViewportMove,
		resetToDefaultLayout,
		
		// API state
		isLoading: directusApi.isLoading,
		apiError: directusApi.error,
	};
}