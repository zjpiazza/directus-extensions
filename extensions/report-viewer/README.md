# Report Viewer Module Extension for Directus

A Directus module extension that provides a report viewing interface for displaying generated reports.

## Features

- **Report display**: View reports in a clean, organized interface
- **Data filtering**: Filter report data by various criteria
- **Sorting**: Sort report data by any column
- **Export functionality**: Export reports to multiple formats
- **Pagination**: Handle large reports with pagination
- **Responsive design**: Works on desktop and mobile devices

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
2. Select "Report Viewer" to open the module
3. The report viewer interface will load

### Viewing Reports

1. Select a report from the available reports list
2. The report data will load and display
3. Use the toolbar to interact with the report

### Filtering Data

1. Click the "Filter" button to open filter options
2. Select fields to filter on
3. Enter filter values
4. Click "Apply" to filter the report

### Sorting Data

1. Click on column headers to sort
2. Click again to reverse sort order
3. Multiple column sorting is supported

### Exporting Reports

1. Click the "Export" button
2. Select export format (CSV, Excel, PDF, etc.)
3. The report will be downloaded

### Pagination

- Use pagination controls at the bottom of the report
- Select page size from the dropdown
- Navigate between pages using arrow buttons

## Configuration

The extension works out of the box with no additional configuration required. Reports are loaded from Directus collections.

## Development

### Building

```bash
cd extensions/report-viewer
pnpm build
```

### Testing

```bash
cd extensions/report-viewer
pnpm test
```

### File Structure

```
report-viewer/
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

### Report Rendering

The module provides:
- Report data loading from Directus
- Data formatting and display
- Column rendering for various data types
- Responsive layout

### User Interactions

- Filtering and sorting controls
- Export functionality
- Pagination controls
- View state management

## Troubleshooting

### Module not loading

1. Verify the extension is in the correct directory
2. Check that `pnpm build` completed successfully
3. Restart Directus
4. Check browser console for errors

### Reports not loading

1. Verify Directus is running and accessible
2. Check that you have read permissions
3. Verify report data exists
4. Check browser console for errors

### Export not working

1. Verify you have export permissions
2. Check browser console for errors
3. Try a different export format
4. Check system resources

### Performance issues

1. Check the size of your report data
2. Consider filtering data before viewing
3. Monitor browser performance
4. Check system resources

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

