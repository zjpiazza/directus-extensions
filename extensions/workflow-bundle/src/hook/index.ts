import { defineHook } from '@directus/extensions-sdk';

export default defineHook(({ filter, action }, { services, getSchema }) => {
	/**
	 * Initialize the workflows collection on startup
	 */
	action('init', async () => {
		try {
			const { CollectionsService, FieldsService } = services;
			const schema = await getSchema();
			const collectionsService = new CollectionsService({ schema });
			const fieldsService = new FieldsService({ schema });

			// Check if workflows collection already exists
			const collections = await collectionsService.readByQuery({
				filter: { collection: { _eq: 'workflows' } },
			});

			if (collections.length === 0) {
				// Create the workflows collection
				await collectionsService.createOne({
					collection: 'workflows',
					meta: {
						display_template: '{{ name }}',
						icon: 'bolt',
						note: 'Workflow definitions for the workflow module',
						hidden: false,
						singleton: false,
					},
				});

				// Create required fields
				const fieldsToCreate = [
					{
						field: 'name',
						type: 'string',
						meta: {
							interface: 'input',
							options: { placeholder: 'Workflow name' },
							width: 'full',
						},
					},
					{
						field: 'description',
						type: 'text',
						meta: {
							interface: 'input-multiline',
							options: { placeholder: 'Workflow description' },
							width: 'full',
						},
					},
					{
						field: 'nodes',
						type: 'json',
						meta: {
							interface: 'input-code',
							options: { language: 'json' },
							width: 'full',
						},
					},
					{
						field: 'edges',
						type: 'json',
						meta: {
							interface: 'input-code',
							options: { language: 'json' },
							width: 'full',
						},
					},
					{
						field: 'pages',
						type: 'json',
						meta: {
							interface: 'input-code',
							options: { language: 'json' },
							width: 'full',
						},
					},
					{
						field: 'currentPageId',
						type: 'string',
						meta: {
							interface: 'input',
							options: { placeholder: 'root' },
							width: 'half',
						},
					},
					{
						field: 'pageViewports',
						type: 'json',
						meta: {
							interface: 'input-code',
							options: { language: 'json' },
							width: 'full',
						},
					},
				];

				for (const fieldConfig of fieldsToCreate) {
					await fieldsService.createOne('workflows', fieldConfig);
				}

				console.log('✓ Workflows collection created successfully');
			}
		} catch (error) {
			console.error('Error initializing workflows collection:', error);
		}
	});
});
