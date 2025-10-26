# Process Map Module Extension for Directus

A Directus module extension that provides process map visualization and editing using Vue Flow.

## Features

- **Visual process mapping**: Create and visualize process flows with an interactive canvas
- **Node-based editing**: Add, edit, and delete process nodes
- **Connection management**: Create and manage connections between process steps
- **Real-time updates**: Changes are automatically saved to Directus
- **Zoom and pan**: Navigate large process maps easily
- **Data persistence**: Process maps are stored in Directus collections

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
2. Select "Process Map" to open the module
3. The process map canvas will load

### Creating a Process Map

1. Click on the canvas to add nodes
2. Select node types from the palette
3. Connect nodes by dragging from one node to another
4. Edit node properties in the details sidebar
5. Changes are automatically saved

### Node Types

- **Start Node**: Beginning of the process
- **Process Node**: Standard process step
- **Decision Node**: Conditional branching
- **End Node**: Process termination

### Navigation

- **Zoom**: Use mouse wheel or zoom controls
- **Pan**: Click and drag the canvas
- **Select**: Click on nodes or edges to select them
- **Edit**: Double-click nodes to edit properties

## Configuration

The extension works out of the box with no additional configuration required. Process maps are automatically stored in Directus collections.

## Development

### Building

```bash
cd extensions/process-map-module
pnpm build
```

### Testing

```bash
cd extensions/process-map-module
pnpm test
```

### File Structure

```
process-map-module/
├── src/
│   ├── index.ts              # Module definition
│   ├── module.vue            # Main module component
│   ├── components/           # Reusable components
│   ├── composables/          # Composition functions
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

- Process maps are loaded from Directus collections
- Changes are persisted back to the database
- Concurrent updates are handled gracefully
- Data consistency is maintained

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

### Performance issues

1. Check the size of your process map
2. Consider breaking large maps into smaller ones
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

