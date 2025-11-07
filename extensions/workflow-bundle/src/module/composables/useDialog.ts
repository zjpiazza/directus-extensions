import { ref, computed, type Ref } from 'vue';

export interface DialogOptions {
  defaultPaletteVisible?: boolean;
  defaultSidebarVisible?: boolean;
}

export function useDialog(
  focusedNodeId: Ref<string | null>,
  options: DialogOptions = {}
) {
  // Panel visibility state
  const showNodePalette = ref(options.defaultPaletteVisible ?? true);
  const showDetailsSidebar = ref(options.defaultSidebarVisible ?? true);

  // Panel toggle functions
  const toggleNodePalette = () => {
    showNodePalette.value = !showNodePalette.value;
  };

  const toggleDetailsSidebar = () => {
    showDetailsSidebar.value = !showDetailsSidebar.value;
  };

  // Helper function to position the description dialog in a fixed location
  const getDescriptionDialogPosition = () => {
    if (!focusedNodeId.value) return {};
    
    // Fixed position in top-left corner of the canvas
    return {
      position: 'absolute',
      top: '20px',
      left: '20px',
      zIndex: 1000
    };
  };

  // Layout classes for panels
  const layoutClasses = computed(() => ({
    'show-node-palette': showNodePalette.value,
    'show-details-sidebar': showDetailsSidebar.value
  }));

  return {
    // Panel visibility
    showNodePalette,
    showDetailsSidebar,
    
    // Toggle functions
    toggleNodePalette,
    toggleDetailsSidebar,
    
    // Dialog positioning
    getDescriptionDialogPosition,
    
    // Computed layout classes
    layoutClasses,
  };
}