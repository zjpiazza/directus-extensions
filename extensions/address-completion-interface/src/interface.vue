<script setup lang="ts">
import type { PropType } from 'vue';
import { onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { SmartyClient, type SmartyAutocompleteSuggestion } from './utils/smarty-client';
import { getCurrentLanguage } from './utils/get-current-lang';

interface AutocompleteLocation {
	id: string;
	text: string;
	suggestion: SmartyAutocompleteSuggestion;
}

type Coordinates = [number, number];

interface GeoProperties {
	displayName: string;
	country: string;
	administrativeArea: string;
	postalCode: string;
	formated: string;
	streetLine: string;
	secondary: string;
	city: string;
	state: string;
}

interface GeoJsonFeature {
	geometry: {
		coordinates: Coordinates;
		type: 'Point';
	};
	properties: Partial<GeoProperties>;
	type: 'Feature';
}

const props = defineProps({
	value: {
		type: Object as PropType<GeoJsonFeature> | null,
		default: null,
	},
	disabled: {
		type: Boolean,
		default: false,
	},
	iconLeft: {
		type: String,
		default: null,
	},
	iconRight: {
		type: String,
		default: null,
	},
	maxResults: {
		type: Number,
		default: 10,
	},
	includeOnlyStates: {
		type: String,
		default: '',
	},
	includeOnlyCities: {
		type: String,
		default: '',
	},
});

const emit = defineEmits<{
	input: [GeoJsonFeature | null];
}>();

const { t } = useI18n();

const results = ref<AutocompleteLocation[]>([]);
const searchInput = ref<string | null>(null);
const selectedSuggestionId = ref<string | null>(null);
const hasMounted = ref(false);
const isLoading = ref(false);

let smartyClient: SmartyClient;
let debounceTimeout: NodeJS.Timeout;

// Hard-coded embedded key (safe for frontend use)
const embeddedKey = '245269834312558164';

onMounted(async () => {
	smartyClient = new SmartyClient();
	hasMounted.value = true;
});

async function geocodeAddress(addressString: string): Promise<[number, number]> {
	try {
		// Use OpenStreetMap Nominatim service for geocoding
		const response = await fetch(
			`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressString)}&limit=1`
		);
		const data = await response.json();
		
		if (data && data.length > 0) {
			const lat = parseFloat(data[0].lat);
			const lon = parseFloat(data[0].lon);
			return [lon, lat]; // Return as [longitude, latitude]
		}
	} catch (error) {
		console.error('Geocoding failed:', error);
	}
	
	// Fallback to center of US if geocoding fails
	return [-98.5795, 39.8283];
}

watch(() => props.value, (newValue) => {
	if (!hasMounted.value) {
		return;
	}

	if (!newValue) {
		searchInput.value = null;
		return;
	}

	setInputValue();
});

async function onInput(value: string) {
	searchInput.value = value;
	
	// Clear previous timeout
	if (debounceTimeout) {
		clearTimeout(debounceTimeout);
	}

	// Debounce the API call
	debounceTimeout = setTimeout(() => {
		makeAutocompleteRequest();
	}, 300);
}

async function makeAutocompleteRequest() {
	if (!searchInput.value || searchInput.value.length < 3) {
		results.value = [];
		return;
	}

	if (!embeddedKey) {
		console.error('Smarty embedded key is required');
		results.value = [];
		return;
	}

	isLoading.value = true;

	try {
		const options = {
			embeddedKey: embeddedKey,
			search: searchInput.value,
			maxResults: props.maxResults,
			...(props.includeOnlyStates && { includeOnlyStates: props.includeOnlyStates }),
			...(props.includeOnlyCities && { includeOnlyCities: props.includeOnlyCities }),
		};

		const response = await smartyClient.autocomplete(options);

		results.value = response.suggestions.map((suggestion, index) => ({
			id: `${suggestion.street_line}-${suggestion.city}-${suggestion.state}-${index}`,
			text: smartyClient.buildAddressString(suggestion),
			suggestion,
		}));
	} catch (error) {
		console.error('Autocomplete request failed:', error);
		results.value = [];
	} finally {
		isLoading.value = false;
	}
}

async function onSuggestionSelected(location: AutocompleteLocation) {
	searchInput.value = location.text;
	selectedSuggestionId.value = location.id;

	// For addresses with multiple entries, we could make another API call
	// with the 'selected' parameter to get specific units/apartments
	if (location.suggestion.entries > 1) {
		await handleMultipleEntries(location);
		return;
	}

	// Geocode the address to get coordinates
	const coordinates = await geocodeAddress(location.text);

	const geoData: GeoJsonFeature = {
		geometry: {
			coordinates: coordinates,
			type: 'Point',
		},
		properties: getProperties(location.suggestion),
		type: 'Feature',
	};

	emit('input', geoData);
	results.value = [];
}

async function handleMultipleEntries(location: AutocompleteLocation) {
	try {
		isLoading.value = true;
		
		// Build the selected parameter format required by Smarty
		const selectedParam = `${location.suggestion.street_line} ${location.suggestion.secondary} (${location.suggestion.entries}) ${location.suggestion.city} ${location.suggestion.state} ${location.suggestion.zipcode}`;
		
		const options = {
			embeddedKey: embeddedKey,
			search: searchInput.value!,
			selected: selectedParam,
			maxResults: Math.min(100, location.suggestion.entries), // Smarty limits to 100
		};

		const response = await smartyClient.autocomplete(options);

		results.value = response.suggestions.map((suggestion, index) => ({
			id: `${suggestion.street_line}-${suggestion.secondary}-${suggestion.city}-${suggestion.state}-${index}`,
			text: smartyClient.buildAddressString(suggestion),
			suggestion,
		}));

		// Update search input to allow user to continue typing
		const baseAddress = `${location.suggestion.street_line} ${location.suggestion.secondary}`;
		searchInput.value = baseAddress;

		// If we got back only one result, auto-select it with geocoding
		if (response.suggestions.length === 1) {
			const suggestion = response.suggestions[0];
			const addressText = smartyClient.buildAddressString(suggestion);
			const coordinates = await geocodeAddress(addressText);

			const geoData: GeoJsonFeature = {
				geometry: {
					coordinates: coordinates,
					type: 'Point',
				},
				properties: getProperties(suggestion),
				type: 'Feature',
			};

			emit('input', geoData);
			results.value = [];
		}
	} catch (error) {
		console.error('Multiple entries request failed:', error);
	} finally {
		isLoading.value = false;
	}
}

function getProperties(suggestion: SmartyAutocompleteSuggestion): GeoProperties {
	const fullAddress = smartyClient.buildAddressString(suggestion);
	
	return {
		displayName: fullAddress,
		country: 'US', // Smarty US API only returns US addresses
		administrativeArea: suggestion.state,
		postalCode: suggestion.zipcode,
		formated: fullAddress,
		streetLine: suggestion.street_line,
		secondary: suggestion.secondary,
		city: suggestion.city,
		state: suggestion.state,
	};
}

function setInputValue() {
	if (!props.value) {
		return;
	}

	const { properties } = props.value;

	if (properties?.displayName) {
		searchInput.value = properties.displayName;
	} else if (properties?.formated) {
		searchInput.value = properties.formated;
	}
}

function clearSelection() {
	searchInput.value = null;
	selectedSuggestionId.value = null;
	results.value = [];
	
	emit('input', null);
}


</script>

<template>
	<div class="address-completion-container">
		<div class="search-container">
			<v-menu attached :disabled="disabled">
					<template #activator="{ activate }">
						<v-input
							:placeholder="t('search')"
							:model-value="searchInput"
							:disabled="disabled"
							:loading="isLoading"
							@update:model-value="onInput"
							@focus="activate"
						>
							<template v-if="iconLeft" #prepend>
								<v-icon :name="iconLeft" />
							</template>

							<template v-if="iconRight || searchInput" #append>
								<v-icon 
									v-if="searchInput" 
									name="close" 
									@click="clearSelection" 
									style="cursor: pointer;"
								/>
								<v-icon v-else-if="iconRight" :name="iconRight" />
							</template>
						</v-input>
					</template>

					<v-list v-if="results.length > 0">
						<v-list-item
							v-for="result of results"
							:key="result.id"
							:class="selectedSuggestionId === result.id ? 'selected' : ''"
							@click="() => onSuggestionSelected(result)"
						>
							<div class="address-suggestion">
								<div class="address-text">{{ result.text }}</div>
								<div v-if="result.suggestion.entries > 1" class="address-entries">
									{{ result.suggestion.entries }} units available
								</div>
							</div>
						</v-list-item>

						<!-- Smarty attribution (required by their terms) -->
						<v-list-item
							:clickable="false"
							disabled
							class="smarty-attribution"
						>
							<div class="attribution-text">
								Powered by Smarty
							</div>
						</v-list-item>
					</v-list>
				</v-menu>
			</div>
	</div>
</template>

<style lang="scss" scoped>
.address-completion-container {
	width: 100%;
}

.v-list {
	.v-list-item {
		&.selected,
		&:hover {
			background-color: var(
				--v-list-item-background-color-active,
				var(--v-list-background-color-active, var(--theme--background-normal))
			);
		}

		&.smarty-attribution {
			&:hover {
				background-color: transparent;
			}
		}
	}
}

.address-suggestion {
	.address-text {
		font-weight: 500;
		margin-bottom: 2px;
	}

	.address-entries {
		font-size: 0.875rem;
		color: var(--theme--foreground-subdued);
	}
}

.attribution-text {
	font-size: 0.75rem;
	color: var(--theme--foreground-subdued);
	text-align: center;
	padding: 4px 0;
}

.search-container {
	margin-bottom: 16px;
}
</style>