# Email Bundle Extension for Directus

A Directus bundle extension that provides email input field with client-side formatting and server-side validation.

## Features

- **Client-side formatting**: Real-time email validation feedback as users type
- **Server-side validation**: Enforces email format validation on the API server
- **User-friendly errors**: Clear validation messages in the Directus UI
- **Data integrity**: Prevents invalid emails from being saved to the database
- **Easy integration**: Works seamlessly with Directus collections

## What's Included

This bundle extension contains:

1. **Interface** - Vue.js component for email input field
   - Provides real-time validation feedback
   - Displays validation errors to users
   - Formats and validates email addresses

2. **Hook** - Node.js server-side validation
   - Intercepts create and update operations
   - Validates email format before database save
   - Throws validation errors for invalid emails

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
3. The field will now use the email bundle extension
4. Users will see real-time validation feedback

### Validation Rules

- Email must contain an `@` symbol
- Email must have a valid domain
- Email format must follow standard email conventions
- Server-side validation prevents invalid emails from being saved

## Configuration

The extension works out of the box with no additional configuration required. The validation rules are automatically applied to all fields using the email interface.

## Development

### Building

```bash
cd extensions/email-bundle
pnpm build
```

### Testing

```bash
cd extensions/email-bundle
pnpm test
```

### File Structure

```
email-bundle/
├── src/
│   ├── interface/
│   │   ├── index.ts          # Interface definition
│   │   └── interface.vue     # Vue component
│   └── hook/
│       └── index.ts          # Hook implementation
├── package.json
└── tsconfig.json
```

## How It Works

### Client-Side (Interface)

The Vue component provides:
- Real-time email validation as users type
- Visual feedback for valid/invalid emails
- User-friendly error messages
- Accessible form input

### Server-Side (Hook)

The hook provides:
- Validation on item creation
- Validation on item updates
- Prevents invalid data from reaching the database
- Identifies email fields by interface type

## Troubleshooting

### Validation not working on API calls

This is expected behavior. The interface validation is client-side only. For API calls, the hook validation will catch invalid emails and return an error.

### Extension not loading

1. Verify the extension is in the correct directory
2. Check that `pnpm build` completed successfully
3. Restart Directus
4. Check browser console for errors

## Technical Details

- **Type**: Bundle extension (interface + hook)
- **Technology**: Vue.js (interface), Node.js (hook)
- **Directus Version**: Compatible with Directus 9.0+
- **License**: See LICENSE file

## Support

For issues or questions:
1. Check the [Directus Documentation](https://docs.directus.io/)
2. Review the extension's AGENTS.md for development guidelines
3. Check the browser console for error messages

