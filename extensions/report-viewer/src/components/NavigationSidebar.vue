<template>
	<div class="navigation-sidebar">
		<div class="sidebar-header">
			<h2>Reports</h2>
			<v-button icon rounded x-small :loading="loading" @click="$emit('refresh')">
				<v-icon name="refresh" />
			</v-button>
		</div>

		<div v-if="loading" class="loading-state">
			<v-progress-circular indeterminate />
		</div>

		<div v-else-if="categories.length === 0" class="empty-state">
			<v-icon name="inbox" />
			<p>No reports found</p>
		</div>

		<div v-else class="categories-list">
			<div v-for="category in categories" :key="category.CategoryId" class="category">
				<div class="category-header">
					<v-icon name="folder" small />
					<span>{{ category.Name }}</span>
				</div>
				<div class="reports-list">
					<div
						v-for="report in category.Reports"
						:key="report.Id"
						:class="['report-item', { active: report.Id === currentReportId }]"
						@click="$emit('select', report.Id)"
					>
						<v-icon name="description" small />
						<span class="report-name">{{ report.Name }}</span>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
defineProps<{
	reports: BoldReportItem[];
	categories: BoldReportCategory[];
	loading: boolean;
	currentReportId?: string;
}>();

defineEmits<{
	select: [reportId: string];
	refresh: [];
}>();
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

.categories-list {
	display: flex;
	flex-direction: column;
	gap: 1.5rem;
}

.category-header {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	padding: 0.5rem 0;
	font-weight: 500;
	color: var(--theme--foreground-subdued);
	font-size: 0.875rem;
	text-transform: uppercase;
	letter-spacing: 0.05em;
}

.reports-list {
	display: flex;
	flex-direction: column;
	gap: 0.25rem;
	margin-top: 0.5rem;
}

.report-item {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	padding: 0.5rem 0.75rem;
	border-radius: var(--theme--border-radius);
	cursor: pointer;
	transition: background-color 0.2s;
	color: var(--theme--foreground-subdued);
}

.report-item:hover {
	background-color: var(--theme--background-accent);
	color: var(--theme--foreground);
}

.report-item.active {
	background-color: var(--theme--primary);
	color: var(--white);
}

.report-item.active .v-icon {
	--v-icon-color: var(--white);
}

.report-name {
	flex: 1;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}
</style>
