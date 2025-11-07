---
applyTo: "extensions/*hook/**"
---

# Hook Extensions - Copilot Instructions

## Hook Extension Pattern

Hook extensions run on the API server and intercept lifecycle events. They enable server-side validation, data transformation, and complex business logic.

## Key Characteristics

- Run on Directus API server
- Intercept `items.create`, `items.update`, `items.read`, `items.delete` events
- Full access to database, services, and Directus context
- Can validate, transform, or reject data
- Exported from `src/index.ts`

## Development Structure

```
hook-extension/
├── src/
│   ├── index.ts           # Hook export
│   └── utils/             # Helper functions
├── package.json
├── tsconfig.json
└── README.md
```

## Hook Pattern

```typescript
// src/index.ts
export default ({ filter, action }: any, { services, getSchema }: any) => {
  // Use filter() to intercept before changes are saved
  filter('items.create', async (input: any, meta: any, context: any) => {
    // Validate or transform input before insert
    // Throw Error to reject
    return input;  // or return transformed input
  });
  
  filter('items.update', async (input: any, meta: any, context: any) => {
    // Validate or transform input before update
    return input;
  });
  
  // Use action() to react after changes are saved
  action('items.create:after', async (meta: any, context: any) => {
    // Trigger side effects, logging, etc.
  });
};
```

## Available Events

### Before Events (use `filter()`)
- `items.create` - Before insert
- `items.update` - Before update
- `items.delete` - Before delete
- `items.read` - Before read

### After Events (use `action()`)
- `items.create:after` - After insert
- `items.update:after` - After update
- `items.delete:after` - After delete

## Server-Side Validation Pattern

Use `FieldsService` to identify fields using custom interfaces:

```typescript
export default ({ filter }: any, { services, getSchema }: any) => {
  filter('items.create', async (input: any, meta: any, context: any) => {
    await validateCustomFields(input, meta, context, services, getSchema);
  });
  
  filter('items.update', async (input: any, meta: any, context: any) => {
    await validateCustomFields(input, meta, context, services, getSchema);
  });
};

async function validateCustomFields(
  input: any,
  meta: any,
  context: any,
  services: any,
  getSchema: any
) {
  const { collection } = meta;
  const { FieldsService } = services;
  const { accountability } = context;
  
  // Get schema and fields
  const fieldsService = new FieldsService({
    accountability,
    schema: await getSchema()
  });
  const fields = await fieldsService.readAll(collection);
  
  // Filter to custom interface fields
  const customFields = fields.filter(
    (field: any) => field?.meta?.interface === 'your-interface-id'
  );
  
  // Validate each custom field
  for (const field of customFields) {
    const value = input[field.field];
    if (value && !isValidFormat(value)) {
      throw new Error(
        `Invalid ${field.field}: expected format is X`
      );
    }
  }
}

function isValidFormat(value: string): boolean {
  // Your validation logic
  return true;
}
```

## Building Hook Extensions

```bash
cd extensions/hook-name
pnpm build
```

## Testing
- Make API requests to create/update records
- Verify validation is enforced
- Check for error responses
- Test via Directus UI (uses API underneath)

## Common Patterns

### Event Sync Hook
- Syncs data to external systems
- Triggers on create/update events
- Sends webhooks or API calls

### Tenant Hook
- Isolates data by tenant
- Filters queries by tenant context
- Validates tenant access on operations

## Context Object

Access useful information in context:
- `context.accountability` - User info and permissions
- `context.schema` - Collection schema
- `context.database` - Direct database access

## Errors & Rejection

```typescript
// Reject the operation
throw new Error('Validation failed: reason');

// Directus will return 400 Bad Request to client
```

## Important Notes
- Avoid long-running operations - can timeout
- Use `getSchema()` for field metadata
- Always check `accountability` for permissions
- Be careful with database queries - can cause N+1 problems
