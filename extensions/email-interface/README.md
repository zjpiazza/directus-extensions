# Email Interface Extension for Directus

A Directus interface extension that provides an email input field with client-side validation and formatting.

## Features

- **Real-time validation**: Email validation feedback as users type
- **User-friendly errors**: Clear validation messages in the Directus UI
- **Standard email format**: Validates against standard email conventions
- **Easy integration**: Works seamlessly with Directus collections

## Important Note

This is a **client-side only** interface extension. It provides validation feedback in the Directus UI but cannot enforce validation on API calls or direct database operations.

For server-side validation that prevents invalid emails from being saved via API, use the **email-bundle** extension instead, which includes both client-side interface and server-side hook validation.

## Installation

To install the extension, follow the [Official Directus Guide](https://docs.directus.io/extensions/installing-extensions.html).

### Quick Start

1. Copy the extension to your Directus extensions directory
2. Run `pnpm build` to build the extension
3. Restart Directus
4. The extension will be automatically loaded

## Usage

### Setting Up an Email Field

1. In Directus, create a new field or edit an existing one
2. Set the interface to "Email"
3. The field will now use the email interface extension
4. Users will see real-time validation feedback

### Validation Rules

- Email must contain an `@` symbol
- Email must have a valid domain
- Email format must follow standard email conventions

## Configuration

The extension works out of the box with no additional configuration required. The validation rules are automatically applied to all fields using the email interface.

## Development

### Building

```bash
cd extensions/email-interface
pnpm build
```

### Testing

```bash
cd extensions/email-interface
pnpm test
```

### File Structure

```
email-interface/
├── src/
│   ├── index.ts              # Interface definition
│   └── interface.vue         # Vue component
├── package.json
└── tsconfig.json
```

## How It Works

The Vue component provides:
- Real-time email validation as users type
- Visual feedback for valid/invalid emails
- User-friendly error messages
- Accessible form input

## Limitations

### Client-Side Only

This interface extension provides validation feedback in the Directus UI, but:
- API calls can bypass this validation
- Direct database operations are not validated
- Invalid emails can be saved via API if no server-side validation exists

### For Server-Side Validation

If you need to enforce email validation on the server side:
1. Use the **email-bundle** extension instead
2. Or create a separate hook extension for server-side validation

## Troubleshooting

### Validation not working on API calls

This is expected behavior. The interface validation is client-side only. To enforce validation on API calls, use the email-bundle extension or create a hook extension.

### Extension not loading

1. Verify the extension is in the correct directory
2. Check that `pnpm build` completed successfully
3. Restart Directus
4. Check browser console for errors

## Technical Details

- **Type**: Interface extension
- **Technology**: Vue.js
- **Directus Version**: Compatible with Directus 9.0+
- **License**: See LICENSE file

## Support

For issues or questions:
1. Check the [Directus Documentation](https://docs.directus.io/)
2. Review the extension's AGENTS.md for development guidelines
3. Check the browser console for error messages

