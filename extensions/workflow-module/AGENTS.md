# AGENTS.md - Workflow Module Extension

## Quick Reference

**Type**: Module extension
**Purpose**: Workflow visualization and editing
**Technology**: Vue Flow for rendering

**For user-facing documentation, see**: [README.md](README.md)

## Development Guidelines

### Code Changes
- Always test changes locally before committing
- Use `pnpm build` after every change
- Remove debug console.log statements after confirming changes work
- Keep only essential logging (errors, critical state changes)

### Testing
- Test workflow rendering with various data
- Test node and edge creation/deletion
- Test data persistence and loading
- Test UI responsiveness and interactions
- Run unit tests with `pnpm test`

### File Structure
```
workflow-module/
├── src/
│   ├── index.ts              # Module definition
│   ├── module.vue            # Main module component
│   ├── components/           # Reusable components
│   ├── composables/          # Composition functions
│   ├── flow-nodes/           # Custom node types
│   └── utils/                # Utility functions
├── package.json
└── tsconfig.json
```

## Key Implementation Details

### Vue Flow Integration
- Uses Vue Flow for node-based visualization
- Supports custom node types (Start, Process, Decision, End, etc.)
- Handles edge connections and routing
- Manages zoom and pan interactions

### Data Management
- Loads workflow data from Directus
- Persists changes back to database
- Handles concurrent updates
- Maintains data consistency

### Navigation
- Clicking workflows in NavigationSidebar loads workflow data into canvas
- Does NOT navigate to /admin/content/{collection}/{id}
- Workflow name renders as plain text in view mode
- Workflow name renders as editable input in edit mode

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

