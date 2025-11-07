---
applyTo: "extensions/*bundle/**"
---

# Bundle Extensions - Copilot Instructions

## Bundle Extension Pattern

Bundle extensions combine multiple extension types into a single package:
- **Interface** (`src/interface/`) - Client-side Vue.js UI component
- **Hook** (`src/hook/`) - Server-side validation on API

Both are automatically built into separate bundles (`dist/app.js` for client, `dist/api.js` for server).

## Key Characteristics

### Interface (Client-Side)
- Vue.js component with `defineInterface()`
- Handles formatting, display, and client-side validation
- Cannot enforce server-side validation
- Receives options from field configuration in Directus

### Hook (Server-Side)
- Validates data before it enters the database
- Required for enforcing input constraints
- Uses `filter('items.create')` and `filter('items.update')` events
- Accesses `FieldsService` to identify which fields use this interface

## Development Structure

```
bundle-extension/
├── src/
│   ├── interface/
│   │   ├── index.ts          # defineInterface() export
│   │   └── interface.vue     # Vue component
│   └── hook/
│       └── index.ts          # Hook implementation
├── package.json              # Defines both entries
├── tsconfig.json
└── README.md
```

## package.json Configuration

```json
{
  "directus:extension": {
    "type": "bundle",
    "path": {
      "app": "dist/app.js",
      "api": "dist/api.js"
    },
    "entries": [
      {
        "type": "interface",
        "name": "bundle-interface-id",
        "source": "src/interface/index.ts"
      },
      {
        "type": "hook",
        "name": "bundle-hook-name",
        "source": "src/hook/index.ts"
      }
    ]
  }
}
```

## Hook Implementation Pattern

```typescript
// src/hook/index.ts
export default ({ filter }: any, { services, getSchema }: any) => {
  filter('items.create', async (input: any, meta: any, context: any) => {
    await validateFields(input, meta, context, services, getSchema);
  });
  
  filter('items.update', async (input: any, meta: any, context: any) => {
    await validateFields(input, meta, context, services, getSchema);
  });
};

async function validateFields(
  input: any,
  meta: any,
  context: any,
  services: any,
  getSchema: any
) {
  const { collection } = meta;
  const { FieldsService } = services;
  const { accountability } = context;
  
  // Get all fields in collection
  const fieldsService = new FieldsService({
    accountability,
    schema: await getSchema()
  });
  const fields = await fieldsService.readAll(collection);
  
  // Find fields using this interface
  const customFields = fields.filter(
    (field: any) => field?.meta?.interface === 'your-interface-id'
  );
  
  // Validate each field
  for (const field of customFields) {
    const value = input[field.field];
    if (value && !isValid(value)) {
      throw new Error(`Invalid format for field "${field.field}"`);
    }
  }
}
```

## Building Bundle Extensions

```bash
cd extensions/bundle-name
pnpm build              # Builds both client and server bundles
```

## Testing
- **Client**: Test in Directus UI - create/edit records with the custom field
- **Server**: Test with API requests to verify validation is enforced

## Common Patterns

### Email Bundle
- Client: Email input with validation UI
- Server: Validates email format before save

### Phone Bundle
- Client: Phone formatting with mask, validation UI
- Server: Validates phone format (numeric digits)

### SSN Bundle
- Client: SSN formatting (XXX-XX-XXXX), optional masking
- Server: Validates 9-digit format
