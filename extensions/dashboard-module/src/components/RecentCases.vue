<template>
	<div class="recent-cases">
		<div class="section-header">
			<div>
				<h2 class="section-title">Recent Cases</h2>
				<p class="section-subtitle">Latest case activity and updates</p>
			</div>
			<v-button small @click="viewAll">
				View All
				<v-icon name="arrow_forward" right small />
			</v-button>
		</div>

		<div v-if="loading" class="loading-state">
			<v-progress-circular indeterminate />
		</div>

		<div v-else-if="cases.length === 0" class="empty-state">
			<v-icon name="folder_open" large />
			<p>No recent cases found</p>
		</div>

		<div v-else class="cases-list">
			<div v-for="caseItem in cases" :key="caseItem.id" class="case-item">
				<div class="case-info">
					<div class="case-header">
						<span class="case-name">{{ caseItem.name }}</span>
						<span v-if="caseItem.category" class="case-category">
							{{ caseItem.category }}
						</span>
						<span v-if="caseItem.priority" class="case-badge" :class="`badge-${caseItem.priority.toLowerCase()}`">
							{{ caseItem.priority }}
						</span>
					</div>
					<div class="case-meta">
						<span class="case-id">{{ caseItem.case_number }}</span>
						<span class="case-status">{{ caseItem.status }}</span>
						<span v-if="caseItem.assigned_to" class="case-assigned">
							• {{ caseItem.assigned_to }}
						</span>
					</div>
					<div class="case-updated">
						{{ formatUpdateTime(caseItem.date_updated) }}
					</div>
				</div>
				<v-button small outlined @click="viewCase(caseItem.id)">
					View
				</v-button>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useApi } from '@directus/extensions-sdk';
import { formatDistanceToNow } from 'date-fns';

interface CaseItem {
	id: string;
	case_number: string;
	name: string;
	status: string;
	category?: string;
	priority?: string;
	assigned_to?: string;
	date_updated: string;
}

const api = useApi();
const cases = ref<CaseItem[]>([]);
const loading = ref(true);

onMounted(async () => {
	await fetchRecentCases();
});

async function fetchRecentCases() {
	try {
		loading.value = true;
		const response = await api.get('/items/cases', {
			params: {
				sort: '-date_updated',
				limit: 5,
				fields: ['id', 'case_number', 'name', 'status', 'category', 'priority', 'assigned_to', 'date_updated'],
			},
		});
		cases.value = response.data.data;
	} catch (error) {
		console.error('Error fetching recent cases:', error);
	} finally {
		loading.value = false;
	}
}

function formatUpdateTime(dateString: string) {
	try {
		return 'Updated ' + formatDistanceToNow(new Date(dateString), { addSuffix: true });
	} catch {
		return '';
	}
}

function viewCase(id: string) {
	window.location.href = `/#/content/cases/${id}`;
}

function viewAll() {
	window.location.href = '/#/content/cases';
}
</script>

<style scoped>
.recent-cases {
	background: var(--theme--background);
	border: var(--theme--border-width) solid var(--theme--border-color-subdued);
	border-radius: var(--theme--border-radius);
	padding: 24px;
}

.section-header {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
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

.loading-state,
.empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 40px;
	color: var(--theme--foreground-subdued);
}

.empty-state p {
	margin-top: 12px;
}

.cases-list {
	display: flex;
	flex-direction: column;
	gap: 12px;
}

.case-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 16px;
	background: var(--theme--background-subdued);
	border-radius: var(--theme--border-radius);
	transition: all var(--fast) var(--transition);
}

.case-item:hover {
	background: var(--theme--background-accent);
}

.case-info {
	flex: 1;
	min-width: 0;
}

.case-header {
	display: flex;
	align-items: center;
	gap: 8px;
	margin-bottom: 6px;
	flex-wrap: wrap;
}

.case-name {
	font-size: 15px;
	font-weight: 600;
	color: var(--theme--foreground);
}

.case-category {
	font-size: 13px;
	color: var(--theme--foreground-subdued);
	text-transform: uppercase;
	font-weight: 500;
}

.case-badge {
	display: inline-block;
	padding: 2px 8px;
	border-radius: 12px;
	font-size: 11px;
	font-weight: 600;
	text-transform: uppercase;
}

.badge-high {
	background: var(--theme--danger-background);
	color: var(--theme--danger);
}

.badge-medium {
	background: var(--theme--warning-background);
	color: var(--theme--warning);
}

.badge-low {
	background: var(--theme--primary-background);
	color: var(--theme--primary);
}

.case-meta {
	display: flex;
	align-items: center;
	gap: 8px;
	font-size: 13px;
	color: var(--theme--foreground-subdued);
	margin-bottom: 4px;
}

.case-id {
	font-weight: 500;
}

.case-updated {
	font-size: 12px;
	color: var(--theme--foreground-subdued);
}
</style>
