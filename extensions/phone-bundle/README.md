# Phone Bundle Extension for Directus

A Directus bundle extension that provides phone number input field with client-side formatting and server-side validation.

## Features

- **Automatic formatting**: Formats phone numbers as (XXX) XXX-XXXX as users type
- **Client-side validation**: Real-time validation feedback in the Directus UI
- **Server-side validation**: Enforces phone number format validation on the API server
- **User-friendly errors**: Clear validation messages
- **Data integrity**: Prevents invalid phone numbers from being saved to the database
- **Easy integration**: Works seamlessly with Directus collections

## What's Included

This bundle extension contains:

1. **Interface** - Vue.js component for phone number input field
   - Automatic formatting as users type
   - Real-time validation feedback
   - Displays validation errors to users

2. **Hook** - Node.js server-side validation
   - Intercepts create and update operations
   - Validates phone number format before database save
   - Throws validation errors for invalid phone numbers

## Installation

To install the extension, follow the [Official Directus Guide](https://docs.directus.io/extensions/installing-extensions.html).

### Quick Start

1. Copy the extension to your Directus extensions directory
2. Run `pnpm build` to build the extension
3. Restart Directus
4. The extension will be automatically loaded

## Usage

### Setting Up a Phone Number Field

1. In Directus, create a new field or edit an existing one
2. Set the interface to "Phone"
3. The field will now use the phone bundle extension
4. Users will see automatic formatting and validation feedback

### Formatting

Phone numbers are automatically formatted as users type:
- Input: `1234567890`
- Display: `(123) 456-7890`

### Validation Rules

- Phone number must contain 10 digits (US format)
- Non-digit characters are automatically removed
- Server-side validation prevents invalid phone numbers from being saved

## Configuration

The extension works out of the box with no additional configuration required. The formatting and validation rules are automatically applied to all fields using the phone interface.

## Development

### Building

```bash
cd extensions/phone-bundle
pnpm build
```

### Testing

```bash
cd extensions/phone-bundle
pnpm test
```

### File Structure

```
phone-bundle/
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
- Automatic phone number formatting as users type
- Real-time validation feedback
- Visual feedback for valid/invalid phone numbers
- User-friendly error messages
- Accessible form input

### Server-Side (Hook)

The hook provides:
- Validation on item creation
- Validation on item updates
- Prevents invalid phone numbers from reaching the database
- Identifies phone fields by interface type

## Troubleshooting

### Formatting not working

1. Verify the extension is loaded
2. Check that `pnpm build` completed successfully
3. Restart Directus
4. Check browser console for errors

### Validation not working on API calls

This is expected behavior. The interface validation is client-side only. For API calls, the hook validation will catch invalid phone numbers and return an error.

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

