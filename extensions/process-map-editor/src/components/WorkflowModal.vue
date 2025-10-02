<template>
	<!-- Add Workflow Modal -->
	<div v-if="isVisible" class="modal-overlay" @click="$emit('close')">
		<div class="modal-content" @click.stop>
			<div class="modal-header">
				<h3>Add Workflow to {{ phaseTitle }}</h3>
				<button @click="$emit('close')" class="modal-close-btn">
					<v-icon name="close" />
				</button>
			</div>
			<div class="modal-body">
				<div class="form-field">
					<label>Select Workflow:</label>
					<select v-model="selectedWorkflowId" class="workflow-select">
						<option value="">Choose a workflow</option>
						<option 
							v-for="workflow in availableWorkflows" 
							:key="workflow.id" 
							:value="workflow.id"
						>
							{{ workflow.name }}
						</option>
					</select>
				</div>
				<div class="form-field">
					<label>Custom Label (optional):</label>
					<v-input
						v-model="customWorkflowLabel"
						placeholder="Enter custom label or leave empty to use workflow name"
					/>
				</div>
			</div>
			<div class="modal-footer">
				<button @click="$emit('close')" class="btn-secondary">
					Cancel
				</button>
				<button 
					@click="handleAddWorkflow" 
					:disabled="!selectedWorkflowId"
					class="btn-primary"
				>
					Add Workflow
				</button>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

// Types
interface Workflow {
	id: string;
	name: string;
}

// Props
interface Props {
	isVisible: boolean;
	phaseTitle: string;
	availableWorkflows: Workflow[];
}

defineProps<Props>();

// Emits
const emit = defineEmits<{
	'close': [];
	'add-workflow': [workflowId: string, customLabel: string];
}>();

// Local state
const selectedWorkflowId = ref<string | null>(null);
const customWorkflowLabel = ref('');

// Methods
function handleAddWorkflow() {
	if (selectedWorkflowId.value) {
		emit('add-workflow', selectedWorkflowId.value, customWorkflowLabel.value);
		// Reset form
		selectedWorkflowId.value = null;
		customWorkflowLabel.value = '';
	}
}
</script>

<style scoped>
/* Modal Styles */
.modal-overlay {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: var(--theme--overlay, rgba(0, 0, 0, 0.5));
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 2000;
}

.modal-content {
	background: var(--theme--background, white);
	border-radius: var(--theme--border-radius);
	box-shadow: 0 10px 25px var(--theme--shadow-modal, rgba(0, 0, 0, 0.15));
	max-width: 500px;
	width: 90%;
	max-height: 80vh;
	overflow: hidden;
}

.modal-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 1.5rem;
	border-bottom: 1px solid var(--theme--border-color);
}

.modal-header h3 {
	margin: 0;
	font-size: 1.125rem;
	font-weight: 600;
	color: var(--theme--foreground);
}

.modal-close-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 32px;
	height: 32px;
	background: transparent;
	border: none;
	border-radius: var(--theme--border-radius);
	cursor: pointer;
	color: var(--theme--foreground-subdued);
	transition: all 0.2s ease;
}

.modal-close-btn:hover {
	background: var(--theme--background-accent);
	color: var(--theme--foreground);
}

.modal-body {
	padding: 1.5rem;
	display: flex;
	flex-direction: column;
	gap: 1rem;
}

.modal-footer {
	display: flex;
	align-items: center;
	justify-content: flex-end;
	gap: 0.75rem;
	padding: 1.5rem;
	border-top: 1px solid var(--theme--border-color);
}

.form-field {
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
}

.form-field label {
	font-size: 0.875rem;
	font-weight: 500;
	color: var(--theme--foreground);
}

.workflow-select {
	padding: 0.5rem;
	border: 1px solid var(--theme--form--field--input--border-color);
	border-radius: var(--theme--border-radius);
	background: var(--theme--form--field--input--background);
	color: var(--theme--form--field--input--foreground);
	font-size: 0.875rem;
	min-height: 40px;
}

.workflow-select:focus {
	outline: none;
	border-color: var(--theme--primary);
}

.btn-primary {
	padding: 0.5rem 1rem;
	background: var(--theme--success, #10b981);
	color: white;
	border: none;
	border-radius: var(--theme--border-radius);
	font-size: 0.875rem;
	font-weight: 500;
	cursor: pointer;
	transition: all 0.2s ease;
}

.btn-primary:hover:not(:disabled) {
	background: var(--theme--success-accent, #059669);
	transform: translateY(-1px);
	box-shadow: 0 2px 4px var(--theme--shadow, rgba(0, 0, 0, 0.1));
}

.btn-primary:disabled {
	opacity: 0.6;
	cursor: not-allowed;
	transform: none;
}

.btn-secondary {
	padding: 0.5rem 1rem;
	background: transparent;
	color: var(--theme--foreground);
	border: 1px solid var(--theme--border-color);
	border-radius: var(--theme--border-radius);
	font-size: 0.875rem;
	font-weight: 500;
	cursor: pointer;
	transition: all 0.2s ease;
}

.btn-secondary:hover {
	background: var(--theme--background-accent);
	transform: translateY(-1px);
	box-shadow: 0 2px 4px var(--theme--shadow, rgba(0, 0, 0, 0.1));
}
</style>