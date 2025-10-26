# Report Designer Module Extension for Directus

A Directus module extension that provides a report designer interface for creating and editing reports.

## Features

- **Visual report design**: Create reports with an intuitive designer interface
- **Field selection**: Choose fields from Directus collections
- **Layout configuration**: Customize report layout and formatting
- **Template management**: Save and manage report templates
- **Preview functionality**: Preview reports before saving
- **Real-time updates**: Changes are automatically saved to Directus

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
2. Select "Report Designer" to open the module
3. The report designer interface will load

### Creating a Report

1. Click "New Report" to create a new report template
2. Select the collection to report on
3. Choose fields to include in the report
4. Configure report layout and formatting
5. Preview the report
6. Save the report template

### Report Configuration

- **Collection**: Select which collection to report on
- **Fields**: Choose which fields to include
- **Layout**: Configure report layout (table, list, etc.)
- **Formatting**: Set formatting options for fields
- **Filters**: Add filters to limit report data

### Report Templates

- **Save**: Save your report design as a template
- **Load**: Load previously saved report templates
- **Edit**: Modify existing report templates
- **Delete**: Remove report templates

## Configuration

The extension works out of the box with no additional configuration required. Report templates are automatically stored in Directus collections.

## Development

### Building

```bash
cd extensions/report-designer-module
pnpm build
```

### Testing

```bash
cd extensions/report-designer-module
pnpm test
```

### File Structure

```
report-designer-module/
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

### Report Design

The module provides:
- Collection and field selection
- Layout configuration interface
- Formatting options
- Preview functionality

### Data Management

- Report templates are loaded from Directus collections
- Changes are persisted back to the database
- Report definitions are stored in JSON format
- Templates can be versioned and managed

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

### Fields not appearing

1. Verify the collection is accessible
2. Check that fields are not hidden
3. Verify you have read permissions on the collection
4. Check browser console for errors

## Technical Details

- **Type**: Module extension
- **Technology**: Vue.js
- **Directus Version**: Compatible with Directus 9.0+
- **License**: See LICENSE file

## Support

For issues or questions:
1. Check the [Directus Documentation](https://docs.directus.io/)
2. Review the extension's AGENTS.md for development guidelines
3. Check the browser console for error messages

