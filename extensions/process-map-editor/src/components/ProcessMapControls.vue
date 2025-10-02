<template>
	<!-- Custom Control Cluster - Compact Icon Stack -->
	<div 
		class="control-cluster"
		@mouseenter="isControlsExpanded = true"
		@mouseleave="isControlsExpanded = false"
	>
		<div class="control-stack">
			<!-- Expanded icons (appear above gear when hovered) -->
			<div v-if="isControlsExpanded" class="expanded-icons">
				<button @click="$emit('save')" :disabled="isSaving" class="control-icon save-icon" title="Save Process Map">
					<v-icon :name="isSaving ? 'hourglass_empty' : 'save'" />
				</button>
				<button @click="$emit('toggle-edit-mode')" class="control-icon edit-mode-icon" :title="isEditMode ? 'Switch to View Mode' : 'Switch to Edit Mode'">
					<v-icon :name="isEditMode ? 'visibility' : 'edit'" />
				</button>
				<button @click="$emit('fit-view')" class="control-icon" title="Fit View">
					<v-icon name="center_focus_strong" />
				</button>
				<button @click="$emit('reset-layout')" :disabled="!isEditMode" class="control-icon" :title="isEditMode ? 'Reset Layout' : 'Reset Layout (Edit Mode Only)'">
					<v-icon name="restart_alt" />
				</button>
				<button @click="$emit('zoom-out')" :disabled="!isEditMode" class="control-icon" :title="isEditMode ? 'Zoom Out' : 'Zoom Out (Edit Mode Only)'">
					<v-icon name="remove" />
				</button>
				<button @click="$emit('zoom-in')" :disabled="!isEditMode" class="control-icon" :title="isEditMode ? 'Zoom In' : 'Zoom In (Edit Mode Only)'">
					<v-icon name="add" />
				</button>
			</div>
			
			<!-- Always visible gear icon -->
			<div class="gear-icon">
				<v-icon name="settings" />
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// Props
interface Props {
	isEditMode: boolean;
	isSaving: boolean;
}

defineProps<Props>();

// Emits
defineEmits<{
	'save': [];
	'toggle-edit-mode': [];
	'fit-view': [];
	'reset-layout': [];
	'zoom-out': [];
	'zoom-in': [];
}>();

// Local state
const isControlsExpanded = ref(false);
</script>

<style scoped>
/* Control Cluster - Compact Icon Stack */
.control-cluster {
	position: absolute;
	bottom: 20px;
	left: 20px;
	z-index: 1000;
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.control-stack {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 8px;
}

.expanded-icons {
	display: flex;
	flex-direction: column;
	gap: 8px;
	animation: slideUpFadeIn 0.3s ease forwards;
}

@keyframes slideUpFadeIn {
	from {
		opacity: 0;
		transform: translateY(20px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

.control-icon {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 44px;
	height: 44px;
	background: var(--theme--background-accent, rgba(255, 255, 255, 0.95));
	backdrop-filter: blur(8px);
	color: var(--theme--foreground);
	border: 1px solid var(--theme--border-color);
	border-radius: var(--theme--border-radius);
	cursor: pointer;
	transition: all 0.2s ease;
	box-shadow: 0 2px 8px var(--theme--shadow, rgba(0, 0, 0, 0.1));
}

.control-icon:hover {
	background: var(--theme--success, #10b981);
	color: white;
	transform: translateY(-2px) scale(1.05);
	box-shadow: 0 4px 12px var(--theme--shadow-accent, rgba(0, 0, 0, 0.15));
}

.control-icon:hover .v-icon {
	color: white;
}

.control-icon:disabled {
	opacity: 0.6;
	cursor: not-allowed;
	transform: none;
}

.control-icon .v-icon {
	font-size: 18px;
	color: inherit;
}

.save-icon {
	background: var(--theme--success, #10b981);
	color: white;
}

.save-icon:hover:not(:disabled) {
	background: var(--theme--success-accent, #059669);
}

.save-icon .v-icon {
	color: white;
}

.edit-mode-icon {
	background: var(--theme--warning, #f59e0b);
	color: white;
}

.edit-mode-icon:hover:not(:disabled) {
	background: var(--theme--warning-accent, #d97706);
}

.edit-mode-icon .v-icon {
	color: white;
}

.gear-icon {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 48px;
	height: 48px;
	background: var(--theme--background-accent, rgba(255, 255, 255, 0.95));
	backdrop-filter: blur(8px);
	color: var(--theme--foreground);
	border: 1px solid var(--theme--border-color);
	border-radius: var(--theme--border-radius);
	cursor: pointer;
	transition: all 0.2s ease;
	box-shadow: 0 2px 8px var(--theme--shadow, rgba(0, 0, 0, 0.1));
}

.gear-icon:hover {
	color: var(--theme--primary);
	transform: scale(1.1) rotate(90deg);
	box-shadow: 0 4px 12px var(--theme--shadow-accent, rgba(0, 0, 0, 0.15));
}

.gear-icon .v-icon {
	font-size: 20px;
}
</style>