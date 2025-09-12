<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useApi } from '@directus/extensions-sdk';

interface Props {
	collection: string;
	primaryKey?: string | null;
	title: string;
	isNew: boolean;
	collectionInfo?: any;
	item?: any;
	selectedProgram?: string | null;
	programs?: Array<{ id: string; name: string }>;
	headerTitle?: string;
}

const props = withDefaults(defineProps<Props>(), {
	primaryKey: null,
	selectedProgram: null,
	programs: () => [],
	headerTitle: 'Framework (Standard CPS Framework)',
});

const emit = defineEmits<{
	'program-change': [programId: string];
}>();

const { t } = useI18n();
const api = useApi();

// Program dropdown functionality - use props when available, otherwise fetch
const programs = ref<Array<{ id: string; name: string }>>(props.programs || []);
const selectedProgram = ref<string | null>(props.selectedProgram);

// Watch for changes in props
watch(() => props.selectedProgram, (newValue: string | null | undefined) => {
	if (newValue !== selectedProgram.value) {
		selectedProgram.value = newValue || null;
	}
});

watch(() => props.programs, (newPrograms: Array<{ id: string; name: string }> | undefined) => {
	if (newPrograms && newPrograms.length > 0) {
		programs.value = newPrograms.map((program) => ({
			id: String(program.id),
			name: program.name
		}));
	}
});

// Breadcrumbs
const breadcrumbs = computed(() => {
	const crumbs: Array<{ name: string; to?: string }> = [
		{
			name: 'Content',
			to: '/content',
		},
		{
			name: props.collectionInfo?.name || props.collection,
			to: `/content/${props.collection}`,
		},
	];

	if (props.isNew) {
		crumbs.push({
			name: t('creating_new_item'),
		});
	}

	return crumbs;
});

// Fetch programs from the API
async function fetchPrograms() {
	try {
		const response = await api.get('/items/programs', {
			params: {
				fields: ['id', 'name'],
				limit: -1,
			},
		});
		// Ensure all IDs are strings for consistency
		programs.value = (response.data.data || []).map((program: any) => ({
			id: String(program.id),
			name: program.name
		}));
		
		console.log('Fetched programs:', programs.value);
		
		// Set default program if available
		if (programs.value.length > 0 && !selectedProgram.value && programs.value[0]) {
			selectedProgram.value = String(programs.value[0].id);
			console.log('Set default program:', selectedProgram.value);
		}
	} catch (error) {
		console.error('Error fetching programs:', error);
		programs.value = [];
	}
}

// Handle program selection change
function onProgramChange(programId: string) {
	selectedProgram.value = programId;
	// Emit the change to parent component
	emit('program-change', programId);
}

onMounted(() => {
	// Only fetch programs if not provided via props
	if (!props.programs || props.programs.length === 0) {
		fetchPrograms();
	}
});
</script>

<template>
	<div class="custom-header-shared">
		<div class="header-top">
			<nav class="breadcrumbs">
				<template v-for="(crumb, index) in breadcrumbs" :key="index">
					<router-link 
						v-if="crumb.to" 
						:to="crumb.to" 
						class="breadcrumb-link"
					>
						{{ crumb.name }}
					</router-link>
					<span v-else class="breadcrumb-current">{{ crumb.name }}</span>
					<v-icon 
						v-if="index < breadcrumbs.length - 1" 
						name="chevron_right" 
						small 
						class="breadcrumb-separator"
					/>
				</template>
			</nav>
		</div>

		<div class="header-main">
			<div class="header-left">
				<v-button 
					icon 
					rounded 
					secondary 
					:to="`/content/${collection}`"
					class="back-button"
				>
					<v-icon name="arrow_back" />
				</v-button>

				<div class="title-section">
					<h1 class="header-title">{{ headerTitle }}</h1>
				</div>
			</div>

			<div class="header-center">
				<div class="program-selector">
					<label>Program:</label>
					<v-select
						v-model="selectedProgram"
						:items="programs"
						itemText="name"
						itemValue="id"
						placeholder="Select Program"
						show-empty
						@update:model-value="onProgramChange"
					/>
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped>
.custom-header-shared {
	background: var(--theme--background);
	border-bottom: 1px solid var(--theme--border-color);
}

.header-top {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0.375rem 1.5rem;
	background: var(--theme--background-subdued);
	border-bottom: 1px solid var(--theme--border-color-subdued);
	block-size: calc(60px + var(--theme--navigation--project--border-width));
}

.breadcrumbs {
	display: flex;
	align-items: center;
	gap: 0.25rem;
	font-size: 0.875rem;
}

.breadcrumb-link {
	color: var(--theme--primary);
	text-decoration: none;
	transition: color 0.2s;
}

.breadcrumb-link:hover { color: var(--theme--primary-accent); }

.breadcrumb-current { color: var(--theme--foreground-subdued); font-weight: 500; }

.breadcrumb-separator { color: var(--theme--foreground-subdued); margin: 0 0.25rem; }

.header-main {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 1rem 1.5rem;
	min-height: 70px;
	background: var(--theme--background);
	color: var(--theme--foreground);
	border-bottom: 1px solid var(--theme--border-color);
}

.header-left { display: flex; align-items: center; gap: 1rem; flex: 1; min-width: 0; }

.back-button { color: var(--theme--foreground-subdued); border-color: var(--theme--border-color); }
.back-button:hover { color: var(--theme--foreground); border-color: var(--theme--border-color-accent); }

.title-section { display: flex; flex-direction: column; gap: 0.5rem; flex: 1; min-width: 0; }

.header-title { color: var(--theme--foreground); font-size: 1.25rem; font-weight: 600; margin: 0; }

.header-center { display: flex; align-items: center; gap: 1rem; flex-shrink: 0; }

.program-selector { display: flex; align-items: center; gap: 0.5rem; min-width: 200px; width: 400px; }
.program-selector label { font-size: 1rem; font-weight: 600; color: var(--theme--foreground); white-space: nowrap; }
.program-selector .v-select { width: 300px; }

:deep(.v-select .v-field__input),
:deep(.v-select .v-field__field),
:deep(.v-select .v-select__selection-text),
:deep(.v-list-item-title) { color: var(--theme--foreground) !important; }
</style>
