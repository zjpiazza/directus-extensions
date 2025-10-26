# AGENTS.md - Phone Bundle Extension

## Quick Reference

**Type**: Bundle extension (interface + hook)
**Purpose**: Phone number input field with client-side formatting and server-side validation
**Technology**: Vue.js interface with Node.js hook

**For user-facing documentation, see**: [README.md](README.md)

## Development Guidelines

### Code Changes
- Always test changes locally before committing
- Use `pnpm build` after every change
- Remove debug console.log statements after confirming changes work
- Keep only essential logging (errors, critical state changes)

### Testing
- Test phone number formatting with various formats
- Test both valid and invalid phone numbers
- Verify server-side validation prevents invalid data
- Test integration with Directus collections
- Test international phone number support if applicable
- Run tests with `pnpm test`

### File Structure
```
phone-bundle/
├── src/
│   ├── interface/
│   │   ├── index.ts          # defineInterface()
│   │   └── interface.vue     # Vue component
│   └── hook/
│       └── index.ts          # Hook with validation
├── package.json              # Bundle configuration
└── tsconfig.json
```

## Key Implementation Details

### Interface Formatting
- Client-side formatting provides immediate user feedback
- Formats phone numbers as user types
- Supports multiple phone number formats
- Displays validation state in real-time

### Hook Validation
- Intercepts `items.create` and `items.update` events
- Validates phone number format before database save
- Throws error if phone number is invalid
- Identifies phone fields by interface type

## Important Rules

### Code Quality
- **NEVER** commit changes unless explicitly prompted
- Always test changes locally before any commits
- Use `pnpm build` after every change
- **ALWAYS remove debug console.log statements after user confirms changes work**

### Documentation & Research
- Always consult technical documentation when unsure
- Reference Directus extension documentation for hook patterns
- Check existing bundle extensions for implementation patterns

## Resources

- [Directus Extension Development Guide](https://docs.directus.io/extensions/)
- [Directus Hook Documentation](https://docs.directus.io/extensions/hooks/)
- [Directus Interface Documentation](https://docs.directus.io/extensions/interfaces/)

