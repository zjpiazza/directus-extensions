# AGENTS.md - Email Bundle Extension

## Quick Reference

**Type**: Bundle extension (interface + hook)
**Purpose**: Email input field with client-side formatting and server-side validation
**Technology**: Vue.js interface with Node.js hook

**For user-facing documentation, see**: [README.md](README.md)

## Development Guidelines

### Code Changes
- Always test changes locally before committing
- Use `pnpm build` after every change
- Remove debug console.log statements after confirming changes work
- Keep only essential logging (errors, critical state changes)

### Testing
- Test email validation with various formats
- Test both valid and invalid email addresses
- Verify server-side validation prevents invalid data
- Test integration with Directus collections
- Run tests with `pnpm test`

### File Structure
```
email-bundle/
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

### Interface Validation
- Client-side validation provides immediate user feedback
- Uses standard email regex pattern for validation
- Displays validation state in real-time

### Hook Validation
- Intercepts `items.create` and `items.update` events
- Validates email format before database save
- Throws error if email is invalid
- Identifies email fields by interface type

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

