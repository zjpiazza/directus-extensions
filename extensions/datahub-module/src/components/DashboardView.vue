<template>
	<private-view title="DataHub Dashboard">
		<template #headline>
			<v-breadcrumb :items="[{ name: 'DataHub', to: '/datahub' }]" />
		</template>

		<template #title>
			<h1 class="type-title">DataHub Dashboard</h1>
		</template>

		<template #actions>
			<v-button icon rounded @click="refreshDashboard">
				<v-icon name="refresh" />
			</v-button>
		</template>

		<div class="dashboard-container">
			<div v-if="loading" class="loading-state">
				<v-progress-circular indeterminate />
				<p>Loading dashboard...</p>
			</div>

			<div v-else-if="error" class="error-state">
				<v-icon name="error" large />
				<p>{{ error }}</p>
				<v-button @click="refreshDashboard">Retry</v-button>
			</div>

			<div v-else class="dashboard-content">
				<!-- Quick Stats Cards -->
				<div class="stats-grid">
					<div class="stat-card" @click="$router.push('/datahub/catalog')">
						<div class="stat-icon">
							<v-icon name="table_chart" />
						</div>
						<div class="stat-content">
							<h3>{{ stats.datasets }}</h3>
							<p>Datasets</p>
						</div>
						<v-icon name="arrow_forward" class="stat-arrow" />
					</div>

					<div class="stat-card" @click="$router.push('/datahub/glossary')">
						<div class="stat-icon">
							<v-icon name="library_books" />
						</div>
						<div class="stat-content">
							<h3>{{ stats.glossaryTerms }}</h3>
							<p>Glossary Terms</p>
						</div>
						<v-icon name="arrow_forward" class="stat-arrow" />
					</div>

					<div class="stat-card" @click="$router.push('/datahub/tags')">
						<div class="stat-icon">
							<v-icon name="local_offer" />
						</div>
						<div class="stat-content">
							<h3>{{ stats.tags }}</h3>
							<p>Tags</p>
						</div>
						<v-icon name="arrow_forward" class="stat-arrow" />
					</div>

					<div class="stat-card" @click="$router.push('/datahub/domains')">
						<div class="stat-icon">
							<v-icon name="domain" />
						</div>
						<div class="stat-content">
							<h3>{{ stats.domains }}</h3>
							<p>Domains</p>
						</div>
						<v-icon name="arrow_forward" class="stat-arrow" />
					</div>
				</div>

				<!-- Recent Activity Section -->
				<div class="recent-activity">
					<h2>Quick Actions</h2>
					<div class="action-grid">
						<div class="action-card" @click="$router.push('/datahub/catalog')">
							<v-icon name="search" />
							<h4>Browse Catalog</h4>
							<p>Search and explore data assets</p>
						</div>

						<div class="action-card" @click="$router.push('/datahub/glossary')">
							<v-icon name="library_books" />
							<h4>Manage Glossary</h4>
							<p>Define business terms and concepts</p>
						</div>

						<div class="action-card" @click="$router.push('/datahub/tags')">
							<v-icon name="local_offer" />
							<h4>Organize Tags</h4>
							<p>Manage metadata tags</p>
						</div>

						<div class="action-card" @click="$router.push('/datahub/domains')">
							<v-icon name="domain" />
							<h4>Govern Domains</h4>
							<p>Set up data governance domains</p>
						</div>
					</div>
				</div>

				<!-- Connection Status -->
				<div class="connection-status">
					<div class="status-card">
						<div class="status-indicator" :class="{ connected: isConnected, disconnected: !isConnected }">
							<v-icon :name="isConnected ? 'check_circle' : 'error'" />
						</div>
						<div class="status-content">
							<h4>DataHub Connection</h4>
							<p>{{ isConnected ? 'Connected' : 'Disconnected' }}</p>
							<small v-if="connectionUrl">{{ connectionUrl }}</small>
						</div>
					</div>
				</div>
			</div>
		</div>
	</private-view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useDataHubClient } from '../composables/useDataHubClient';

interface DashboardStats {
	datasets: number;
	glossaryTerms: number;
	tags: number;
	domains: number;
}

const loading = ref(false);
const error = ref<string | null>(null);
const stats = ref<DashboardStats>({
	datasets: 0,
	glossaryTerms: 0,
	tags: 0,
	domains: 0,
});

const serverUrl = ref(localStorage.getItem('datahub_server_url') || '');
const authToken = ref(localStorage.getItem('datahub_auth_token') || '');

const isConnected = computed(() => serverUrl.value && authToken.value);
const connectionUrl = computed(() => serverUrl.value ? new URL(serverUrl.value).hostname : '');

const { searchEntities } = useDataHubClient(serverUrl, authToken);

async function refreshDashboard() {
	loading.value = true;
	error.value = null;

	try {
		// Mock data for now - in a real implementation, this would query DataHub APIs
		// for actual counts from each section
		await new Promise(resolve => setTimeout(resolve, 1000));

		if (isConnected.value) {
			// Try to get real dataset count
			try {
				const results = await searchEntities('');
				stats.value.datasets = results.length;
			} catch {
				stats.value.datasets = 0;
			}
		}

		// Mock counts for other sections
		stats.value.glossaryTerms = 3;
		stats.value.tags = 4;
		stats.value.domains = 4;

	} catch (err) {
		error.value = err instanceof Error ? err.message : 'Failed to load dashboard';
	} finally {
		loading.value = false;
	}
}

onMounted(() => {
	refreshDashboard();
});
</script>

<style scoped>
.dashboard-container {
	height: 100%;
	padding: var(--content-padding);
	padding-top: 0;
}

.loading-state,
.error-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	height: 100%;
	gap: 1rem;
	color: var(--theme--foreground-subdued);
}

.loading-state .v-icon,
.error-state .v-icon {
	--v-icon-color: var(--theme--primary);
	margin-bottom: 1rem;
	font-size: 4rem;
}

.dashboard-content {
	display: flex;
	flex-direction: column;
	gap: 2rem;
	height: 100%;
}

.stats-grid {
	display: grid;
	gap: 1rem;
	grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
	margin-bottom: 1rem;
}

.stat-card {
	display: flex;
	align-items: center;
	gap: 1rem;
	padding: 1.5rem;
	background: var(--theme--background-subdued);
	border-radius: var(--theme--border-radius);
	cursor: pointer;
	transition: all var(--fast) var(--transition);
	border: 2px solid transparent;
}

.stat-card:hover {
	border-color: var(--theme--primary);
	transform: translateY(-2px);
}

.stat-icon {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 3rem;
	height: 3rem;
	background: var(--theme--primary-background);
	border-radius: 50%;
}

.stat-icon .v-icon {
	--v-icon-color: var(--theme--primary);
	font-size: 1.5rem;
}

.stat-content {
	flex: 1;
}

.stat-content h3 {
	margin: 0 0 0.25rem 0;
	font-size: 2rem;
	font-weight: 700;
	color: var(--theme--foreground);
}

.stat-content p {
	margin: 0;
	font-size: 0.875rem;
	color: var(--theme--foreground-subdued);
	font-weight: 500;
}

.stat-arrow {
	--v-icon-color: var(--theme--foreground-subdued);
	opacity: 0.5;
}

.recent-activity {
	margin-bottom: 2rem;
}

.recent-activity h2 {
	margin: 0 0 1rem 0;
	font-size: 1.25rem;
	font-weight: 600;
	color: var(--theme--foreground);
}

.action-grid {
	display: grid;
	gap: 1rem;
	grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
}

.action-card {
	padding: 1.5rem;
	background: var(--theme--background-subdued);
	border-radius: var(--theme--border-radius);
	cursor: pointer;
	transition: all var(--fast) var(--transition);
	border: 2px solid transparent;
	text-align: center;
}

.action-card:hover {
	border-color: var(--theme--primary);
	transform: translateY(-2px);
}

.action-card .v-icon {
	--v-icon-color: var(--theme--primary);
	font-size: 2rem;
	margin-bottom: 0.75rem;
}

.action-card h4 {
	margin: 0 0 0.5rem 0;
	font-size: 1rem;
	font-weight: 600;
	color: var(--theme--foreground);
}

.action-card p {
	margin: 0;
	font-size: 0.875rem;
	color: var(--theme--foreground-subdued);
	line-height: 1.4;
}

.connection-status {
	margin-top: auto;
}

.status-card {
	display: flex;
	align-items: center;
	gap: 1rem;
	padding: 1rem;
	background: var(--theme--background-subdued);
	border-radius: var(--theme--border-radius);
}

.status-indicator {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 2rem;
	height: 2rem;
	border-radius: 50%;
}

.status-indicator.connected {
	background: var(--theme--success-background);
}

.status-indicator.connected .v-icon {
	--v-icon-color: var(--theme--success);
}

.status-indicator.disconnected {
	background: var(--theme--danger-background);
}

.status-indicator.disconnected .v-icon {
	--v-icon-color: var(--theme--danger);
}

.status-content h4 {
	margin: 0 0 0.25rem 0;
	font-size: 1rem;
	font-weight: 600;
	color: var(--theme--foreground);
}

.status-content p {
	margin: 0 0 0.25rem 0;
	font-size: 0.875rem;
	color: var(--theme--foreground-subdued);
}

.status-content small {
	font-size: 0.75rem;
	color: var(--theme--foreground-subdued);
	font-family: monospace;
}
</style>