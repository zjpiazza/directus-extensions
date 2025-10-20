<template>
	<div class="navigation-sidebar">
		<div class="sidebar-header">
			<h2>Programs</h2>
			<v-button icon rounded x-small :loading="loading" @click="$emit('refresh')">
				<v-icon name="refresh" />
			</v-button>
		</div>

		<div v-if="loading" class="loading-state">
			<v-progress-circular indeterminate />
		</div>

		<div v-else-if="programs.length === 0" class="empty-state">
			<v-icon name="inbox" />
			<p>No programs found</p>
		</div>

		<div v-else class="programs-list">
			<div
				v-for="program in programs"
				:key="program.id"
				:class="['program-item', { active: program.id === currentProgramId }]"
				@click="$emit('select', program.id)"
			>
				<v-icon name="folder" small />
				<span class="program-name">{{ program.name }}</span>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
defineProps<{
	programs: Array<{ id: string | number; name: string }>
	loading: boolean
	currentProgramId?: string | number | null
}>()

defineEmits<{
	select: [programId: string | number]
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

.programs-list {
	display: flex;
	flex-direction: column;
	gap: 0.25rem;
}

.program-item {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	padding: 0.5rem 0.75rem;
	border-radius: var(--theme--border-radius);
	cursor: pointer;
	transition: background-color 0.2s;
	color: var(--theme--foreground-subdued);
}

.program-item:hover {
	background-color: var(--theme--background-accent);
	color: var(--theme--foreground);
}

.program-item.active {
	background-color: var(--theme--primary);
	color: var(--white);
}

.program-item.active .v-icon {
	--v-icon-color: var(--white);
}

.program-name {
	flex: 1;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}
</style>
