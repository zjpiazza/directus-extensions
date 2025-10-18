export default ({ filter }: any, { services, getSchema }: any) => {
	filter('items.create', async (input: any, meta: any, context: any) => {
		if (meta.collection === 'directus_fields') {
			autoSetSSNDisplay(input);
			return;
		}
		await validateSSNFields(input, meta, context, services, getSchema);
	});

	filter('items.update', async (input: any, meta: any, context: any) => {
		if (meta.collection === 'directus_fields') {
			autoSetSSNDisplay(input);
			return;
		}
		await validateSSNFields(input, meta, context, services, getSchema);
	});
};

function autoSetSSNDisplay(input: any) {
	const apply = (record: any) => {
		const iface = record?.meta?.interface;
		if (iface === 'ssn') {
			record.meta = record.meta || {};
			if (!record.meta.display) {
				record.meta.display = 'ssn-display';
			}
			if (record.meta.display === 'ssn-display') {
				record.meta.display_options = record.meta.display_options || {};
				if (record.meta.display_options.masked === undefined) {
					record.meta.display_options.masked = record.meta?.options?.masked ?? true;
				}
			}
		}
	};

	if (Array.isArray(input)) {
		for (const r of input) apply(r);
	} else if (input && typeof input === 'object') {
		apply(input);
	}
}

async function validateSSNFields(input: any, meta: any, context: any, services: any, getSchema: any) {
	const { collection } = meta;
	const { FieldsService } = services;
	const { accountability } = context;

	const fieldsService = new FieldsService({ accountability, schema: await getSchema() });
	const fields = await fieldsService.readAll(collection);

	const ssnFields = fields.filter((field: any) => field?.meta?.interface === 'ssn');

	for (const field of ssnFields) {
		const fieldName = field.field;
		const value = input[fieldName];

		if (value !== undefined && value !== null && value !== '') {
			const cleaned = String(value).replace(/\D/g, '');
			
			if (cleaned.length !== 9) {
				throw new Error(`Invalid SSN format for field "${fieldName}". Must be 9 digits.`);
			}

			input[fieldName] = cleaned;
		}
	}
}
