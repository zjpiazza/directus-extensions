export default ({ filter }: any, { services, getSchema }: any) => {
	filter('items.create', async (input: any, meta: any, context: any) => {
		if (meta.collection === 'directus_fields') {
			autoSetEmailDisplay(input);
			return;
		}
		await validateEmailFields(input, meta, context, services, getSchema);
	});

	filter('items.update', async (input: any, meta: any, context: any) => {
		if (meta.collection === 'directus_fields') {
			autoSetEmailDisplay(input);
			return;
		}
		await validateEmailFields(input, meta, context, services, getSchema);
	});
};

function autoSetEmailDisplay(input: any) {
	const apply = (record: any) => {
		const iface = record?.meta?.interface;
		if (iface === 'email-input') {
			record.meta = record.meta || {};
			if (!record.meta.display) {
				record.meta.display = 'email-display';
			}
			if (record.meta.display === 'email-display') {
				record.meta.display_options = record.meta.display_options || {};
				if (record.meta.display_options.obfuscate === undefined) {
					// default to false; map from interface option if provided
					record.meta.display_options.obfuscate = record.meta?.options?.obfuscate ?? false;
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

async function validateEmailFields(
	input: any,
	meta: any,
	context: any,
	services: any,
	getSchema: any
) {
	const { collection } = meta;
	const { FieldsService } = services;
	const { accountability } = context;

	const schema = await getSchema();
	const fieldsService = new FieldsService({ accountability, schema });
	const fields = await fieldsService.readAll(collection);

	const emailFields = fields.filter(
		(field: any) => field?.meta?.interface === 'email-input'
	);

	for (const field of emailFields) {
		const value = input[field.field];

		if (value && !isValidEmail(value)) {
			throw new Error(
				`Invalid email format for field "${field.field}". Please provide a valid email address.`
			);
		}

		if (field.meta?.options?.required && !value) {
			throw new Error(`Email is required for field "${field.field}".`);
		}
	}
}

function isValidEmail(email: string): boolean {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
}
