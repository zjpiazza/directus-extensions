# AGENTS.md - SSN Bundle Extension

## Quick Reference

**Type**: Bundle extension (interface + hook)
**Purpose**: SSN input field with formatting, masking, and server-side validation
**Technology**: Vue.js interface with Node.js hook

**For user-facing documentation, see**: [README.md](README.md)

## Development Guidelines

### Code Changes
- Always test changes locally before committing
- Use `pnpm build` after every change
- Remove debug console.log statements after confirming changes work
- Keep only essential logging (errors, critical state changes)

### Testing
- Test SSN formatting with various inputs
- Test masking functionality
- Test both valid and invalid SSNs
- Verify server-side validation prevents invalid data
- Test integration with Directus collections
- Test edge cases (partial input, special characters, etc.)
- Run tests with `pnpm test`

### File Structure
```
ssn-bundle/
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
- Formats input as XXX-XX-XXXX format
- Optional masking hides digits for privacy
- Displays validation state in real-time

### Hook Validation
- Intercepts `items.create` and `items.update` events
- Validates 9-digit SSN format before database save
- Throws error if SSN is invalid
- Identifies SSN fields by interface type
- Handles both formatted and unformatted input

## Security Considerations

### Data Protection
- SSN data is sensitive - handle with care
- Consider encryption at rest in database
- Implement proper access controls
- Audit access to SSN fields
- Follow compliance requirements (GDPR, CCPA, etc.)

## Important Rules

### Code Quality
- **NEVER** commit changes unless explicitly prompted
- Always test changes locally before any commits
- Use `pnpm build` after every change
- Use `pnpm add` or `pnpm remove` for dependency management (never edit package.json directly)
- **ALWAYS remove debug console.log statements after user confirms changes work**

### Documentation & Research
- Always consult technical documentation when unsure
- Reference Directus extension documentation for hook patterns
- Check existing bundle extensions for implementation patterns

## Resources

- [Directus Extension Development Guide](https://docs.directus.io/extensions/)
- [Directus Hook Documentation](https://docs.directus.io/extensions/hooks/)
- [Directus Interface Documentation](https://docs.directus.io/extensions/interfaces/)

