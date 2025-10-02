<template>
	<!-- Program Selector - Top Right -->
	<div class="program-selector-overlay">
		<div class="program-selector-compact">
			<label>Program:</label>
			<select v-model="selectedProgram" class="program-select">
				<option value="">Select Program</option>
				<option 
					v-for="program in programs" 
					:key="program.id" 
					:value="program.id"
				>
					{{ program.name }}
				</option>
			</select>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

// Types
interface Program {
	id: string | number;
	name: string;
}

// Props
interface Props {
	programs: Program[];
	modelValue: string | number | null;
}

const props = defineProps<Props>();

// Emits
const emit = defineEmits<{
	'update:modelValue': [value: string | number | null];
}>();

// Computed v-model
const selectedProgram = computed({
	get: () => props.modelValue,
	set: (value) => emit('update:modelValue', value)
});
</script>

<style scoped>
/* Program Selector Overlay - Top Right */
.program-selector-overlay {
	position: absolute;
	top: 20px;
	right: 20px;
	z-index: 1000;
	background: var(--theme--background-accent, rgba(255, 255, 255, 0.95));
	backdrop-filter: blur(8px);
	border: 1px solid var(--theme--border-color);
	border-radius: var(--theme--border-radius);
	box-shadow: 0 4px 12px var(--theme--shadow-accent, rgba(0, 0, 0, 0.15));
	padding: 16px;
	min-width: 280px;
}

.program-selector-compact {
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.program-selector-compact label {
	font-size: 0.875rem;
	font-weight: 600;
	color: var(--theme--foreground);
	margin: 0;
}

.program-selector-compact :deep(.v-select) {
	width: 100%;
}

.program-selector-compact :deep(.v-input) {
	min-height: 40px;
	font-size: 0.875rem;
}

.program-select {
	padding: 0.5rem;
	border: 1px solid var(--theme--form--field--input--border-color);
	border-radius: var(--theme--border-radius);
	background: var(--theme--form--field--input--background);
	color: var(--theme--form--field--input--foreground);
	font-size: 0.875rem;
	min-height: 40px;
	width: 100%;
}

.program-select:focus {
	outline: none;
	border-color: var(--theme--primary);
}
</style>