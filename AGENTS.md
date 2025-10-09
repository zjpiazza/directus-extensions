# AGENTS.md

## Project Overview
The current repository contains multiple Directus extensions using the "editor" extension type. This extension type is added into a forked version of the Directus codebase. The editor extension type overrides the default Vue component when editing an item within a collection.

## Extensions

### process-map-editor
- **Type**: Editor extension for singleton collections
- **Technology**: Vue Flow for rendering
- **Purpose**: [Add brief description of what this does]

### workflows-editor
- **Type**: Editor extension for standard collections
- **Technology**: Vue Flow for rendering
- **Purpose**: [Add brief description of what this does]

### ssn-bundle
- **Type**: Bundle extension (interface + hook)
- **Technology**: Vue.js interface with Node.js hook
- **Purpose**: SSN input field with formatting, masking, and server-side validation
- **Components**:
  - Interface: Client-side SSN formatting (XXX-XX-XXXX), optional masking, validation
  - Hook: Server-side validation enforcing 9-digit format on save

### datahub-module
- **Type**: Module extension
- **Technology**: Vue.js
- **Purpose**: DataHub integration module for data catalog functionality
- **Authentication**: Uses standard Directus authentication
- **Integration**: Works with datahub-proxy endpoint

### datahub-proxy
- **Type**: Endpoint extension
- **Technology**: Node.js server-side endpoint
- **Purpose**: Server-side proxy for DataHub GraphQL API calls
- **Endpoint**: `/datahub-proxy`
- **Authentication**: **Requires Directus authentication** - users must be logged into Directus
- **Configuration**: Requires environment variables:
  - `DATAHUB_GMS_URL`: DataHub GMS URL (e.g., `http://datahub-gms:8080`)
  - `DATAHUB_GMS_TOKEN`: DataHub authentication token
- **Why a proxy?**: Avoids CORS issues by making DataHub API calls from the Directus backend instead of the browser

## Development Environment

### Prerequisites
- Docker and Docker Compose
- pnpm package manager
- Node.js (specify version if relevant)

### Setup
1. Ensure Docker Compose environment is running: `docker compose up -d`
2. Credentials can be found in the docker-compose file
3. Extensions auto-reload after building

## Development Workflow

### Making Changes
1. Make your changes to the extension code
2. Run `pnpm build` to build the extension
3. Changes should be automatically picked up
4. Check browser console for any unusual behavior

### File Structure
├── process-map-editor/

│   ├── src/

│   ├── package.json

│   └── ...

├── workflows-editor/

│   ├── src/

│   ├── package.json

│   └── ...

└── docker-compose.yml

## Debugging & Troubleshooting

### Common Issues
- Always check browser console for errors
- Ensure Docker Compose is running before making changes
- Verify build completed successfully after `pnpm build`

### Debugging Steps
1. Check browser console for JavaScript errors
2. Verify Docker containers are healthy: `docker compose ps`
3. Check build output for compilation errors
4. Restart containers if needed: `docker compose restart`

## Important Rules

### Code Changes
- **NEVER** commit changes unless explicitly prompted
- Always test changes locally before any commits
- Use `pnpm build` after every change
- **ALWAYS remove debug console.log statements after user confirms changes work**
  - Keep only essential logging (errors, critical state changes)
  - Remove verbose debug messages, intermediate step logs, and temporary traces
  - Clean code should have minimal console output

### Documentation & Research
- Always consult technical documentation when unsure
- Use context7 or firecrawl for additional research
- Reference Vue Flow documentation for rendering issues

## Technical Details

### Key Technologies
- Directus (forked version)
- Vue.js
- Vue Flow
- Docker Compose
- pnpm

### Extension Architecture
- Extensions override default Vue components
- Editor type extensions modify item editing interface
- Singleton vs standard collection handling differs between extensions

#### Interface Extensions
- Provide custom input UI components for fields in Directus
- Built using Vue.js and exposed via `defineInterface()`
- Support custom options (e.g., masking, formatting)
- **Client-side validation only** - interfaces cannot enforce server-side validation
- Validation rules in interface metadata (e.g., `validation: { _and: [...] }`) are only enforced in the Data Studio UI

#### Hook Extensions
- Run on the API server to intercept lifecycle events
- Required for server-side validation of custom interfaces
- Use `filter()` to intercept `items.create` and `items.update` events
- Access field metadata via `FieldsService` to identify which fields use specific interfaces
- Can modify input data before it reaches the database

#### Bundle Extensions
- Combine multiple extension types (interface + hook, etc.) into a single package
- Define multiple entries in `package.json` under `directus:extension.entries`
- Each entry specifies `type`, `name`, and `source` file path
- Build generates separate `app.js` (client-side) and `api.js` (server-side) bundles
- Recommended approach for interfaces requiring server-side validation

#### Endpoint Extensions
- Create custom API endpoints accessible at `/your-endpoint-id`
- Run on the Directus backend (server-side)
- Built using `defineEndpoint()` from `@directus/extensions-sdk`
- **Authentication**: By default, endpoints use standard Directus authentication
  - Users must be authenticated to call the endpoint
  - Do NOT set `req.accountability = null` unless you explicitly need a public endpoint
  - Access user info via `req.accountability` if needed
- **Use cases**: 
  - Proxying external APIs (e.g., to avoid CORS)
  - Custom business logic that needs to run server-side
  - Integration with third-party services
- Access environment variables via the `env` parameter in the handler

## Common Tasks
- Building extensions: `pnpm build`
- Starting environment: `docker compose up -d`
- Viewing logs: `docker compose logs -f`
- Stopping environment: `docker compose down`

## Creating Custom Interfaces with Server-Side Validation

### Key Learnings

1. **Interfaces alone cannot enforce server-side validation**
   - Interface validation rules are client-side only
   - API calls, imports, and direct database operations bypass interface validation
   - This is a known limitation in Directus (see GitHub issue #15878)

2. **Server-side validation requires a hook extension**
   - Hooks intercept data before it reaches the database
   - Use `filter('items.create')` and `filter('items.update')` events
   - Access field metadata to identify fields using your custom interface

3. **Bundle extensions are the recommended pattern**
   - Combine interface (client-side) + hook (server-side) in one package
   - Ensures both components stay in sync
   - Simplifies deployment and version management

### Implementation Pattern

```typescript
// Hook: src/hook/index.ts
export default ({ filter }: any, { services, getSchema }: any) => {
  filter('items.create', async (input: any, meta: any, context: any) => {
    await validateFields(input, meta, context, services, getSchema);
  });
  
  filter('items.update', async (input: any, meta: any, context: any) => {
    await validateFields(input, meta, context, services, getSchema);
  });
};

async function validateFields(input: any, meta: any, context: any, services: any, getSchema: any) {
  const { collection } = meta;
  const { FieldsService } = services;
  const { accountability } = context;
  
  // Get all fields in the collection
  const fieldsService = new FieldsService({ accountability, schema: await getSchema() });
  const fields = await fieldsService.readAll(collection);
  
  // Find fields using your custom interface
  const customFields = fields.filter((field: any) => field?.meta?.interface === 'your-interface-id');
  
  // Validate each field
  for (const field of customFields) {
    const value = input[field.field];
    if (value && !isValid(value)) {
      throw new Error(`Invalid format for field "${field.field}"`);
    }
  }
}
```

### Bundle Package Structure

```
extensions/your-bundle/
├── src/
│   ├── interface/
│   │   ├── index.ts          # defineInterface()
│   │   └── interface.vue     # Vue component
│   └── hook/
│       └── index.ts          # Hook with validation
├── package.json              # Define bundle entries
└── tsconfig.json
```

### Bundle package.json Configuration

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
        "name": "your-interface-id",
        "source": "src/interface/index.ts"
      },
      {
        "type": "hook",
        "name": "your-hook-name",
        "source": "src/hook/index.ts"
      }
    ]
  }
}
```
