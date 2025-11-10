// Cache fields per collection to avoid repeated database queries
const fieldCache = new Map<string, any[]>();
let lastCacheUpdate = Date.now();
const CACHE_TTL = 60000; // 1 minute

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

	const ssnFields = fields.filter((field: any) => field?.meta?.interface === 'ssn');

	// Early return if no SSN fields in collection
	if (ssnFields.length === 0) {
		return;
	}

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
