# SSN Bundle Extension for Directus

A Directus bundle extension that provides SSN (Social Security Number) input field with client-side formatting, optional masking, and server-side validation.

## Features

- **Automatic formatting**: Formats SSN as XXX-XX-XXXX as users type
- **Optional masking**: Hide SSN digits for privacy (displays as XXX-XX-XXXX)
- **Client-side validation**: Real-time validation feedback in the Directus UI
- **Server-side validation**: Enforces 9-digit SSN format on the API server
- **User-friendly errors**: Clear validation messages
- **Data integrity**: Prevents invalid SSNs from being saved to the database
- **Security-focused**: Designed with sensitive data handling in mind

## What's Included

This bundle extension contains:

1. **Interface** - Vue.js component for SSN input field
   - Automatic formatting as users type
   - Optional masking for privacy
   - Real-time validation feedback
   - Displays validation errors to users

2. **Hook** - Node.js server-side validation
   - Intercepts create and update operations
   - Validates 9-digit SSN format before database save
   - Throws validation errors for invalid SSNs

## Installation

To install the extension, follow the [Official Directus Guide](https://docs.directus.io/extensions/installing-extensions.html).

### Quick Start

1. Copy the extension to your Directus extensions directory
2. Run `pnpm build` to build the extension
3. Restart Directus
4. The extension will be automatically loaded

## Usage

### Setting Up an SSN Field

1. In Directus, create a new field or edit an existing one
2. Set the interface to "SSN"
3. Configure masking option (optional)
4. The field will now use the SSN bundle extension
5. Users will see automatic formatting and validation feedback

### Formatting

SSN numbers are automatically formatted as users type:
- Input: `123456789`
- Display: `123-45-6789`

### Masking

When masking is enabled:
- Display: `XXX-XX-6789` (only last 4 digits visible)
- Stored value: `123-45-6789` (full SSN)

### Validation Rules

- SSN must contain exactly 9 digits
- Non-digit characters are automatically removed
- Server-side validation prevents invalid SSNs from being saved

## Configuration

### Interface Options

- **Enable Masking**: Toggle to show/hide SSN digits (default: enabled)
- **Mask Character**: Character to use for masking (default: X)

The extension works out of the box with default settings. The formatting and validation rules are automatically applied to all fields using the SSN interface.

## Security Considerations

### Data Protection

- SSN data is sensitive - handle with appropriate security measures
- Consider enabling database encryption for SSN fields
- Implement proper access controls and audit logging
- Follow compliance requirements (GDPR, CCPA, etc.)
- Regularly review access logs for suspicious activity

### Best Practices

1. **Limit access**: Restrict who can view SSN fields
2. **Audit logging**: Enable audit logs for SSN field access
3. **Encryption**: Consider encrypting SSN data at rest
4. **Masking**: Use masking in UI to limit exposure
5. **Compliance**: Follow applicable data protection regulations

## Development

### Building

```bash
cd extensions/ssn-bundle
pnpm build
```

### Testing

```bash
cd extensions/ssn-bundle
pnpm test
```

### File Structure

```
ssn-bundle/
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
- Automatic SSN formatting as users type
- Optional masking for privacy
- Real-time validation feedback
- Visual feedback for valid/invalid SSNs
- User-friendly error messages

### Server-Side (Hook)

The hook provides:
- Validation on item creation
- Validation on item updates
- Prevents invalid SSNs from reaching the database
- Identifies SSN fields by interface type

## Troubleshooting

### Formatting not working

1. Verify the extension is loaded
2. Check that `pnpm build` completed successfully
3. Restart Directus
4. Check browser console for errors

### Masking not working

1. Verify masking is enabled in field configuration
2. Check browser console for errors
3. Verify the field is using the SSN interface

### Validation not working on API calls

This is expected behavior. The interface validation is client-side only. For API calls, the hook validation will catch invalid SSNs and return an error.

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

