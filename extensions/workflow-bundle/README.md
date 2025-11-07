# Workflow Bundle

A Directus extension bundle that provides visual workflow design and management capabilities. Combines a module UI for workflow editing with a hook for automatic collection setup.

## Features

- **Visual Workflow Design**: Node-based workflow editor using Vue Flow
- **Multiple Node Types**: Start, Process, Decision, End, and Page nodes
- **Multi-Page Workflows**: Organize complex workflows across multiple pages
- **Real-Time Updates**: Automatic persistence of workflow changes
- **Automatic Setup**: Hook creates the workflows collection on startup
- **Zoom & Pan**: Navigate large workflows with canvas controls

## Bundle Contents

### Module Entry
- **Type**: Module
- **Name**: workflow
- **Source**: `src/module/index.ts`
- **Features**:
  - Interactive workflow canvas
  - Node palette for adding workflow steps
  - Connection management between nodes
  - Page navigation for multi-page workflows
  - Real-time data persistence
  - Workflow metadata editing (name, description)

### Hook Entry
- **Type**: Hook
- **Name**: workflow-setup
- **Source**: `src/hook/index.ts`
- **Features**:
  - Automatic workflows collection creation
  - Field initialization with proper interfaces
  - Idempotent (safe to run multiple times)
  - Runs on Directus startup

## Installation

1. Build the extension:
   ```bash
   cd extensions/workflow-bundle
   pnpm build
   ```

2. Restart Directus - the hook will automatically create the workflows collection

## Workflows Collection Schema

The hook automatically creates a `workflows` collection with the following fields:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | UUID | Yes | Primary key (auto-generated) |
| `name` | String | Yes | Workflow display name |
| `description` | Text | No | Optional workflow description |
| `nodes` | JSON | Yes | Vue Flow node definitions |
| `edges` | JSON | Yes | Node connections |
| `pages` | JSON | No | Multi-page workflow definitions |
| `currentPageId` | String | No | Currently active page ID (default: "root") |
| `pageViewports` | JSON | No | Canvas viewport state per page |

### Field Examples

**nodes** - Array of workflow steps:
```json
[
  {
    "id": "start-1",
    "type": "start",
    "position": { "x": 0, "y": 0 },
    "data": { "label": "Start" }
  },
  {
    "id": "process-1",
    "type": "process",
    "position": { "x": 200, "y": 0 },
    "data": { "label": "Process Order" }
  }
]
```

**edges** - Connections between nodes:
```json
[
  {
    "id": "edge-1",
    "source": "start-1",
    "target": "process-1",
    "label": "proceed"
  }
]
```

**pages** - Multi-page workflow support:
```json
[
  {
    "id": "page-1",
    "name": "Main Flow",
    "color": "#3b82f6",
    "parentPageId": null
  }
]
```

**pageViewports** - Canvas state per page:
```json
{
  "root": { "x": 0, "y": 0, "zoom": 1 },
  "page-1": { "x": 100, "y": 50, "zoom": 1.5 }
}
```

## Usage

### Accessing the Module

1. Navigate to the Modules section in Directus
2. Select "Workflow" to open the module
3. Use the sidebar to browse existing workflows
4. Click a workflow to load it into the canvas

### Creating a Workflow

1. Open the Workflow module
2. Use the Node Palette to add workflow steps
3. Connect nodes by dragging from one node to another
4. Edit node properties in the Details sidebar
5. Save changes (auto-persisted)

### Node Types

- **Start Node**: Entry point for the workflow
- **Process Node**: Standard workflow step
- **Decision Node**: Branching logic (multiple outputs)
- **End Node**: Workflow termination point
- **Page Node**: Reference to another workflow page

## Hook Implementation

The workflow hook runs on Directus startup and:

1. Checks if the `workflows` collection exists
2. If not found, creates the collection with metadata:
   - Display template: `{{ name }}`
   - Icon: `bolt`
   - Note: "Workflow definitions for the workflow module"
3. Creates all required fields with proper Directus interfaces
4. Logs success/error messages to console

### Error Handling

- Wrapped in try-catch block
- Gracefully handles if collection already exists
- Logs errors to console for debugging
- Safe to run multiple times

## Development

### Project Structure

```
src/
├── module/              # Workflow module UI
│   ├── index.ts         # Module entry point
│   ├── module.vue       # Main component
│   ├── components/      # UI components (13 total)
│   ├── composables/     # Vue composables (15 total)
│   ├── flow-nodes/      # Vue Flow node types
│   └── utils/           # Helper functions
├── hook/                # Collection setup hook
│   └── index.ts         # Hook implementation
└── shims.d.ts           # TypeScript declarations
```

### Building

```bash
# Development build with watch
pnpm dev

# Production build
pnpm build

# Validate extension
pnpm validate
```

### Dependencies

- `@vue-flow/core` - Node-based graph visualization
- `@vue-flow/controls` - Canvas controls (zoom, pan)
- `@vue-flow/background` - Canvas background
- `@vue-flow/minimap` - Minimap navigation
- `@vue-flow/node-resizer` - Node resizing
- `vue` - Vue 3.5+

## Testing

### Manual Testing

1. Delete the `workflows` collection from Directus
2. Restart Directus
3. Verify collection is recreated with all fields
4. Open the Workflow module and create a test workflow

### API Verification

```bash
# Check if collection exists
curl http://localhost:8055/admin/api/collections

# Check if fields exist
curl http://localhost:8055/admin/api/fields/workflows

# List workflows
curl http://localhost:8055/admin/api/items/workflows
```

## Troubleshooting

### Collection Not Created

- Check Directus logs for errors
- Verify hook is loaded: rebuild and restart
- Check database permissions

### Fields Missing

- Verify hook ran (check console logs)
- Check field creation errors in logs
- Manually create missing fields if needed

### Module Not Loading

- Verify bundle built successfully
- Check browser console for JavaScript errors
- Restart Directus

## Build Output

- `dist/app.js` (299 KB) - Client-side module UI
- `dist/api.js` (46 KB) - Server-side hook

## Compatibility

- **Directus Version**: 10.10.0+
- **Node.js**: 18+
- **Vue**: 3.5+

## License

Same as parent Directus extensions repository

