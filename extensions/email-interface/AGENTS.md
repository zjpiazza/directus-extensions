# AGENTS.md - Email Interface Extension

## Quick Reference

**Type**: Interface extension
**Purpose**: Email input field interface for Directus
**Technology**: Vue.js interface

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
- Verify UI displays correctly in Directus
- Test integration with Directus collections
- Run tests with `pnpm test`

### File Structure
```
email-interface/
├── src/
│   ├── index.ts              # defineInterface()
│   └── interface.vue         # Vue component
├── package.json
└── tsconfig.json
```

## Key Implementation Details

### Interface Validation
- Client-side validation provides immediate user feedback
- Uses standard email regex pattern for validation
- Displays validation state in real-time
- **Note**: Client-side validation only - server-side validation requires a hook

## Important Notes

### Limitations
- **Client-side validation only** - interfaces cannot enforce server-side validation
- API calls and direct database operations bypass interface validation
- For server-side validation, use a hook extension or bundle extension

### For Server-Side Validation
- Consider using the email-bundle extension instead
- Or create a separate hook extension to validate email fields

## Important Rules

### Code Quality
- **NEVER** commit changes unless explicitly prompted
- Always test changes locally before any commits
- Use `pnpm build` after every change
- Use `pnpm add` or `pnpm remove` for dependency management (never edit package.json directly)
- **ALWAYS remove debug console.log statements after user confirms changes work**

### Documentation & Research
- Always consult technical documentation when unsure
- Reference Directus extension documentation for interface patterns
- Check existing interface extensions for implementation patterns

## Resources

- [Directus Extension Development Guide](https://docs.directus.io/extensions/)
- [Directus Interface Documentation](https://docs.directus.io/extensions/interfaces/)

