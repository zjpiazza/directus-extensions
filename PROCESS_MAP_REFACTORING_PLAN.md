# Process Map Editor Refactoring Plan

## Executive Summary

The current process-map-editor is a monolithic Vue component (~1,946 lines in editor.vue) that handles multiple responsibilities including flow visualization, program management, workflow management, state persistence, and UI controls. This refactoring plan breaks down the extension into smaller, more manageable, and maintainable pieces following Vue.js and software engineering best practices.

## Current State Analysis

### Strengths
- ✅ Working Vue Flow implementation
- ✅ Directus integration with proper props/emit
- ✅ Program and workflow management
- ✅ State persistence functionality
- ✅ Existing test coverage for components
- ✅ Responsive design with proper styling

### Problems Identified
- 🔴 **Monolithic Component**: Single 1,946-line editor.vue file
- 🔴 **Mixed Responsibilities**: UI, state management, API calls, business logic all in one place
- 🔴 **Poor Testability**: Hard to test individual features in isolation
- 🔴 **Code Duplication**: Repeated patterns for API calls and state management
- 🔴 **Hard to Maintain**: Adding new features requires modifying the large main file
- 🔴 **No Clear Architecture**: Lack of separation between data, presentation, and business logic

## Refactoring Strategy

### Phase 1: Extract Composables (High Priority)
Break down the monolithic component by extracting reusable composables for different concerns.

#### 1.1 State Management Composables
**Files to Create:**
- `src/composables/useProcessMapState.ts` - Core state management
- `src/composables/useProgramState.ts` - Program selection and management
- `src/composables/useWorkflowState.ts` - Workflow CRUD operations
- `src/composables/useVueFlowState.ts` - Vue Flow specific state (nodes, edges, viewport)

**Purpose:** Separate state management logic from UI components, making it reusable and testable.

#### 1.2 API Integration Composables
**Files to Create:**
- `src/composables/useDirectusApi.ts` - Generic Directus API wrapper
- `src/composables/useProgramsApi.ts` - Programs API operations
- `src/composables/useWorkflowsApi.ts` - Workflows API operations

**Purpose:** Centralize API logic, add proper error handling, and make API calls testable.

#### 1.3 Persistence Composables
**Files to Create:**
- `src/composables/useStatePersistence.ts` - Save/load state to/from Directus
- `src/composables/useDataMigration.ts` - Handle backward compatibility for saved data

**Purpose:** Isolate complex state persistence logic and data migration concerns.

### Phase 2: Component Decomposition (High Priority)

#### 2.1 Extract UI Components
**Files to Create:**
- `src/components/ProcessMapCanvas.vue` - Vue Flow canvas wrapper
- `src/components/ControlCluster.vue` - Control buttons and interactions
- `src/components/ProgramSelector.vue` - Program selection overlay
- `src/components/SwimLanes/` (directory)
  - `SwimLanesContainer.vue` - Main swim lanes layout
  - `SwimLane.vue` - Individual swim lane component
  - `WorkflowItem.vue` - Individual workflow item
- `src/components/Modals/` (directory)
  - `AddWorkflowModal.vue` - Add workflow modal
  - `ConfirmationModal.vue` - Generic confirmation modal

#### 2.2 Enhance Existing Components
**Files to Modify:**
- `src/components/PhaseNode.vue` - Add interaction handling
- `src/components/DecisionNode.vue` - Add configuration options
- `src/components/SeparatorNode.vue` - Improve editing experience

### Phase 3: Business Logic Separation (Medium Priority)

#### 3.1 Service Layer
**Files to Create:**
- `src/services/ProcessMapService.ts` - Core business logic
- `src/services/WorkflowLinkService.ts` - Workflow linking operations
- `src/services/ValidationService.ts` - Data validation logic

#### 3.2 Utilities and Helpers
**Files to Create:**
- `src/utils/nodeFactory.ts` - Factory functions for creating nodes
- `src/utils/edgeFactory.ts` - Factory functions for creating edges
- `src/utils/dataTransformers.ts` - Data transformation utilities
- `src/utils/constants.ts` - Application constants
- `src/utils/validators.ts` - Validation functions

### Phase 4: Advanced Architecture (Medium Priority)

#### 4.1 Event System
**Files to Create:**
- `src/events/EventBus.ts` - Central event bus for component communication
- `src/events/processMapEvents.ts` - Process map specific events

#### 4.2 State Management Enhancement
**Files to Create:**
- `src/stores/processMapStore.ts` - Pinia store for global state (if needed)
- `src/types/` (directory) - TypeScript type definitions
  - `ProcessMap.ts`
  - `Program.ts`
  - `Workflow.ts`
  - `VueFlow.ts`

### Phase 5: Testing and Documentation (Low Priority)

#### 5.1 Comprehensive Testing
**Files to Create:**
- `src/__tests__/composables/` - Tests for all composables
- `src/__tests__/services/` - Tests for services
- `src/__tests__/utils/` - Tests for utilities
- `src/__tests__/integration/` - Integration tests

#### 5.2 Documentation
**Files to Create:**
- `docs/API.md` - API documentation
- `docs/ARCHITECTURE.md` - Architecture overview
- `docs/DEVELOPMENT.md` - Development guide

## Detailed Implementation Plan

### Step 1: Extract State Management (Week 1)

#### 1.1 Create `useProcessMapState.ts`
```typescript
// Central state management for the entire process map
export function useProcessMapState() {
  const isInitializing = ref(true)
  const isEditMode = ref(false)
  const isSaving = ref(false)
  
  // Core state operations
  const initializeState = () => { /* ... */ }
  const saveState = () => { /* ... */ }
  const resetState = () => { /* ... */ }
  
  return {
    isInitializing,
    isEditMode,
    isSaving,
    initializeState,
    saveState,
    resetState
  }
}
```

#### 1.2 Create `useProgramState.ts`
```typescript
// Program selection and management
export function useProgramState() {
  const programs = ref<Program[]>([])
  const selectedProgram = ref<string | null>(null)
  
  const fetchPrograms = async () => { /* ... */ }
  const selectProgram = (id: string) => { /* ... */ }
  
  return {
    programs,
    selectedProgram,
    fetchPrograms,
    selectProgram
  }
}
```

#### 1.3 Create `useWorkflowState.ts`
```typescript
// Workflow CRUD operations
export function useWorkflowState() {
  const workflows = ref<Workflow[]>([])
  const phases = ref<Phase[]>([])
  
  const addWorkflowToPhase = (phaseId: string, workflowId: string) => { /* ... */ }
  const removeWorkflowFromPhase = (phaseId: string, workflowId: string) => { /* ... */ }
  const reorderWorkflows = (phaseId: string, newOrder: string[]) => { /* ... */ }
  
  return {
    workflows,
    phases,
    addWorkflowToPhase,
    removeWorkflowFromPhase,
    reorderWorkflows
  }
}
```

### Step 2: Extract API Layer (Week 1)

#### 2.1 Create `useDirectusApi.ts`
```typescript
// Generic Directus API wrapper with error handling
export function useDirectusApi() {
  const api = useApi()
  
  const get = async (endpoint: string, params?: any) => {
    try {
      const response = await api.get(endpoint, { params })
      return response.data
    } catch (error) {
      console.error(`API Error: ${endpoint}`, error)
      throw error
    }
  }
  
  return { get, post, put, delete }
}
```

### Step 3: Component Extraction (Week 2)

#### 3.1 Create `ProcessMapCanvas.vue`
Extract the Vue Flow canvas logic from the main editor:
```vue
<template>
  <VueFlow
    v-model:nodes="nodes"
    v-model:edges="edges"
    :class="canvasClasses"
    v-bind="flowOptions"
    @nodes-initialized="onNodesInitialized"
    @move="onViewportMove"
  >
    <!-- Node templates -->
    <template #node-phase="nodeProps">
      <PhaseNode v-bind="nodeProps" />
    </template>
    <!-- ... -->
  </VueFlow>
</template>
```

#### 3.2 Create `SwimLanesContainer.vue`
Extract the swim lanes section:
```vue
<template>
  <div class="swim-lanes-container">
    <SwimLane
      v-for="phase in phases"
      :key="phase.id"
      :phase="phase"
      :is-edit-mode="isEditMode"
      @add-workflow="onAddWorkflow"
      @remove-workflow="onRemoveWorkflow"
      @reorder-workflows="onReorderWorkflows"
    />
  </div>
</template>
```

### Step 4: Main Editor Refactoring (Week 2)

#### 4.1 Simplified `editor.vue`
The main editor becomes a composition of smaller components:
```vue
<template>
  <div class="process-map-container">
    <!-- Loading State -->
    <LoadingOverlay v-if="isInitializing" />
    
    <!-- Main Canvas -->
    <ProcessMapCanvas
      v-if="!isInitializing"
      :nodes="flowNodes"
      :edges="flowEdges"
      :is-edit-mode="isEditMode"
      @viewport-change="onViewportChange"
    />
    
    <!-- Control Cluster -->
    <ControlCluster
      :is-edit-mode="isEditMode"
      :is-saving="isSaving"
      @toggle-edit-mode="toggleEditMode"
      @save="saveState"
      @reset-layout="resetLayout"
    />
    
    <!-- Program Selector -->
    <ProgramSelector
      :programs="programs"
      :selected-program="selectedProgram"
      @program-change="onProgramChange"
    />
    
    <!-- Swim Lanes -->
    <SwimLanesContainer
      :phases="phases"
      :is-edit-mode="isEditMode"
      @workflow-action="handleWorkflowAction"
    />
    
    <!-- Modals -->
    <AddWorkflowModal
      v-if="showAddWorkflowModal"
      :available-workflows="availableWorkflows"
      @add-workflow="addWorkflow"
      @close="closeModal"
    />
  </div>
</template>

<script setup lang="ts">
// Composables
const { isInitializing, isEditMode, isSaving } = useProcessMapState()
const { programs, selectedProgram } = useProgramState()
const { phases, workflows } = useWorkflowState()
const { flowNodes, flowEdges } = useVueFlowState()

// Event handlers become much simpler
const onProgramChange = (programId: string) => {
  selectProgram(programId)
}

// ... other simplified handlers
</script>
```

## Benefits of This Refactoring

### 1. **Maintainability**
- Smaller, focused files are easier to understand and modify
- Clear separation of concerns
- Reduced cognitive load when working on specific features

### 2. **Testability**
- Individual composables can be unit tested in isolation
- Business logic separated from UI components
- Mock dependencies easily for testing

### 3. **Reusability**
- Composables can be reused across different components
- Generic API wrapper can be used by other extensions
- Utility functions promote DRY principles

### 4. **Developer Experience**
- Better IDE support with smaller files
- Easier code navigation and search
- Clear file structure makes onboarding easier

### 5. **Performance**
- Tree-shaking friendly architecture
- Lazy loading opportunities for modal components
- More efficient change detection with focused reactivity

## Migration Strategy

### Phase 1: Non-Breaking Changes (Weeks 1-2)
1. Create composables alongside existing code
2. Extract components while keeping the main editor functional
3. Gradually migrate functionality to new architecture
4. Maintain backward compatibility

### Phase 2: Main Refactoring (Week 3)
1. Refactor main editor.vue to use new composables and components
2. Update existing tests
3. Add comprehensive test coverage

### Phase 3: Polish and Optimization (Week 4)
1. Add advanced features (event system, enhanced state management)
2. Performance optimizations
3. Documentation and final testing

## Risk Mitigation

### 1. **Backward Compatibility**
- Maintain existing prop interfaces
- Handle old saved data formats
- Gradual migration approach

### 2. **Testing Strategy**
- Comprehensive test coverage before refactoring
- Integration tests to ensure functionality remains intact
- Manual testing checklist for UI components

### 3. **Rollback Plan**
- Version control branching strategy
- Feature flags for new architecture
- Ability to revert to monolithic version if issues arise

## Success Metrics

### Code Quality
- [ ] Lines of code per file < 300
- [ ] Cyclomatic complexity per function < 10
- [ ] Test coverage > 80%
- [ ] No ESLint warnings

### Developer Experience
- [ ] New features can be added without modifying main editor
- [ ] Component isolation allows for independent development
- [ ] Clear documentation and examples for each composable

### Performance
- [ ] Bundle size remains same or smaller
- [ ] Runtime performance maintained or improved
- [ ] Memory usage optimized

## Conclusion

This refactoring plan transforms the monolithic process-map-editor into a well-architected, maintainable, and extensible system. By following Vue.js composition patterns and separating concerns, we create a foundation that will be much easier to maintain, test, and extend in the future.

The phased approach ensures minimal disruption to existing functionality while providing clear milestones and the ability to deliver value incrementally.