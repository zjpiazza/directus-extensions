# Directus Extensions Monorepo - Copilot Instructions

## Project Overview

This is a **monorepo containing 11 specialized Directus extensions** that extend Directus functionality with custom interfaces, hooks, and modules. Each extension is independently built and loaded.

### Extension Types

- **Bundle Extensions** (3): email-bundle, phone-bundle, ssn-bundle - combine interface (client-side) + hook (server-side)
- **Interface Extensions** (2): email-interface, address-completion-interface - custom Vue.js input UI components
- **Hook Extensions** (2): event-sync, tenant-hook - server-side lifecycle event interception
- **Module Extensions** (3): process-map-module, report-viewer, report-designer-module - custom UI modules with Vue Flow/Vue.js

## Development Environment Setup

### Prerequisites
- Docker and Docker Compose (environment running)
- pnpm package manager (not npm or yarn)
- Node.js

### Quick Start
```bash
docker compose up -d          # Start environment
pnpm install                  # Install dependencies
pnpm build                    # Build all extensions
```

## Key Technical Concepts

### Extension Architecture

1. **Interface Extensions** - Provide custom UI input components
   - Built with Vue.js + `defineInterface()`
   - Client-side validation only
   - Cannot enforce server-side validation alone

2. **Hook Extensions** - Run on API server
   - Intercept `items.create` and `items.update` events
   - Enable server-side validation
   - Use `FieldsService` to identify field types

3. **Bundle Extensions** - Combine interface + hook
   - Recommended pattern for interfaces with server-side validation
   - Separate `dist/app.js` (client) and `dist/api.js` (server) bundles
   - Define multiple entries in `package.json` under `directus:extension.entries`

### Server-Side Validation Pattern

Bundle extensions combine client-side UI (interface) with server-side validation (hook):

```typescript
// Interface: Client-side formatting/validation
// Hook: Server-side validation using FieldsService
```

This ensures consistency and security - interface validation can be bypassed via API, so hooks are required for enforcement.

## File Structure

```
extensions/
├── address-completion-interface/
├── email-bundle/
├── email-interface/
├── event-sync/
├── phone-bundle/
├── process-map-module/
├── report-designer-module/
├── report-viewer/
├── ssn-bundle/
├── tenant-hook/
└── workflow-module/
```

Each extension:
```
extension-name/
├── src/
│   ├── index.ts (or interface.ts, hook.ts)
│   └── [component files]
├── package.json
├── tsconfig.json
├── AGENTS.md
└── README.md
```

## Development Workflow

### Making Changes
1. Edit extension code in `extensions/extension-name/src/`
2. Run `pnpm build` from extension directory or monorepo root
3. Changes auto-reload in Directus (Docker running)
4. Check browser console for errors

### Build Commands
- Build single extension: `cd extensions/extension-name && pnpm build`
- Build all extensions: `pnpm build` (from monorepo root)
- Watch for changes: Most extensions support `pnpm dev`

### Testing & Validation
- Browser console: Check for JavaScript errors
- Docker status: `docker compose ps`
- Build errors: Check `pnpm build` output
- Container logs: `docker compose logs -f`

## Important Rules

### Code Changes
- **NEVER commit** unless explicitly asked
- Always test locally before commits
- Run `pnpm build` after every change
- Remove debug `console.log` statements when confirming changes work
- Keep only essential logging (errors, critical state changes)

### Code Conventions
- Follow existing code style in each extension
- Use TypeScript for all new code
- Prefer Vue 3 composition API for Vue components
- Respect existing library choices - check `package.json` before adding dependencies

### Security
- Never commit secrets, API keys, or credentials
- No sensitive data in console logs
- Validate all user input server-side (via hooks)

## Documentation & Resources

### Key Files
- Root `AGENTS.md` - Project-level guidance
- Extension `AGENTS.md` - Extension-specific patterns and guidelines
- Extension `README.md` - Implementation details
- Root `README.md` - Repository structure

### Getting Help
- Check extension-specific `AGENTS.md` for patterns
- Reference `QUICK_REFERENCE.md` in root for common tasks
- Use context7/firecrawl for external research
- Review existing extensions as examples

## Debugging

### Common Issues
- **Build fails**: Check Node version, run `pnpm install`
- **Extension not loading**: Verify Docker running, check browser console
- **Port conflicts**: `docker compose down` then restart
- **Type errors**: Run `pnpm typecheck` to validate

### Debugging Steps
1. Check browser console for JavaScript errors
2. Verify Docker containers: `docker compose ps`
3. Check build output for compilation errors
4. Review browser network tab for failed requests
5. Restart containers if needed: `docker compose restart`

## Technologies Used

- **Directus** (forked version)
- **Vue.js** (v3) - UI components
- **Vue Flow** - Process/workflow visualization
- **TypeScript** - Type safety
- **pnpm** - Monorepo package management
- **Docker Compose** - Development environment
- **Vitest** - Testing framework (in some extensions)
