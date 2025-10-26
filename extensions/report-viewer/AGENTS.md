# AGENTS.md - Report Viewer Module Extension

## Quick Reference

**Type**: Module extension
**Purpose**: Report viewing interface for displaying generated reports
**Technology**: Vue.js

**For user-facing documentation, see**: [README.md](README.md)

## Development Guidelines

### Code Changes
- Always test changes locally before committing
- Use `pnpm build` after every change
- Remove debug console.log statements after confirming changes work
- Keep only essential logging (errors, critical state changes)

### Testing
- Test report loading and rendering
- Test data filtering and sorting
- Test export functionality
- Test with various report types and data sizes
- Run unit tests with `pnpm test`

### File Structure
```
report-viewer/
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

### Report Rendering
- Loads report definitions from Directus
- Renders report data in appropriate format
- Supports various data types and layouts
- Handles large datasets efficiently

### User Interactions
- Provides filtering and sorting controls
- Supports data export to multiple formats
- Handles pagination for large reports
- Maintains view state during navigation

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
- **ALWAYS remove debug console.log statements after user confirms changes work**

### Documentation & Research
- Always consult technical documentation when unsure
- Reference Directus extension documentation for module patterns
- Check existing module extensions for implementation patterns

## Resources

- [Directus Extension Development Guide](https://docs.directus.io/extensions/)
- [Directus Module Documentation](https://docs.directus.io/extensions/modules/)

