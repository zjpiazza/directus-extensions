# Workflow Module Extension for Directus

A Directus module extension that provides workflow visualization and editing using Vue Flow.

## Features

- **Visual workflow design**: Create and visualize workflows with an interactive canvas
- **Node-based editing**: Add, edit, and delete workflow nodes
- **Connection management**: Create and manage connections between workflow steps
- **Multiple node types**: Start, Process, Decision, End, and Page nodes
- **Real-time updates**: Changes are automatically saved to Directus
- **Zoom and pan**: Navigate large workflows easily
- **Data persistence**: Workflows are stored in Directus collections
- **Workflow navigation**: Click workflows in sidebar to load them into the canvas

## Installation

To install the extension, follow the [Official Directus Guide](https://docs.directus.io/extensions/installing-extensions.html).

### Quick Start

1. Copy the extension to your Directus extensions directory
2. Run `pnpm build` to build the extension
3. Restart Directus
4. The extension will be automatically loaded as a module

## Usage

### Accessing the Module

1. In Directus, navigate to the Modules section
2. Select "Workflow" to open the module
3. The workflow canvas will load

### Loading a Workflow

1. Use the Navigation Sidebar to browse available workflows
2. Click on a workflow to load it into the canvas
3. The workflow data will load and display
4. The workflow name will appear at the top

### Creating a Workflow

1. Click on the canvas to add nodes
2. Select node types from the palette
3. Connect nodes by dragging from one node to another
4. Edit node properties in the details sidebar
5. Changes are automatically saved

### Node Types

- **Start Node**: Beginning of the workflow
- **Process Node**: Standard workflow step
- **Decision Node**: Conditional branching
- **End Node**: Workflow termination
- **Page Node**: Multi-page workflow support

### Editing Workflows

- **View Mode**: Workflow name displays as plain text
- **Edit Mode**: Workflow name becomes an editable input field
- **Toggle Mode**: Use the mode button to switch between view and edit modes

### Navigation

- **Zoom**: Use mouse wheel or zoom controls
- **Pan**: Click and drag the canvas
- **Select**: Click on nodes or edges to select them
- **Edit**: Double-click nodes to edit properties
- **Delete**: Select and press Delete to remove nodes

## Configuration

The extension works out of the box with no additional configuration required. Workflows are automatically stored in Directus collections.

## Development

### Building

```bash
cd extensions/workflow-module
pnpm build
```

### Testing

```bash
cd extensions/workflow-module
pnpm test
```

### File Structure

```
workflow-module/
├── src/
│   ├── index.ts              # Module definition
│   ├── module.vue            # Main module component
│   ├── components/           # Reusable components
│   ├── composables/          # Composition functions
│   ├── flow-nodes/           # Custom node types
│   └── utils/                # Utility functions
├── package.json
└── tsconfig.json
```

## How It Works

### Vue Flow Integration

The module uses Vue Flow for:
- Node-based visualization
- Connection management
- Interactive canvas interactions
- Zoom and pan functionality

### Data Management

- Workflows are loaded from Directus collections
- Changes are persisted back to the database
- Concurrent updates are handled gracefully
- Data consistency is maintained

### Navigation

- Clicking workflows in the sidebar loads them into the canvas
- Does NOT navigate to /admin/content/{collection}/{id}
- Workflow name renders as plain text in view mode
- Workflow name renders as editable input in edit mode

## Troubleshooting

### Module not loading

1. Verify the extension is in the correct directory
2. Check that `pnpm build` completed successfully
3. Restart Directus
4. Check browser console for errors

### Changes not saving

1. Verify Directus is running and accessible
2. Check that you have write permissions
3. Review browser console for errors
4. Check Directus API logs

### Workflows not loading from sidebar

1. Verify workflows exist in the collection
2. Check that you have read permissions
3. Verify the collection is properly configured
4. Check browser console for errors

### Performance issues

1. Check the size of your workflows
2. Consider breaking large workflows into smaller ones
3. Monitor browser performance
4. Check system resources

## Technical Details

- **Type**: Module extension
- **Technology**: Vue.js, Vue Flow
- **Directus Version**: Compatible with Directus 9.0+
- **License**: See LICENSE file

## Support

For issues or questions:
1. Check the [Directus Documentation](https://docs.directus.io/)
2. Review the extension's AGENTS.md for development guidelines
3. Check the browser console for error messages

