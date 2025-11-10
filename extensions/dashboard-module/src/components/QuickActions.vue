<template>
	<div class="quick-actions">
		<div class="section-header">
			<h2 class="section-title">Quick Actions</h2>
			<p class="section-subtitle">Common tasks and workflows</p>
		</div>

		<div class="actions-grid">
			<div
				v-for="action in actions"
				:key="action.id"
				class="action-card"
				@click="handleAction(action)"
			>
				<v-icon :name="action.icon" class="action-icon" />
				<span class="action-label">{{ action.label }}</span>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
interface QuickAction {
	id: string;
	label: string;
	icon: string;
	route?: string;
	action?: () => void;
}

const actions: QuickAction[] = [
	{
		id: 'design-workflow',
		label: 'Design Workflow',
		icon: 'description',
		route: '/#/content/workflows',
	},
	{
		id: 'create-form',
		label: 'Create Form',
		icon: 'description',
		route: '/#/content/forms',
	},
	{
		id: 'configure-framework',
		label: 'Configure Framework',
		icon: 'settings',
		route: '/#/settings',
	},
	{
		id: 'generate-report',
		label: 'Generate Report',
		icon: 'trending_up',
		route: '/#/report-viewer',
	},
];

function handleAction(action: QuickAction) {
	if (action.action) {
		action.action();
	} else if (action.route) {
		window.location.href = action.route;
	}
}
</script>

<style scoped>
.quick-actions {
	background: var(--theme--background);
	border: var(--theme--border-width) solid var(--theme--border-color-subdued);
	border-radius: var(--theme--border-radius);
	padding: 24px;
}

.section-header {
	margin-bottom: 20px;
}

.section-title {
	font-size: 18px;
	font-weight: 700;
	color: var(--theme--foreground);
	margin: 0 0 4px 0;
}

.section-subtitle {
	font-size: 14px;
	color: var(--theme--foreground-subdued);
	margin: 0;
}

.actions-grid {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
	gap: 16px;
}

.action-card {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 32px 24px;
	background: var(--theme--background-subdued);
	border: var(--theme--border-width) solid var(--theme--border-color-subdued);
	border-radius: var(--theme--border-radius);
	cursor: pointer;
	transition: all var(--fast) var(--transition);
	text-align: center;
}

.action-card:hover {
	background: var(--theme--background-accent);
	border-color: var(--theme--primary);
	transform: translateY(-2px);
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.action-icon {
	font-size: 32px;
	color: var(--theme--foreground-subdued);
	margin-bottom: 12px;
	transition: color var(--fast) var(--transition);
}

.action-card:hover .action-icon {
	color: var(--theme--primary);
}

.action-label {
	font-size: 14px;
	font-weight: 600;
	color: var(--theme--foreground);
}
</style>
