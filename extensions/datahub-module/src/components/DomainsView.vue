<template>
	<private-view title="DataHub - Domains">
		<template #headline>
			<v-breadcrumb :items="[
				{ name: 'DataHub', to: '/datahub' },
				{ name: 'Domains', to: '/datahub/domains' }
			]" />
		</template>

		<template #title>
			<h1 class="type-title">Domain Governance</h1>
		</template>

		<template #actions>
			<v-button icon rounded @click="refreshDomains">
				<v-icon name="refresh" />
			</v-button>
		</template>

		<div class="domains-container">
			<div v-if="loading" class="loading-state">
				<v-progress-circular indeterminate />
				<p>Loading domains...</p>
			</div>

			<div v-else-if="error" class="error-state">
				<v-icon name="error" large />
				<p>{{ error }}</p>
				<v-button @click="refreshDomains">Retry</v-button>
			</div>

			<div v-else class="domains-content">
				<div v-if="domains.length === 0" class="empty-state">
					<v-icon name="domain" large />
					<h3>No Domains Found</h3>
					<p>Domains will appear here once configured in DataHub.</p>
				</div>

				<div v-else class="domains-grid">
					<div
						v-for="domain in domains"
						:key="domain.urn"
						class="domain-card"
					>
						<div class="domain-header">
							<v-icon name="domain" />
							<h4>{{ domain.name }}</h4>
							<span class="entity-count">{{ domain.entityCount || 0 }} assets</span>
						</div>
						<p v-if="domain.description" class="domain-description">
							{{ domain.description }}
						</p>
						<div v-if="domain.parentDomain" class="parent-domain">
							<span class="parent-label">Parent:</span>
							<span class="parent-name">{{ domain.parentDomain }}</span>
						</div>
						<div class="domain-urn">
							<code>{{ domain.urn }}</code>
						</div>
					</div>
				</div>
			</div>
		</div>
	</private-view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useDataHubClient } from '../composables/useDataHubClient';

interface Domain {
	urn: string;
	name: string;
	description?: string;
	parentDomain?: string;
	entityCount?: number;
}

const loading = ref(false);
const error = ref<string | null>(null);
const domains = ref<Domain[]>([]);

// Mock data for now - in a real implementation, this would query DataHub's domains API
const mockDomains: Domain[] = [
	{
		urn: 'urn:li:domain:engineering',
		name: 'Engineering',
		description: 'Data assets owned by the engineering team',
		entityCount: 25
	},
	{
		urn: 'urn:li:domain:marketing',
		name: 'Marketing',
		description: 'Marketing analytics and campaign data',
		entityCount: 12
	},
	{
		urn: 'urn:li:domain:finance',
		name: 'Finance',
		description: 'Financial reporting and transactional data',
		entityCount: 18
	},
	{
		urn: 'urn:li:domain:hr',
		name: 'Human Resources',
		description: 'Employee and HR-related data assets',
		entityCount: 7
	}
];

async function refreshDomains() {
	loading.value = true;
	error.value = null;

	try {
		// TODO: Implement actual DataHub domains API call
		// For now, simulate API delay and use mock data
		await new Promise(resolve => setTimeout(resolve, 1000));
		domains.value = mockDomains;
	} catch (err) {
		error.value = err instanceof Error ? err.message : 'Failed to load domains';
	} finally {
		loading.value = false;
	}
}

onMounted(() => {
	refreshDomains();
});
</script>

<style scoped>
.domains-container {
	height: 100%;
	padding: var(--content-padding);
	padding-top: 0;
}

.loading-state,
.error-state,
.empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	height: 100%;
	gap: 1rem;
	color: var(--theme--foreground-subdued);
}

.loading-state .v-icon,
.error-state .v-icon,
.empty-state .v-icon {
	--v-icon-color: var(--theme--primary);
	margin-bottom: 1rem;
	font-size: 4rem;
}

.domains-content {
	display: flex;
	flex-direction: column;
	gap: 1.5rem;
	height: 100%;
}

.domains-grid {
	display: grid;
	gap: 1rem;
	grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
}

.domain-card {
	padding: 1.5rem;
	background: var(--theme--background-subdued);
	border-radius: var(--theme--border-radius);
	border: 2px solid transparent;
	transition: all var(--fast) var(--transition);
}

.domain-card:hover {
	border-color: var(--theme--primary);
	transform: translateY(-2px);
}

.domain-header {
	display: flex;
	align-items: center;
	gap: 0.75rem;
	margin-bottom: 0.75rem;
}

.domain-header .v-icon {
	--v-icon-color: var(--theme--primary);
}

.domain-header h4 {
	margin: 0;
	font-size: 1.1rem;
	font-weight: 600;
	flex: 1;
}

.entity-count {
	padding: 0.25rem 0.5rem;
	background: var(--theme--primary-background);
	color: var(--theme--primary);
	border-radius: var(--theme--border-radius);
	font-size: 0.75rem;
	font-weight: 500;
}

.domain-description {
	margin: 0 0 0.75rem 0;
	font-size: 0.875rem;
	color: var(--theme--foreground-subdued);
	line-height: 1.5;
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
	overflow: hidden;
}

.parent-domain {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	margin-bottom: 0.5rem;
	font-size: 0.875rem;
}

.parent-label {
	color: var(--theme--foreground-subdued);
	font-weight: 500;
}

.parent-name {
	color: var(--theme--foreground);
	font-weight: 600;
}

.domain-urn {
	margin-top: 0.5rem;
}

.domain-urn code {
	font-size: 0.75rem;
	color: var(--theme--foreground-subdued);
	background: var(--theme--background);
	padding: 0.25rem 0.5rem;
	border-radius: var(--theme--border-radius);
	font-family: monospace;
}
</style>