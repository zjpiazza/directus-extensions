export default ({ filter }: any, { services, getSchema }: any) => {
	filter('items.create', async (input: any, meta: any, context: any) => {
		if (meta.collection === 'directus_fields') {
			autoSetPhoneDisplay(input);
			return;
		}
		await validatePhoneFields(input, meta, context, services, getSchema);
	});

	filter('items.update', async (input: any, meta: any, context: any) => {
		if (meta.collection === 'directus_fields') {
			autoSetPhoneDisplay(input);
			return;
		}
		await validatePhoneFields(input, meta, context, services, getSchema);
	});
};

function autoSetPhoneDisplay(input: any) {
	const apply = (record: any) => {
		const iface = record?.meta?.interface;
		if (iface === 'phone') {
			record.meta = record.meta || {};
			if (!record.meta.display) {
				record.meta.display = 'phone-display';
			}
			if (record.meta.display === 'phone-display') {
				record.meta.display_options = record.meta.display_options || {};
				if (!record.meta.display_options.format) {
					record.meta.display_options.format = record.meta?.options?.format || 'us';
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

async function validatePhoneFields(input: any, meta: any, context: any, services: any, getSchema: any) {
	const { collection } = meta;
	const { FieldsService } = services;
	const { accountability } = context;

	const fieldsService = new FieldsService({ accountability, schema: await getSchema() });
	const fields = await fieldsService.readAll(collection);

	const phoneFields = fields.filter((field: any) => field?.meta?.interface === 'phone');

	for (const field of phoneFields) {
		const fieldName = field.field;
		const value = input[fieldName];

		if (value !== undefined && value !== null && value !== '') {
			const cleaned = String(value).replace(/\D/g, '');
			
			const format = field?.meta?.options?.format || 'us';
			
			if (format === 'international') {
				if (cleaned.length < 10 || cleaned.length > 15) {
					throw new Error(`Invalid phone number format for field "${fieldName}". International numbers must be 10-15 digits.`);
				}
			} else {
				if (cleaned.length !== 10) {
					throw new Error(`Invalid phone number format for field "${fieldName}". US numbers must be 10 digits.`);
				}
			}

			input[fieldName] = cleaned;
		}
	}
}
