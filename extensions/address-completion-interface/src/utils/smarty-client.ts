export interface SmartyAutocompleteSuggestion {
	street_line: string;
	secondary: string;
	city: string;
	state: string;
	zipcode: string;
	entries: number;
	source?: string;
}

export interface SmartyAutocompleteResponse {
	suggestions: SmartyAutocompleteSuggestion[];
}

export interface SmartyAutocompleteOptions {
	search: string;
	embeddedKey: string;
	maxResults?: number;
	includeOnlyStates?: string;
	includeOnlyCities?: string;
	includeOnlyZipCodes?: string;
	preferStates?: string;
	preferCities?: string;
	preferZipCodes?: string;
	preferRatio?: number;
	preferGeolocation?: 'city' | 'none';
	selected?: string;
	source?: 'all' | 'postal';
}

export class SmartyClient {
	private baseUrl = 'https://us-autocomplete-pro.api.smarty.com/lookup';

	private buildQueryParams(options: SmartyAutocompleteOptions): URLSearchParams {
		const params = new URLSearchParams();
		
		// Add embedded key for authentication
		params.append('key', options.embeddedKey);
		params.append('search', options.search);

		if (options.maxResults !== undefined) {
			params.append('max_results', options.maxResults.toString());
		}

		if (options.includeOnlyStates) {
			params.append('include_only_states', options.includeOnlyStates);
		}

		if (options.includeOnlyCities) {
			params.append('include_only_cities', options.includeOnlyCities);
		}

		if (options.includeOnlyZipCodes) {
			params.append('include_only_zip_codes', options.includeOnlyZipCodes);
		}

		if (options.preferStates) {
			params.append('prefer_states', options.preferStates);
		}

		if (options.preferCities) {
			params.append('prefer_cities', options.preferCities);
		}

		if (options.preferZipCodes) {
			params.append('prefer_zip_codes', options.preferZipCodes);
		}

		if (options.preferRatio !== undefined) {
			params.append('prefer_ratio', options.preferRatio.toString());
		}

		if (options.preferGeolocation) {
			params.append('prefer_geolocation', options.preferGeolocation);
		}

		if (options.selected) {
			params.append('selected', options.selected);
		}

		if (options.source) {
			params.append('source', options.source);
		}

		return params;
	}

	async autocomplete(options: SmartyAutocompleteOptions): Promise<SmartyAutocompleteResponse> {
		if (!options.embeddedKey) {
			throw new Error('Smarty embedded key is required');
		}

		if (!options.search || options.search.length < 2) {
			return { suggestions: [] };
		}

		const queryParams = this.buildQueryParams(options);
		const url = `${this.baseUrl}?${queryParams.toString()}`;

		try {
			const response = await fetch(url, {
				method: 'GET',
				headers: {
					'Accept': 'application/json',
				},
			});

			if (!response.ok) {
				let errorMessage = `API error: ${response.status} ${response.statusText}`;
				
				// Handle specific error cases
				if (response.status === 401) {
					errorMessage = 'Invalid or missing Smarty embedded key. Please check your configuration.';
				} else if (response.status === 402) {
					errorMessage = 'Smarty API quota exceeded or payment required. Please check your subscription.';
				}

				throw new Error(errorMessage);
			}

			const data = await response.json();
			return data as SmartyAutocompleteResponse;
		} catch (error) {
			console.error('Smarty API request failed:', error);
			throw error;
		}
	}

	buildAddressString(suggestion: SmartyAutocompleteSuggestion): string {
		let whiteSpace = '';
		let secondary = suggestion.secondary;

		if (secondary) {
			if (suggestion.entries > 1) {
				secondary += ` (${suggestion.entries} entries)`;
			}
			whiteSpace = ' ';
		}

		return `${suggestion.street_line}${whiteSpace}${secondary} ${suggestion.city}, ${suggestion.state} ${suggestion.zipcode}`;
	}
}