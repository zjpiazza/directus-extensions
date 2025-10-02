<template>
  <!-- Expand buttons for collapsed panels -->
  <button
    v-if="!showNodePalette && isEditMode"
    class="expand-btn expand-btn-left"
    @click="$emit('toggle-node-palette')"
    title="Show node palette"
  >
    <v-icon name="chevron_right" />
  </button>

  <button
    v-if="!showDetailsSidebar && isEditMode"
    class="expand-btn expand-btn-right"
    @click="$emit('toggle-details-sidebar')"
    title="Show details sidebar"
  >
    <v-icon name="chevron_left" />
  </button>
</template>

<script setup>
defineProps({
  showNodePalette: {
    type: Boolean,
    required: true,
  },
  showDetailsSidebar: {
    type: Boolean,
    required: true,
  },
  isEditMode: {
    type: Boolean,
    required: true,
  },
});

defineEmits(['toggle-node-palette', 'toggle-details-sidebar']);
</script>

<style scoped>
.expand-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1000;
  width: 32px;
  height: 64px;
  background: var(--theme--background, #ffffff);
  border: 1px solid var(--theme--border-color, #ddd);
  border-radius: 0 8px 8px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
}

.expand-btn:hover {
  background: var(--theme--background-accent, #f5f5f5);
  box-shadow: 2px 0 12px rgba(0, 0, 0, 0.15);
}

.expand-btn-left {
  left: 0;
  border-left: none;
  border-radius: 0 8px 8px 0;
}

.expand-btn-right {
  right: 0;
  border-right: none;
  border-radius: 8px 0 0 8px;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
}

.expand-btn-right:hover {
  box-shadow: -2px 0 12px rgba(0, 0, 0, 0.15);
}

.expand-btn .v-icon {
  font-size: 16px;
  opacity: 0.7;
}

.expand-btn:hover .v-icon {
  opacity: 1;
}
</style>