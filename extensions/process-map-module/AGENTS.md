# AGENTS.md - Process Map Module Extension

## Quick Reference

**Type**: Module extension
**Purpose**: Process map visualization and editing
**Technology**: Vue Flow for rendering

**For user-facing documentation, see**: [README.md](README.md)

## Development Guidelines

### Code Changes
- Always test changes locally before committing
- Use `pnpm build` after every change
- Remove debug console.log statements after confirming changes work
- Keep only essential logging (errors, critical state changes)

### Testing
- Test process map rendering with various data
- Test node and edge creation/deletion
- Test data persistence and loading
- Test UI responsiveness and interactions
- Run unit tests with `pnpm test`

### File Structure
```
process-map-module/
├── src/
│   ├── index.ts              # Module definition
│   ├── module.vue            # Main module component
│   ├── components/           # Reusable components
│   ├── composables/          # Composition functions
│   └── utils/                # Utility functions
├── package.json
└── tsconfig.json
```

## Key Implementation Details

### Vue Flow Integration
- Uses Vue Flow for node-based visualization
- Supports custom node types
- Handles edge connections and routing
- Manages zoom and pan interactions

### Data Management
- Loads process map data from Directus
- Persists changes back to database
- Handles concurrent updates
- Maintains data consistency

## CSS Guidelines

### Scoped Styles
- **ALWAYS use scoped styles** to avoid affecting other modules
- Use `<style scoped>` in Vue components
- Prefix custom CSS classes with extension name when needed
- Avoid global style modifications

## Important Rules

### Code Quality
- **NEVER** commit changes unless explicitly prompted
- Always test changes locally before any commits
- Use `pnpm build` after every change
- Use `pnpm add` or `pnpm remove` for dependency management (never edit package.json directly)
- **ALWAYS remove debug console.log statements after user confirms changes work**

### Vue Flow Usage
- Reference Vue Flow documentation for rendering issues
- Test with various node configurations
- Ensure proper event handling for user interactions

### Documentation & Research
- Always consult technical documentation when unsure
- Reference Vue Flow documentation for rendering issues
- Check existing module extensions for implementation patterns

## Resources

- [Directus Extension Development Guide](https://docs.directus.io/extensions/)
- [Directus Module Documentation](https://docs.directus.io/extensions/modules/)
- [Vue Flow Documentation](https://vueflow.dev/)

