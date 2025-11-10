// Cache fields per collection to avoid repeated database queries
const fieldCache = new Map<string, any[]>();
let lastCacheUpdate = Date.now();
const CACHE_TTL = 60000; // 1 minute

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

	// Invalidate cache if TTL expired or collection fields changed
	if (Date.now() - lastCacheUpdate > CACHE_TTL || (meta.collection === 'directus_fields' && fieldCache.size > 0)) {
		fieldCache.clear();
		lastCacheUpdate = Date.now();
	}

	let fields: any[] = fieldCache.get(collection) ?? [];
	
	if (fields.length === 0) {
		const schema = await getSchema();
		const fieldsService = new FieldsService({ 
			accountability, 
			schema,
			knex: context.database // Pass database connection from context
		});
		const fetchedFields = await fieldsService.readAll(collection);
		fields = fetchedFields ?? [];
		if (fields.length > 0) {
			fieldCache.set(collection, fields);
		}
	}

	const phoneFields = fields.filter((field: any) => field?.meta?.interface === 'phone');

	// Early return if no phone fields in collection
	if (phoneFields.length === 0) {
		return;
	}

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
