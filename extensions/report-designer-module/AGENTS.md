# AGENTS.md - Report Designer Module Extension

## Quick Reference

**Type**: Module extension
**Purpose**: Report designer interface for creating and editing reports
**Technology**: Vue.js with report design tools

**For user-facing documentation, see**: [README.md](README.md)

## Development Guidelines

### Code Changes
- Always test changes locally before committing
- Use `pnpm build` after every change
- Remove debug console.log statements after confirming changes work
- Keep only essential logging (errors, critical state changes)

### Testing
- Test report creation and editing
- Test field selection and configuration
- Test report preview functionality
- Test data loading and persistence
- Run unit tests with `pnpm test`

### File Structure
```
report-designer-module/
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

### Report Design
- Provides interface for designing report templates
- Supports field selection from collections
- Allows configuration of report layout and formatting
- Generates report definitions for storage

### Data Management
- Loads report templates from Directus
- Persists report definitions to database
- Handles report versioning
- Maintains design state during editing

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

