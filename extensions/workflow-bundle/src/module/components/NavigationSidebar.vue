<template>
	<div class="navigation-sidebar">
		<div class="sidebar-header">
			<h2>Workflows</h2>
			<v-button icon rounded x-small :loading="loading" @click="$emit('refresh')">
				<v-icon name="refresh" />
			</v-button>
		</div>

		<div v-if="loading" class="loading-state">
			<v-progress-circular indeterminate />
		</div>

		<div v-else-if="workflows.length === 0" class="empty-state">
			<v-icon name="inbox" />
			<p>No workflows found</p>
		</div>

		<div v-else class="workflows-list">
			<div
				v-for="workflow in workflows"
				:key="workflow.id"
				:class="['workflow-item', { active: workflow.id === currentWorkflowId }]"
				@click="$emit('select', workflow.id)"
			>
				<v-icon name="description" small />
				<span class="workflow-name">{{ workflow.name }}</span>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
defineProps<{
	workflows: Array<{ id: string | number; name: string }>
	loading: boolean
	currentWorkflowId?: string | number | null
}>()

defineEmits<{
	select: [workflowId: string | number]
	refresh: []
}>()
</script>

<style scoped>
.navigation-sidebar {
	padding: var(--content-padding);
	height: 100%;
	overflow-y: auto;
}

.sidebar-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 1.5rem;
}

.sidebar-header h2 {
	font-size: 1rem;
	font-weight: 600;
	color: var(--theme--foreground);
}

.loading-state,
.empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 2rem;
	gap: 1rem;
	color: var(--theme--foreground-subdued);
}

.workflows-list {
	display: flex;
	flex-direction: column;
	gap: 0.25rem;
}

.workflow-item {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	padding: 0.5rem 0.75rem;
	border-radius: var(--theme--border-radius);
	cursor: pointer;
	transition: background-color 0.2s;
	color: var(--theme--foreground-subdued);
}

.workflow-item:hover {
	background-color: var(--theme--background-accent);
	color: var(--theme--foreground);
}

.workflow-item.active {
	background-color: var(--theme--primary);
	color: var(--white);
}

.workflow-item.active .v-icon {
	--v-icon-color: var(--white);
}

.workflow-name {
	flex: 1;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}
</style>
