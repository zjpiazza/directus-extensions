<template>
	<private-view title="Dashboard">
		<template #headline>
			<v-breadcrumb :items="[{ name: 'Dashboard', to: '/dashboard' }]" />
		</template>

		<template #title-outer:prepend>
			<v-button class="header-icon" rounded disabled icon secondary>
				<v-icon name="dashboard" />
			</v-button>
		</template>

		<template #actions>
			<v-button @click="createNewCase">
				<v-icon name="add" left />
				New Case
			</v-button>
		</template>

		<template #navigation>
			<navigation />
		</template>

		<div class="dashboard-container">
			<!-- Welcome Section -->
			<div class="welcome-section">
				<h1 class="dashboard-title">Dashboard</h1>
				<p class="dashboard-subtitle">Welcome back! Here's what's happening with your cases today.</p>
			</div>

			<!-- Stats Cards -->
			<div class="stats-grid">
				<stats-card
					label="Total Cases"
					:value="stats.totalCases"
					:subtitle="stats.totalCasesChange"
					icon="folder"
					variant="default"
				/>
				<stats-card
					label="Active Cases"
					:value="stats.activeCases"
					:subtitle="stats.activeCasesSubtitle"
					icon="description"
					variant="default"
				/>
				<stats-card
					label="Completed This Week"
					:value="stats.completedThisWeek"
					:subtitle="stats.completedThisWeekChange"
					icon="check_circle"
					variant="success"
				/>
			</div>

			<!-- Recent Cases -->
			<div class="content-section">
				<recent-cases />
			</div>

			<!-- Quick Actions -->
			<div class="content-section">
				<quick-actions />
			</div>
		</div>
	</private-view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useApi } from '@directus/extensions-sdk';
import StatsCard from './components/StatsCard.vue';
import RecentCases from './components/RecentCases.vue';
import QuickActions from './components/QuickActions.vue';
import Navigation from './components/Navigation.vue';

interface Stats {
	totalCases: number;
	totalCasesChange: string;
	activeCases: number;
	activeCasesSubtitle: string;
	completedThisWeek: number;
	completedThisWeekChange: string;
}

const api = useApi();

const stats = ref<Stats>({
	totalCases: 0,
	totalCasesChange: 'Loading...',
	activeCases: 0,
	activeCasesSubtitle: 'Loading...',
	completedThisWeek: 0,
	completedThisWeekChange: 'Loading...',
});

onMounted(async () => {
	await fetchStats();
});

async function fetchStats() {
	try {
		// Fetch total cases
		const totalResponse = await api.get('/items/cases', {
			params: {
				aggregate: { count: '*' },
			},
		});
		const totalCases = totalResponse.data.data?.[0]?.count || 0;

		// Fetch active cases
		const activeResponse = await api.get('/items/cases', {
			params: {
				filter: { status: { _neq: 'closed' } },
				aggregate: { count: '*' },
			},
		});
		const activeCases = activeResponse.data.data?.[0]?.count || 0;

		// Fetch completed this week
		const oneWeekAgo = new Date();
		oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
		
		const completedResponse = await api.get('/items/cases', {
			params: {
				filter: {
					status: { _eq: 'closed' },
					date_updated: { _gte: oneWeekAgo.toISOString() },
				},
				aggregate: { count: '*' },
			},
		});
		const completedThisWeek = completedResponse.data.data?.[0]?.count || 0;

		// Fetch last month's total for comparison
		const oneMonthAgo = new Date();
		oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
		
		const lastMonthResponse = await api.get('/items/cases', {
			params: {
				filter: {
					date_created: { _lt: oneMonthAgo.toISOString() },
				},
				aggregate: { count: '*' },
			},
		});
		const lastMonthTotal = lastMonthResponse.data.data?.[0]?.count || 0;

		// Calculate percentage changes
		const totalChange = lastMonthTotal > 0 
			? Math.round(((totalCases - lastMonthTotal) / lastMonthTotal) * 100)
			: 0;

		stats.value = {
			totalCases,
			totalCasesChange: totalChange > 0 
				? `+${totalChange}% from last month`
				: totalChange < 0 
					? `${totalChange}% from last month`
					: 'No change from last month',
			activeCases,
			activeCasesSubtitle: `${Math.round((activeCases / totalCases) * 100) || 0}% of total cases`,
			completedThisWeek,
			completedThisWeekChange: `${completedThisWeek} cases completed`,
		};
	} catch (error) {
		console.error('Error fetching dashboard stats:', error);
	}
}

function createNewCase() {
	// Navigate to create new case
	window.location.href = '/#/content/cases/+';
}
</script>

<style scoped>
.dashboard-container {
	padding: var(--content-padding);
	padding-top: 0;
	max-width: 1400px;
	margin: 0 auto;
}

.welcome-section {
	margin-bottom: 32px;
}

.dashboard-title {
	font-size: 28px;
	font-weight: 700;
	color: var(--theme--foreground);
	margin: 0 0 8px 0;
}

.dashboard-subtitle {
	font-size: 16px;
	color: var(--theme--foreground-subdued);
	margin: 0;
}

.stats-grid {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
	gap: 20px;
	margin-bottom: 32px;
}

.content-section {
	margin-bottom: 32px;
}

.content-section:last-child {
	margin-bottom: 0;
}

.header-icon {
	--v-button-width: 44px;
	--v-button-height: 44px;
	--v-button-background-color: var(--theme--primary-background);
	--v-button-color: var(--theme--primary);
	--v-button-background-color-hover: var(--theme--primary-subdued);
	--v-button-color-hover: var(--theme--primary);
}
</style>
