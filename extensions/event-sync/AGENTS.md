# AGENTS.md - Event Sync Hook Extension

## Quick Reference

**Type**: Hook extension
**Purpose**: Event synchronization across Directus
**Technology**: Node.js hook

**For user-facing documentation, see**: [README.md](README.md)

## Development Guidelines

### Code Changes
- Always test changes locally before committing
- Use `pnpm build` after every change
- Remove debug console.log statements after confirming changes work
- Keep only essential logging (errors, critical state changes)

### Testing
- Test event triggering and synchronization
- Verify events are properly routed
- Test with various collection types
- Monitor API logs for event processing
- Run tests with `pnpm test`

### File Structure
```
event-sync/
├── src/
│   └── index.ts              # Hook implementation
├── package.json
└── tsconfig.json
```

## Key Implementation Details

### Hook Events
- Intercepts Directus lifecycle events
- Filters events based on configuration
- Routes events to appropriate handlers
- Maintains event synchronization state

### Event Handling
- Processes events asynchronously
- Handles errors gracefully
- Logs important events for debugging
- Maintains data consistency

## Important Rules

### Code Quality
- **NEVER** commit changes unless explicitly prompted
- Always test changes locally before any commits
- Use `pnpm build` after every change
- **ALWAYS remove debug console.log statements after user confirms changes work**

### Documentation & Research
- Always consult technical documentation when unsure
- Reference Directus hook documentation for event patterns
- Check existing hook extensions for implementation patterns

## Resources

- [Directus Extension Development Guide](https://docs.directus.io/extensions/)
- [Directus Hook Documentation](https://docs.directus.io/extensions/hooks/)

