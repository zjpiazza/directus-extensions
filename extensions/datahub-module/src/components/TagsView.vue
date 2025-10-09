<template>
	<private-view title="DataHub - Tags">
		<template #headline>
			<v-breadcrumb :items="[
				{ name: 'DataHub', to: '/datahub' },
				{ name: 'Tags', to: '/datahub/tags' }
			]" />
		</template>

		<template #title>
			<h1 class="type-title">Tag Management</h1>
		</template>

		<template #actions>
			<v-button icon rounded @click="refreshTags">
				<v-icon name="refresh" />
			</v-button>
		</template>

		<div class="tags-container">
			<div v-if="loading" class="loading-state">
				<v-progress-circular indeterminate />
				<p>Loading tags...</p>
			</div>

			<div v-else-if="error" class="error-state">
				<v-icon name="error" large />
				<p>{{ error }}</p>
				<v-button @click="refreshTags">Retry</v-button>
			</div>

			<div v-else class="tags-content">
				<div v-if="tags.length === 0" class="empty-state">
					<v-icon name="local_offer" large />
					<h3>No Tags Found</h3>
					<p>Tags will appear here once configured in DataHub.</p>
				</div>

				<div v-else class="tags-grid">
					<div
						v-for="tag in tags"
						:key="tag.urn"
						class="tag-card"
					>
						<div class="tag-header">
							<v-icon name="local_offer" />
							<h4>{{ tag.name }}</h4>
							<span class="usage-count">{{ tag.usageCount || 0 }} assets</span>
						</div>
						<p v-if="tag.description" class="tag-description">
							{{ tag.description }}
						</p>
						<div class="tag-urn">
							<code>{{ tag.urn }}</code>
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

interface Tag {
	urn: string;
	name: string;
	description?: string;
	usageCount?: number;
}

const loading = ref(false);
const error = ref<string | null>(null);
const tags = ref<Tag[]>([]);

// Mock data for now - in a real implementation, this would query DataHub's tags API
const mockTags: Tag[] = [
	{
		urn: 'urn:li:tag:PII',
		name: 'PII',
		description: 'Personally Identifiable Information',
		usageCount: 15
	},
	{
		urn: 'urn:li:tag:Deprecated',
		name: 'Deprecated',
		description: 'Assets that are no longer maintained',
		usageCount: 3
	},
	{
		urn: 'urn:li:tag:NeedsDocumentation',
		name: 'Needs Documentation',
		description: 'Assets requiring additional documentation',
		usageCount: 8
	},
	{
		urn: 'urn:li:tag:Production',
		name: 'Production',
		description: 'Production environment assets',
		usageCount: 42
	}
];

async function refreshTags() {
	loading.value = true;
	error.value = null;

	try {
		// TODO: Implement actual DataHub tags API call
		// For now, simulate API delay and use mock data
		await new Promise(resolve => setTimeout(resolve, 1000));
		tags.value = mockTags;
	} catch (err) {
		error.value = err instanceof Error ? err.message : 'Failed to load tags';
	} finally {
		loading.value = false;
	}
}

onMounted(() => {
	refreshTags();
});
</script>

<style scoped>
.tags-container {
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

.tags-content {
	display: flex;
	flex-direction: column;
	gap: 1.5rem;
	height: 100%;
}

.tags-grid {
	display: grid;
	gap: 1rem;
	grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
}

.tag-card {
	padding: 1.5rem;
	background: var(--theme--background-subdued);
	border-radius: var(--theme--border-radius);
	border: 2px solid transparent;
	transition: all var(--fast) var(--transition);
}

.tag-card:hover {
	border-color: var(--theme--primary);
	transform: translateY(-2px);
}

.tag-header {
	display: flex;
	align-items: center;
	gap: 0.75rem;
	margin-bottom: 0.75rem;
}

.tag-header .v-icon {
	--v-icon-color: var(--theme--primary);
}

.tag-header h4 {
	margin: 0;
	font-size: 1.1rem;
	font-weight: 600;
	flex: 1;
}

.usage-count {
	padding: 0.25rem 0.5rem;
	background: var(--theme--primary-background);
	color: var(--theme--primary);
	border-radius: var(--theme--border-radius);
	font-size: 0.75rem;
	font-weight: 500;
}

.tag-description {
	margin: 0 0 0.75rem 0;
	font-size: 0.875rem;
	color: var(--theme--foreground-subdued);
	line-height: 1.5;
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
	overflow: hidden;
}

.tag-urn {
	margin-top: 0.5rem;
}

.tag-urn code {
	font-size: 0.75rem;
	color: var(--theme--foreground-subdued);
	background: var(--theme--background);
	padding: 0.25rem 0.5rem;
	border-radius: var(--theme--border-radius);
	font-family: monospace;
}
</style>