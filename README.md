# Directus Extensions Monorepo

This is a pnpm monorepo containing multiple Directus extensions including interfaces, hooks, modules, and bundles.

## Structure

```
directus-extensions/
├── extensions/
│   ├── address-completion-interface/    # Address completion interface
│   ├── email-bundle/                    # Email input with validation
│   ├── email-interface/                 # Email input interface
│   ├── event-sync/                      # Event synchronization hook
│   ├── phone-bundle/                    # Phone input with validation
│   ├── process-map-module/              # Process map visualization
│   ├── report-designer-module/          # Report designer interface
│   ├── report-viewer/                   # Report viewing interface
│   ├── ssn-bundle/                      # SSN input with validation
│   ├── tenant-hook/                     # Tenant management hook
│   └── workflow-module/                 # Workflow visualization
├── pnpm-workspace.yaml
├── package.json
├── AGENTS.md                            # Agent guidelines (see for extension-specific rules)
└── README.md                            # This file
```

## Development

### Install dependencies
```bash
pnpm install
```

### Build all packages
```bash
pnpm build
```

### Build a specific extension
```bash
cd extensions/extension-name
pnpm build
```

## Adding a New Extension

When adding a new extension to the repository:

1. **Create the extension directory** in `extensions/`
2. **Set up the extension structure** following the pattern of existing extensions
3. **Update AGENTS.md** (root) - Add the new extension to the Extensions list with type, technology, purpose, and reference to extension-specific AGENTS.md
4. **Create extension-specific AGENTS.md** - Create `extensions/new-extension/AGENTS.md` with guidelines specific to that extension
5. **Update README.md** (root) - Add the new extension to the Structure section
6. **Test the extension** - Ensure it builds and loads correctly in Directus
7. **Document the extension** - Create or update README.md in the extension directory

### Extension AGENTS.md Template

Each extension should have an AGENTS.md file with:
- Extension Overview (type, purpose, technology)
- Architecture (component breakdown)
- Development Guidelines (code changes, testing, file structure)
- Key Implementation Details
- CSS Guidelines (for module extensions)
- Common Tasks
- Important Rules
- Resources

See existing extensions for examples.

## Long-Term Task Management

When working across multiple sessions:

1. **Review progress tracking files at the start**
   - Check `progress.md` for current status
   - Check `tasks.json` for active tasks
   - Review git logs to understand recent changes

2. **Prepare for work**
   - Run fundamental integration tests before new features
   - Verify Docker Compose environment is running
   - Check for any uncommitted changes

3. **Track progress during work**
   - Update task tracking files as work progresses
   - Document decisions and blockers
   - Commit work frequently to preserve state

4. **Prepare for context refresh**
   - Update `progress.md` with current status
   - Update `tasks.json` with task states
   - Commit all changes before context ends
   - Document any blockers or next steps

### Progress Tracking Files

- **progress.md** - High-level status, current phase, blockers, decisions
- **tasks.json** - Structured task list with states and descriptions

These files should be updated regularly to enable resuming work in future sessions.