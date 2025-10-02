<template>
	<!-- Swim Lanes Section -->
	<div class="swim-lanes-container">
		<div v-for="phase in phases" :key="phase.id" class="swim-lane">
			<div class="swim-lane-header" :style="{ backgroundColor: phase.color }">
				<h3>{{ phase.title }}</h3>
				<span v-if="isEditMode">
					<!-- Add Workflow Button -->
					<button 
						@click="$emit('add-workflow', phase.id)"
						class="add-workflow-btn"
					>
						<v-icon name="add" size="small" />
					</button>
				</span>
			</div>
			<div class="swim-lane-content">
				<div class="workflow-management">
					<!-- Draggable Workflow Items -->
					<draggable
						v-model="phase.workflows"
						class="workflow-items"
						group="workflows"
						@change="$emit('workflow-reorder', phase.id, $event)"
						item-key="id"
						:animation="200"
						ghost-class="workflow-ghost"
						chosen-class="workflow-chosen"
						drag-class="workflow-drag"
						:disabled="!isEditMode"
					>
						<template #item="{ element: workflow }">
							<div class="workflow-item-container">
								<div
									class="workflow-item"
									@click="$emit('open-workflow', workflow.workflowId || workflow.id)"
									v-if="workflow.workflowId || workflow.id"
								>
								<div class="workflow-item-content">
									<v-icon v-if="isEditMode" name="drag_indicator" class="drag-handle" size="small" />
									<v-icon name="description" size="small" />
									<span class="workflow-title">{{ workflow.title }}</span>
								</div>
									<button
										v-if="isEditMode"
										@click.stop="$emit('remove-workflow', phase.id, workflow.id)"
										class="remove-workflow-btn"
										title="Remove Workflow"
									>
										<v-icon name="close" size="small" />
									</button>
								</div>
							</div>
						</template>
					</draggable>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import draggable from 'vuedraggable';

// Types
interface WorkflowItem {
	id: string;
	title: string;
	workflowId?: string;
	workflowName?: string;
}

interface Phase {
	id: string;
	title: string;
	color: string;
	workflows: WorkflowItem[];
}

// Props
interface Props {
	phases: Phase[];
	isEditMode: boolean;
}

defineProps<Props>();

// Emits
defineEmits<{
	'add-workflow': [phaseId: string];
	'remove-workflow': [phaseId: string, workflowId: string];
	'open-workflow': [workflowId: string];
	'workflow-reorder': [phaseId: string, event: any];
}>();
</script>

<style scoped>
.swim-lanes-container {
	display: grid;
	grid-template-columns: 1fr 1fr 2fr 1fr;
	height: 40vh;
	background: var(--theme--background, white);
	border-top: 1px solid var(--theme--border-color, #e5e7eb);
}

.swim-lane {
	border-right: 1px solid var(--theme--border-color, #e5e7eb);
	display: flex;
	flex-direction: column;
}

.swim-lane:last-child {
	border-right: none;
}

.swim-lane-header {
	padding: 0.75rem;
	color: var(--theme--primary-foreground, white);
	font-weight: 600;
	text-align: center;
	font-size: 0.875rem;
	min-height: 60px;
	display: flex;
	align-items: center;
	justify-content: space-between;
	position: relative;
}

.swim-lane-header h3 {
	margin: 0;
	line-height: 1.2;
	position: absolute;
	left: 50%;
	transform: translateX(-50%);
	flex: 1;
}

.swim-lane-header span {
	margin-left: auto;
	z-index: 1;
}

.add-workflow-btn {
	background: var(--theme--primary, #7c3aed);
	border: 1px solid var(--theme--primary, #7c3aed);
	border-radius: 4px;
	color: #ffffff;
	padding: 4px;
	cursor: pointer;
	transition: all 0.2s ease;
	display: flex;
	align-items: center;
	justify-content: center;
}

.add-workflow-btn:hover {
	background: var(--theme--primary-accent, #6d28d9);
	border-color: #fff
}

.swim-lane-content {
	flex: 1;
	padding: 1rem;
	display: flex;
	flex-direction: column;
	gap: 1rem;
}

.workflow-items {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
}

.workflow-item {
	display: flex;
	align-items: center;
	gap: 1rem;
	padding: 1.25rem 1.5rem;
	background: var(--theme--background, #f8fafc);
	border: 1px solid var(--theme--border-color, #e5e7eb);
	border-radius: 8px;
	cursor: pointer;
	font-size: 1.125rem;
	line-height: 1.3;
	transition: all 0.2s ease;
	color: var(--theme--primary, #7c3aed);
	min-height: 64px;
}

.workflow-item:hover {
	background: var(--theme--background-accent, #ede9fe);
	border: 2px solid var(--theme--primary, #7c3aed);
	transform: translateY(-1px);
}

/* Workflow Management Styles */
.workflow-management {
	display: flex;
	flex-direction: column;
	gap: 1rem;
	height: 100%;
}

.add-workflow-btn {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	padding: 0.5rem 0.75rem;
	background: var(--theme--primary, #7c3aed);
	color: #ffffff;
	border: 1px solid var(--theme--primary, #7c3aed);
	border-radius: var(--theme--border-radius);
	font-size: 0.75rem;
	font-weight: 500;
	cursor: pointer;
	transition: all 0.2s ease;
	align-self: flex-start;
}

.add-workflow-btn:hover {
	background: var(--theme--primary-accent, #6d28d9);
	border-color: var(--theme--primary-accent, #6d28d9);
	transform: translateY(-1px);
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.add-workflow-btn .v-icon {
	font-size: 14px;
}

.workflow-items {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
	min-height: 100px;
}

.workflow-item-container {
	transition: all 0.2s ease;
}

.workflow-item {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0.75rem 1rem;
	background: var(--theme--background, #f8fafc);
	border: 1px solid var(--theme--border-color, #e5e7eb);
	border-radius: 6px;
	cursor: pointer;
	font-size: 0.875rem;
	line-height: 1.3;
	transition: all 0.2s ease;
	color: var(--theme--primary, #7c3aed);
	min-height: 48px;
}

.workflow-item:hover {
	background: var(--theme--background-accent, #ede9fe);
	border: 2px solid var(--theme--primary, #7c3aed);
	transform: translateY(-1px);
}

.workflow-item-content {
	display: flex;
	align-items: center;
	gap: 1rem;
	flex: 1;
}

.drag-handle {
	cursor: grab;
	color: var(--theme--foreground-subdued, #9ca3af);
	opacity: 0.7;
}

.drag-handle:hover {
	opacity: 1;
}

.workflow-title {
	flex: 1;
	font-size: large;
}

.remove-workflow-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 20px;
	height: 20px;
	background: transparent;
	color: var(--theme--danger, #ef4444);
	border: none;
	border-radius: 50%;
	cursor: pointer;
	transition: all 0.2s ease;
	opacity: 0.7;
}

.remove-workflow-btn:hover {
	background: var(--theme--danger-background, #fef2f2);
	opacity: 1;
	transform: scale(1.1);
}

.remove-workflow-btn .v-icon {
	font-size: 12px;
}

/* VueDraggable drag states */
.workflow-ghost {
	opacity: 0.5;
	background: var(--theme--primary-background, #e0e7ff) !important;
	transform: rotate(5deg);
}

.workflow-chosen {
	opacity: 0.8;
	transform: scale(1.05);
	box-shadow: 0 4px 8px var(--theme--primary-shadow, rgba(124, 58, 237, 0.2));
}

.workflow-drag {
	opacity: 0.9;
	transform: rotate(5deg);
	z-index: 1000;
}

/* Drag and Drop States */
.workflow-ghost {
	opacity: 0.5;
	background: var(--theme--primary-background-accent, #ddd6fe) !important;
}

.workflow-chosen {
	transform: rotate(2deg);
	box-shadow: 0 4px 8px var(--theme--shadow, rgba(0, 0, 0, 0.2));
}

.workflow-drag {
	transform: rotate(5deg);
	z-index: 1000;
}
</style>