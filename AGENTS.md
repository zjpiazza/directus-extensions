# AGENTS.md

## Project Overview
The current repository contains multiple Directus extensions. Each extension is a specialized module that extends Directus functionality with custom interfaces, hooks, modules, and other extension types.

## Extensions

### address-completion-interface
- **Type**: Interface extension
- **Technology**: Vue.js interface with external API integration
- **Purpose**: Address completion and validation interface
- **See**: `extensions/address-completion-interface/AGENTS.md`

### email-bundle
- **Type**: Bundle extension (interface + hook)
- **Technology**: Vue.js interface with Node.js hook
- **Purpose**: Email input field with formatting and server-side validation
- **See**: `extensions/email-bundle/AGENTS.md`

### email-interface
- **Type**: Interface extension
- **Technology**: Vue.js interface
- **Purpose**: Email input field interface
- **See**: `extensions/email-interface/AGENTS.md`

### event-sync
- **Type**: Hook extension
- **Technology**: Node.js hook
- **Purpose**: Event synchronization
- **See**: `extensions/event-sync/AGENTS.md`

### phone-bundle
- **Type**: Bundle extension (interface + hook)
- **Technology**: Vue.js interface with Node.js hook
- **Purpose**: Phone number input field with formatting and server-side validation
- **See**: `extensions/phone-bundle/AGENTS.md`

### process-map-module
- **Type**: Module extension
- **Technology**: Vue Flow for rendering
- **Purpose**: Process map visualization and editing
- **See**: `extensions/process-map-module/AGENTS.md`

### report-designer-module
- **Type**: Module extension
- **Technology**: Vue.js with report design tools
- **Purpose**: Report designer interface
- **See**: `extensions/report-designer-module/AGENTS.md`

### report-viewer
- **Type**: Module extension
- **Technology**: Vue.js
- **Purpose**: Report viewing interface
- **See**: `extensions/report-viewer/AGENTS.md`

### ssn-bundle
- **Type**: Bundle extension (interface + hook)
- **Technology**: Vue.js interface with Node.js hook
- **Purpose**: SSN input field with formatting, masking, and server-side validation
- **Components**:
  - Interface: Client-side SSN formatting (XXX-XX-XXXX), optional masking, validation
  - Hook: Server-side validation enforcing 9-digit format on save
- **See**: `extensions/ssn-bundle/AGENTS.md`

### tenant-hook
- **Type**: Hook extension
- **Technology**: Node.js hook
- **Purpose**: Tenant management and isolation
- **See**: `extensions/tenant-hook/AGENTS.md`

### workflow-module
- **Type**: Module extension
- **Technology**: Vue Flow for rendering
- **Purpose**: Workflow visualization and editing
- **See**: `extensions/workflow-module/AGENTS.md`

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
```
extensions/
├── address-completion-interface/
├── email-bundle/
├── email-interface/
├── event-sync/
├── phone-bundle/
├── process-map-module/
├── report-designer-module/
├── report-viewer/
├── ssn-bundle/
├── tenant-hook/
└── workflow-module/
```

Each extension follows this structure:
```
extension-name/
├── src/
│   ├── index.ts (or interface.ts, hook.ts, etc.)
│   └── [component files]
├── dist/
├── package.json
├── tsconfig.json
└── [extension-specific files]
```

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
- Extensions are modular packages that extend Directus functionality
- Each extension type serves a specific purpose (interfaces, hooks, modules)
- Extensions are independently built and loaded by Directus

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

## Common Tasks
- Building extensions: `pnpm build`
- Starting environment: `docker compose up -d`
- Viewing logs: `docker compose logs -f`
- Stopping environment: `docker compose down`

## Adding a New Extension

When adding a new extension to the repository:

1. **Create the extension directory** in `extensions/`
2. **Set up the extension structure** following the pattern of existing extensions
3. **Update this AGENTS.md file** - Add the new extension to the Extensions list with:
   - Type (interface, hook, module, bundle)
   - Technology stack
   - Purpose description
   - Reference to extension-specific AGENTS.md
4. **Create extension-specific AGENTS.md** - Create `extensions/new-extension/AGENTS.md` with:
   - Extension Overview (type, purpose, technology)
   - Architecture (component breakdown)
   - Development Guidelines (code changes, testing, file structure)
   - Key Implementation Details
   - CSS Guidelines (for module extensions)
   - Common Tasks
   - Important Rules
   - Resources
5. **Update README.md** (root) - Add the new extension to the Structure section
6. **Test the extension** - Ensure it builds and loads correctly in Directus
7. **Document the extension** - Create or update README.md in the extension directory

See existing extensions for examples of proper structure and documentation.

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

## Long-Term Task Management

When working across multiple sessions:

### At Session Start
1. **Review progress tracking files**
   - Check `progress.md` for current status and phase
   - Check `tasks.json` for active tasks and their states
   - Review git logs to understand recent changes: `git log --oneline -20`

2. **Prepare environment**
   - Verify Docker Compose environment is running: `docker compose ps`
   - Run fundamental integration tests before starting new features
   - Check for any uncommitted changes: `git status`

### During Work
1. **Track progress**
   - Update task states as work progresses
   - Document decisions and blockers in progress.md
   - Commit work frequently to preserve state: `git add . && git commit -m "message"`

2. **Maintain context**
   - Keep progress.md updated with current phase and status
   - Update tasks.json with task states (NOT_STARTED, IN_PROGRESS, COMPLETE, BLOCKED)
   - Document any architectural decisions or technical learnings

### Before Context Refresh
1. **Finalize progress tracking**
   - Update `progress.md` with final status
   - Update `tasks.json` with all task states
   - Document any blockers or next steps clearly

2. **Preserve state**
   - Commit all changes: `git add . && git commit -m "message"`
   - Push changes if applicable: `git push`
   - Ensure progress files are committed

### Progress Tracking Files

**progress.md** - High-level status tracking
- Current phase/milestone
- Overall progress percentage
- Key blockers or issues
- Recent decisions and rationale
- Next immediate steps

**tasks.json** - Structured task list
```json
{
  "tasks": [
    {
      "id": "unique-id",
      "name": "Task name",
      "description": "Task description",
      "state": "NOT_STARTED|IN_PROGRESS|COMPLETE|BLOCKED",
      "priority": "high|medium|low",
      "blockers": "Description of any blockers"
    }
  ]
}
```

These files enable seamless resumption of work across sessions and provide clear context for future work.
