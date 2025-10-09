import { Ref } from 'vue';

interface DataHubSearchResult {
	urn: string;
	name: string;
	type: string;
	platform?: string;
	description?: string;
	tags?: string[];
}

export function useDataHubClient(_serverUrl: Ref<string>, _authToken: Ref<string>) {
	async function graphqlQuery(query: string, variables: Record<string, any> = {}) {
		const response = await fetch('/datahub-proxy', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ query, variables }),
		});

		if (!response.ok) {
			throw new Error(`DataHub API error: ${response.statusText}`);
		}

		const data = await response.json();
		if (data.errors) {
			throw new Error(data.errors[0]?.message || 'GraphQL query failed');
		}

		return data.data;
	}

	async function searchEntities(searchText: string = ''): Promise<DataHubSearchResult[]> {
		const query = `
			query search($input: SearchAcrossEntitiesInput!) {
				searchAcrossEntities(input: $input) {
					start
					count
					total
					searchResults {
						entity {
							urn
							type
							... on Dataset {
								name
								platform {
									name
								}
								properties {
									description
								}
								tags {
									tags {
										tag {
											name
										}
									}
								}
							}
							... on Dashboard {
								name: dashboardId
								platform {
									name
								}
								properties: info {
									description
								}
							}
							... on Chart {
								name: chartId
								platform {
									name
								}
								properties: info {
									description
								}
							}
						}
					}
				}
			}
		`;

		const variables = {
			input: {
				types: ['DATASET', 'DASHBOARD', 'CHART'],
				query: searchText || '*',
				start: 0,
				count: 50,
			},
		};

	const data = await graphqlQuery(query, variables);
	
	return data.searchAcrossEntities.searchResults.map((result: any) => {
			const entity = result.entity;
			return {
				urn: entity.urn,
				name: entity.name || entity.urn.split(',').pop()?.split(':').pop() || 'Unknown',
				type: entity.type.toLowerCase(),
				platform: entity.platform?.name,
				description: entity.properties?.description,
				tags: entity.tags?.tags?.map((t: any) => t.tag.name) || [],
			};
		});
	}

	async function getDataset(urn: string) {
		const query = `
			query getDataset($urn: String!) {
				dataset(urn: $urn) {
					urn
					name
					platform {
						name
					}
					properties {
						description
						customProperties {
							key
							value
						}
					}
					ownership {
						owners {
							owner {
								... on CorpUser {
									username
								}
							}
							type
						}
					}
					schemaMetadata {
						fields {
							fieldPath
							type
							nativeDataType
							description
						}
					}
					tags {
						tags {
							tag {
								name
								description
							}
						}
					}
				}
			}
		`;

		const data = await graphqlQuery(query, { urn });
		return data.dataset;
	}

	return {
		searchEntities,
		getDataset,
		graphqlQuery,
	};
}
