# Event Sync Hook Extension for Directus

A Directus hook extension that provides event synchronization across the Directus system.

## Features

- **Event interception**: Intercepts Directus lifecycle events
- **Event routing**: Routes events to appropriate handlers
- **Event filtering**: Filters events based on configuration
- **Synchronization**: Maintains event synchronization state
- **Error handling**: Graceful error handling for event processing

## Installation

To install the extension, follow the [Official Directus Guide](https://docs.directus.io/extensions/installing-extensions.html).

### Quick Start

1. Copy the extension to your Directus extensions directory
2. Run `pnpm build` to build the extension
3. Restart Directus
4. The extension will be automatically loaded

## Usage

The event-sync hook automatically intercepts Directus lifecycle events and synchronizes them across the system. No additional configuration is required.

### Supported Events

The hook intercepts the following Directus events:
- `items.create` - When items are created
- `items.update` - When items are updated
- `items.delete` - When items are deleted
- Other Directus lifecycle events

## Configuration

The extension works out of the box with no additional configuration required. Event synchronization is automatically applied to all collections.

## Development

### Building

```bash
cd extensions/event-sync
pnpm build
```

### Testing

```bash
cd extensions/event-sync
pnpm test
```

### File Structure

```
event-sync/
├── src/
│   └── index.ts              # Hook implementation
├── package.json
└── tsconfig.json
```

## How It Works

The hook provides:
- Event interception at the API server level
- Event filtering based on configuration
- Event routing to appropriate handlers
- Synchronization state management
- Error handling and logging

## Monitoring

### Checking Event Processing

1. Check Directus API logs for event processing
2. Monitor system performance for event handling
3. Review error logs for any synchronization issues

### Debugging

Enable debug logging to see event processing:
1. See root repository debugging guidelines
2. Review API logs for event details
3. Check browser console for any client-side issues

## Troubleshooting

### Events not being synchronized

1. Verify the extension is loaded: Check Directus logs
2. Check that `pnpm build` completed successfully
3. Restart Directus
4. Review API logs for errors

### Performance issues

1. Check the number of events being processed
2. Review event filtering configuration
3. Monitor system resources
4. Consider optimizing event handlers

## Technical Details

- **Type**: Hook extension
- **Technology**: Node.js
- **Directus Version**: Compatible with Directus 9.0+
- **License**: See LICENSE file

## Support

For issues or questions:
1. Check the [Directus Documentation](https://docs.directus.io/)
2. Review the extension's AGENTS.md for development guidelines
3. Check the API logs for error messages

