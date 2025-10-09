<template>
	<private-view title="DataHub - Glossary">
		<template #headline>
			<v-breadcrumb :items="[
				{ name: 'DataHub', to: '/datahub' },
				{ name: 'Glossary', to: '/datahub/glossary' }
			]" />
		</template>

		<template #title>
			<h1 class="type-title">Business Glossary</h1>
		</template>

		<template #actions>
			<v-button icon rounded @click="refreshGlossary">
				<v-icon name="refresh" />
			</v-button>
		</template>

		<div class="glossary-container">
			<div v-if="loading" class="loading-state">
				<v-progress-circular indeterminate />
				<p>Loading business glossary...</p>
			</div>

			<div v-else-if="error" class="error-state">
				<v-icon name="error" large />
				<p>{{ error }}</p>
				<v-button @click="refreshGlossary">Retry</v-button>
			</div>

			<div v-else class="glossary-content">
				<div v-if="glossaryTerms.length === 0" class="empty-state">
					<v-icon name="library_books" large />
					<h3>No Glossary Terms Found</h3>
					<p>Business glossary terms will appear here once configured in DataHub.</p>
				</div>

				<div v-else class="glossary-grid">
					<div
						v-for="term in glossaryTerms"
						:key="term.urn"
						class="glossary-card"
					>
						<div class="glossary-header">
							<v-icon name="label" />
							<h4>{{ term.name }}</h4>
						</div>
						<p v-if="term.description" class="glossary-description">
							{{ term.description }}
						</p>
						<div v-if="term.customProperties" class="glossary-properties">
							<span
								v-for="[key, value] in Object.entries(term.customProperties)"
								:key="key"
								class="property-badge"
							>
								{{ key }}: {{ value }}
							</span>
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

interface GlossaryTerm {
	urn: string;
	name: string;
	description?: string;
	customProperties?: Record<string, any>;
}

const loading = ref(false);
const error = ref<string | null>(null);
const glossaryTerms = ref<GlossaryTerm[]>([]);

// Mock data for now - in a real implementation, this would query DataHub's glossary API
const mockGlossaryTerms: GlossaryTerm[] = [
	{
		urn: 'urn:li:glossaryTerm:Customer',
		name: 'Customer',
		description: 'An individual or organization that purchases goods or services',
		customProperties: { dataClassification: 'Public', sensitivity: 'Low' }
	},
	{
		urn: 'urn:li:glossaryTerm:Revenue',
		name: 'Revenue',
		description: 'Total income generated from sales of goods or services',
		customProperties: { dataClassification: 'Internal', sensitivity: 'Medium' }
	},
	{
		urn: 'urn:li:glossaryTerm:GDPR',
		name: 'GDPR Compliance',
		description: 'Compliance with General Data Protection Regulation requirements',
		customProperties: { dataClassification: 'Confidential', sensitivity: 'High' }
	}
];

async function refreshGlossary() {
	loading.value = true;
	error.value = null;

	try {
		// TODO: Implement actual DataHub glossary API call
		// For now, simulate API delay and use mock data
		await new Promise(resolve => setTimeout(resolve, 1000));
		glossaryTerms.value = mockGlossaryTerms;
	} catch (err) {
		error.value = err instanceof Error ? err.message : 'Failed to load glossary';
	} finally {
		loading.value = false;
	}
}

onMounted(() => {
	refreshGlossary();
});
</script>

<style scoped>
.glossary-container {
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

.glossary-content {
	display: flex;
	flex-direction: column;
	gap: 1.5rem;
	height: 100%;
}

.glossary-grid {
	display: grid;
	gap: 1rem;
	grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
}

.glossary-card {
	padding: 1.5rem;
	background: var(--theme--background-subdued);
	border-radius: var(--theme--border-radius);
	border: 2px solid transparent;
	transition: all var(--fast) var(--transition);
}

.glossary-card:hover {
	border-color: var(--theme--primary);
	transform: translateY(-2px);
}

.glossary-header {
	display: flex;
	align-items: center;
	gap: 0.75rem;
	margin-bottom: 0.75rem;
}

.glossary-header .v-icon {
	--v-icon-color: var(--theme--primary);
}

.glossary-header h4 {
	margin: 0;
	font-size: 1.1rem;
	font-weight: 600;
	flex: 1;
}

.glossary-description {
	margin: 0 0 0.75rem 0;
	font-size: 0.875rem;
	color: var(--theme--foreground-subdued);
	line-height: 1.5;
	display: -webkit-box;
	-webkit-line-clamp: 3;
	-webkit-box-orient: vertical;
	overflow: hidden;
}

.glossary-properties {
	display: flex;
	flex-wrap: wrap;
	gap: 0.5rem;
}

.property-badge {
	padding: 0.25rem 0.5rem;
	background: var(--theme--primary-background);
	color: var(--theme--primary);
	border-radius: var(--theme--border-radius);
	font-size: 0.75rem;
	font-weight: 500;
}
</style>