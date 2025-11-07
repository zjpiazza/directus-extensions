---
applyTo: '**'
---
# Directus Extensions Development Guide

This repository is a **monorepo** containing multiple custom Directus extensions built as standalone packages with Docker-based local development.

> **Note**: Extension-specific development guidelines are now organized in `.copilot/` files for better Copilot integration. See `.copilot/global-extensions.instructions.md` and individual extension `.copilot/instructions.md` files for detailed patterns.

## Feature Development Workflow

When implementing new features or changes, **always follow this 8-step process**:

### 1. Analyze
- Fully understand the task requirements
- **Use Context7 MCP tool** (`resolve-library-id` → `get-library-docs`) to gather contextual documentation for all relevant technologies (Directus APIs, Vue 3, TypeScript patterns, etc.)
- **Use Directus MCP tool** (`mcp_directus_schema`) to discover existing collections, fields, and relationships in the connected Directus instance
- **Use GitHub MCP tool** to search for similar implementations, code patterns, and best practices in relevant repositories (e.g., search for Vue 3 composables, TypeScript patterns, Directus extension examples)
- Research existing code patterns in the repository

### 2. Plan
- Synthesize an implementation plan based on gathered information
- Consider: files to modify, new files to create, dependencies needed, API changes
- Think about edge cases and error handling

### 3. Approval
- **Present the plan to the user and wait for confirmation**
- Iterate on the plan based on user feedback
- Do not proceed to implementation until user approves

### 4. Implement
- Make the code changes according to the approved plan
- Follow the project's TypeScript strict mode and Vue 3 conventions

### 5. Build
- Rebuild **only the affected extension(s)** after changes
- Run `npm run build` or `npm run dev` in the specific extension directory
- **Never run builds recursively** for all extensions - only build what changed

### 6. Test
- **Use Browser MCP tool** to capture screenshots of the extension in action
- May require user to provide URL where extension is visible
- If errors occur, **use Chrome DevTools MCP** to examine JavaScript console
- **Use Directus MCP tool** to verify data operations (create test items, query collections, validate flows)
- Verify the feature works as expected visually and functionally

### 7. Documentation
- After user confirms successful implementation, update documentation
- Update `/README.md` (repo root) for architectural changes
- Update `extensions/{extension-name}/README.md` for extension-specific features
- Ensure docs accurately reflect current state

### 8. Commit
- **Only after explicit user confirmation** that everything is correct
- Run `git diff` to review all changes
- Create a **Conventional Commit** message following format:
  - `feat(extension-name): add feature description`
  - `fix(extension-name): fix issue description`
  - `docs(extension-name): update documentation`
  - `refactor(extension-name): refactor description`

## Architecture

- **Monorepo structure**: Individual extensions live under `extensions/{extension-name}/`
- **Docker development**: Directus runs in Docker with hot-reload enabled via `EXTENSIONS_AUTO_RELOAD: "true"`
- **Critical volume mapping**: `./extensions/extensions:/directus/extensions` - note the double "extensions" path
  - Local: `extensions/{extension-name}/dist/` → Docker: `/directus/extensions/{extension-name}/dist/`
  - Built extensions must output to `dist/` to be loaded by Directus

## Creating New Extensions

Use the official Directus CLI to scaffold new extensions:

```bash
# From repository root
npx create-directus-extension

# Follow prompts to select:
# - Extension type (layout, module, panel, hook, etc.)
# - Extension name
# - Programming language (TypeScript recommended)
# - Location: extensions/{extension-name}
```

The CLI creates the proper structure with `package.json`, `tsconfig.json`, and starter code.

## Working with Directus MCP Tool

The **Directus MCP tool** provides direct access to the running Directus instance for schema discovery, data operations, and automation. Use it throughout development to interact with Directus programmatically.

### Schema Discovery

**Always start with schema discovery** to understand the data model:

```
# Discover all collections
mcp_directus_schema()
→ Returns: list of collections, collection folders, and descriptions

# Get detailed schema for specific collections
mcp_directus_schema(keys: ["cases", "participants", "case_notes"])
→ Returns: fields, types, relationships, interfaces for each collection
```

**When to use:**
- Before creating extensions that display or edit data
- To understand relationships between collections
- To validate field names and types before querying
- To discover available collections for dropdowns/selections

### Data Operations (CRUD)

Perform create, read, update, delete operations on any collection:

```typescript
// Read items with filtering
mcp_directus_items({
  action: "read",
  collection: "cases",
  query: {
    fields: ["id", "title", "status", "participants.*"],
    filter: { status: { _eq: "active" } },
    limit: 10
  }
})

// Create new items
mcp_directus_items({
  action: "create",
  collection: "case_notes",
  data: [{
    case_id: "abc-123",
    note: "Test note",
    created_by: "user-uuid"
  }]
})

// Update items
mcp_directus_items({
  action: "update",
  collection: "cases",
  keys: ["case-uuid"],
  data: { status: "closed" }
})

// Delete items (always confirm with user first!)
mcp_directus_items({
  action: "delete",
  collection: "case_notes",
  keys: ["note-uuid"]
})
```

### Schema Management

Create and modify collections, fields, and relationships:

```typescript
// Create a new collection
mcp_directus_collections({
  action: "create",
  data: {
    collection: "custom_data",
    fields: [{
      field: "id",
      type: "uuid",
      meta: { special: ["uuid"], hidden: true },
      schema: { is_primary_key: true }
    }],
    meta: { singleton: false }
  }
})

// Add fields to existing collection
mcp_directus_fields({
  action: "create",
  collection: "cases",
  data: [{
    field: "priority",
    type: "string",
    meta: { interface: "select-dropdown" },
    schema: { default_value: "medium" }
  }]
})

// Create relationships
mcp_directus_relations({
  action: "create",
  collection: "case_notes",
  field: "case_id",
  data: {
    collection: "case_notes",
    field: "case_id",
    related_collection: "cases",
    schema: { on_delete: "CASCADE" }
  }
})
```

### Automation with Flows

Create and manage Directus flows for automation:

```typescript
// Create a flow
mcp_directus_flows({
  action: "create",
  data: {
    name: "Auto-notify on case update",
    trigger: "event",
    status: "active",
    options: {
      type: "action",
      scope: ["items.update"],
      collections: ["cases"]
    }
  }
})

// Add operations to flow
mcp_directus_operations({
  action: "create",
  data: {
    flow: "flow-uuid",
    key: "send_notification",
    type: "notification",
    position_x: 19,
    position_y: 1,
    options: {
      recipient: ["admin-uuid"],
      subject: "Case Updated",
      message: "Case {{ $trigger.payload.title }} was updated"
    }
  }
})

// Trigger a manual flow
mcp_directus_trigger_flow({
  id: "flow-uuid",
  collection: "cases",
  keys: ["case-uuid"],
  data: { action: "export" }
})
```

### File Management

Work with files and folders in Directus:

```typescript
// List files
mcp_directus_files({
  action: "read",
  query: {
    fields: ["id", "title", "type", "filesize"],
    filter: { folder: { _eq: "case-documents" } }
  }
})

// Update file metadata
mcp_directus_files({
  action: "update",
  keys: ["file-uuid"],
  data: {
    title: "Case Report 2025",
    description: "Annual case summary",
    tags: ["reports", "2025"]
  }
})

// Create folders
mcp_directus_folders({
  action: "create",
  data: [{ name: "Case Documents", parent: null }]
})
```

### Common Patterns

**Mock Data Generation:**
```typescript
// Generate test cases for development
for (let i = 0; i < 10; i++) {
  mcp_directus_items({
    action: "create",
    collection: "cases",
    data: [{
      title: `Test Case ${i}`,
      status: "draft",
      description: "Generated for testing"
    }]
  })
}
```

**Extension Data Integration:**
```typescript
// Query data for extension display
// In layout component, extension can fetch via API
// Use MCP tool to validate queries during development
mcp_directus_items({
  action: "read",
  collection: "cases",
  query: {
    fields: ["*", "participants.person_id.*"],
    filter: { assigned_to: { _eq: "$CURRENT_USER" } }
  }
})
```

**Schema-First Development:**
```typescript
// 1. Discover schema
const schema = mcp_directus_schema(keys: ["cases"])

// 2. Understand fields and relationships
// 3. Build extension components based on actual schema
// 4. Use exact field names from schema in code
```

### Best Practices

- **Always discover before creating**: Use `mcp_directus_schema()` to check for existing collections/fields
- **Confirm destructive operations**: Ask user before deleting items, collections, or fields
- **Use specific queries**: Request only needed fields with `query.fields` to minimize data transfer
- **Test with real data**: Use MCP tool to create realistic test data that matches production schema
- **Validate assumptions**: Don't guess field names or types - query the schema first
- **Handle relationships properly**: Understand M2O, O2M, M2M patterns before creating relations

## Extension Structure Pattern

Each extension follows this structure (see `extensions/case-layout/` for reference):

```
extensions/{extension-name}/
├── package.json          # Must include "directus:extension" metadata
├── tsconfig.json         # Strict TypeScript config with ES2019 target
├── src/
│   ├── index.ts         # Entry point using defineLayout/defineModule/etc
│   ├── *.vue            # Vue 3 components
│   └── shims.d.ts       # Vue module declarations
└── dist/                # Build output (gitignored, Docker-mounted)
```

## Development Workflow

### Starting the Environment

```bash
# Start Directus + PostgreSQL
docker-compose up -d

# Access Directus admin at http://localhost:8055
# Default credentials: admin@example.com / directus
```

### Building Extensions

```bash
cd extensions/{extension-name}

# One-time build
npm run build

# Watch mode (automatic rebuild on file changes)
npm run dev
```

**Key insight**: Use `npm run dev` in extension directories while Docker is running. Changes auto-reload in Directus due to `EXTENSIONS_AUTO_RELOAD: "true"` + the volume mount watching `dist/` changes.

### Available Scripts Per Extension

- `build` - Production build with minification
- `dev` - Watch mode build without minification  
- `link` - Link extension for local Directus development
- `validate` - Validate extension metadata and structure

## Extension Development Patterns

### Layout Extensions (Example: case-layout)

Use `defineLayout` from `@directus/extensions-sdk`:

```typescript
import { defineLayout } from '@directus/extensions-sdk';
import LayoutComponent from './layout.vue';

export default defineLayout({
  id: 'custom',              // Unique identifier
  name: 'Custom',            // Display name in Directus UI
  icon: 'box',               // Material icon name
  component: LayoutComponent, // Vue 3 component
  slots: {                    // Optional UI extension points
    options: () => null,
    sidebar: () => null,
    actions: () => null,
  },
  setup() {                   // Composition API setup
    // Share reactive state with component
  },
});
```

### Vue Component Conventions

- Use Vue 3 Composition API or Options API
- Props must be explicitly typed and marked `required` when mandatory
- Include `inheritAttrs: false` when managing attrs manually
- Standard props from Directus: `collection`, layout-specific data

### TypeScript Configuration

Extensions use **strict TypeScript** (all strict flags enabled):
- `noImplicitAny`, `noImplicitThis`, `noImplicitReturns`
- `noUnusedLocals`, `noUnusedParameters`
- `noUncheckedIndexedAccess` - arrays/objects may be undefined
- `strictNullChecks` - explicit null/undefined handling required

### Package.json Requirements

Every extension must include `directus:extension` metadata:

```json
{
  "type": "module",
  "directus:extension": {
    "type": "layout",           // or "module", "panel", "hook", etc.
    "path": "dist/index.js",    // Build output entry point
    "source": "src/index.ts",   // Source entry point
    "host": "^10.10.0"          // Compatible Directus version
  }
}
```

## Troubleshooting

- **Extension not appearing**: Check `docker-compose logs directus` for load errors
- **Changes not reflecting**: Ensure `npm run dev` is running and check volume mount path
- **TypeScript errors**: Extensions use strict mode; all types must be explicit
- **Vue component errors**: Verify `shims.d.ts` exists for `.vue` file imports

## Key Files

- `docker-compose.yaml` - Defines Directus + PostgreSQL services with volume mounts
- `extensions/case-layout/src/index.ts` - Example layout extension entry point
- `extensions/case-layout/package.json` - Example extension package configuration