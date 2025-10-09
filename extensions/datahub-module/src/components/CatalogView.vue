<template>
	<private-view title="DataHub - Catalog">
		<template #headline>
			<v-breadcrumb :items="[
				{ name: 'DataHub', to: '/datahub' },
				{ name: 'Catalog', to: '/datahub/catalog' }
			]" />
		</template>

		<template #title>
			<h1 class="type-title">Data Catalog</h1>
		</template>

		<template #actions>
			<v-button v-if="!showSettings" icon rounded @click="showSettings = true">
				<v-icon name="settings" />
			</v-button>
		</template>

		<div class="catalog-container">
			<settings-panel
				v-if="showSettings"
				:server-url="serverUrl"
				:auth-token="authToken"
				@update:serverUrl="serverUrl = $event"
				@update:authToken="authToken = $event"
				@close="showSettings = false"
				@save="saveSettings"
			/>

			<div v-else-if="!isConfigured" class="config-message">
				<v-icon name="settings" large />
				<p>Please configure your DataHub connection settings</p>
				<v-button @click="showSettings = true">Open Settings</v-button>
			</div>

			<div v-else class="catalog-content">
				<div class="search-section">
					<v-input
						v-model="searchQuery"
						placeholder="Search datasets, tables, dashboards..."
						@input="debouncedSearch"
					>
						<template #prepend>
							<v-icon name="search" />
						</template>
					</v-input>
				</div>

				<div v-if="loading" class="loading-state">
					<v-progress-circular indeterminate />
					<p>Loading DataHub catalog...</p>
				</div>

				<div v-else-if="error" class="error-state">
					<v-icon name="error" large />
					<p>{{ error }}</p>
					<v-button @click="loadCatalog">Retry</v-button>
				</div>

				<div v-else class="results">
					<div v-if="datasets.length === 0" class="no-results">
						<v-icon name="inbox" large />
						<p>No datasets found</p>
					</div>

					<div v-else class="dataset-list">
						<div
							v-for="dataset in datasets"
							:key="dataset.urn"
							class="dataset-card"
							@click="selectDataset(dataset)"
						>
							<div class="dataset-header">
								<v-icon :name="getEntityIcon(dataset.type)" />
								<h3>{{ dataset.name }}</h3>
								<span v-if="dataset.platform" class="platform-badge">
									{{ dataset.platform }}
								</span>
							</div>
							<p v-if="dataset.description" class="dataset-description">
								{{ dataset.description }}
							</p>
							<div v-if="dataset.tags && dataset.tags.length > 0" class="dataset-tags">
								<span v-for="tag in dataset.tags" :key="tag" class="tag">
									{{ tag }}
								</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</private-view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import SettingsPanel from './SettingsPanel.vue';
import { useDataHubClient } from '../composables/useDataHubClient';

interface Dataset {
	urn: string;
	name: string;
	type: string;
	platform?: string;
	description?: string;
	tags?: string[];
}

const showSettings = ref(false);
const serverUrl = ref(localStorage.getItem('datahub_server_url') || '');
const authToken = ref(localStorage.getItem('datahub_auth_token') || '');
const searchQuery = ref('');
const datasets = ref<Dataset[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

const isConfigured = computed(() => serverUrl.value && authToken.value);

const { searchEntities } = useDataHubClient(serverUrl, authToken);

let debounceTimer: ReturnType<typeof setTimeout>;
function debouncedSearch() {
	clearTimeout(debounceTimer);
	debounceTimer = setTimeout(() => {
		loadCatalog();
	}, 300);
}

async function loadCatalog() {
	if (!isConfigured.value) return;

	loading.value = true;
	error.value = null;

	try {
		const results = await searchEntities(searchQuery.value);
		datasets.value = results;
	} catch (err) {
		error.value = err instanceof Error ? err.message : 'Failed to load DataHub catalog';
	} finally {
		loading.value = false;
	}
}

function selectDataset(dataset: Dataset) {
	console.log('Selected dataset:', dataset);
}

function getEntityIcon(type: string): string {
	const iconMap: Record<string, string> = {
		dataset: 'table_chart',
		dashboard: 'dashboard',
		chart: 'bar_chart',
		dataFlow: 'device_hub',
		dataJob: 'settings_ethernet',
	};
	return iconMap[type] || 'storage';
}

function saveSettings() {
	localStorage.setItem('datahub_server_url', serverUrl.value);
	localStorage.setItem('datahub_auth_token', authToken.value);
	showSettings.value = false;
	loadCatalog();
}

onMounted(() => {
	if (isConfigured.value) {
		loadCatalog();
	}
});
</script>

<style scoped>
.catalog-container {
	height: 100%;
	padding: var(--content-padding);
	padding-top: 0;
}

.config-message,
.loading-state,
.error-state,
.no-results {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	height: 100%;
	gap: 1rem;
	color: var(--theme--foreground-subdued);
}

.config-message .v-icon,
.error-state .v-icon,
.no-results .v-icon {
	--v-icon-color: var(--theme--primary);
	margin-bottom: 1rem;
}

.catalog-content {
	display: flex;
	flex-direction: column;
	gap: 1.5rem;
	height: 100%;
}

.search-section {
	position: sticky;
	top: 0;
	background: var(--theme--background);
	z-index: 10;
	padding-bottom: 1rem;
}

.results {
	flex: 1;
	overflow-y: auto;
}

.dataset-list {
	display: grid;
	gap: 1rem;
	grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
}

.dataset-card {
	padding: 1.5rem;
	background: var(--theme--background-subdued);
	border-radius: var(--theme--border-radius);
	cursor: pointer;
	transition: all var(--fast) var(--transition);
	border: 2px solid transparent;
}

.dataset-card:hover {
	border-color: var(--theme--primary);
	transform: translateY(-2px);
}

.dataset-header {
	display: flex;
	align-items: center;
	gap: 0.75rem;
	margin-bottom: 0.75rem;
}

.dataset-header h3 {
	flex: 1;
	margin: 0;
	font-size: 1rem;
	font-weight: 600;
}

.platform-badge {
	padding: 0.25rem 0.5rem;
	background: var(--theme--primary-background);
	color: var(--theme--primary);
	border-radius: var(--theme--border-radius);
	font-size: 0.75rem;
	font-weight: 500;
}

.dataset-description {
	margin: 0 0 0.75rem 0;
	font-size: 0.875rem;
	color: var(--theme--foreground-subdued);
	line-height: 1.5;
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
	overflow: hidden;
}

.dataset-tags {
	display: flex;
	flex-wrap: wrap;
	gap: 0.5rem;
}

.tag {
	padding: 0.25rem 0.5rem;
	background: var(--theme--background);
	border-radius: var(--theme--border-radius);
	font-size: 0.75rem;
}
</style>