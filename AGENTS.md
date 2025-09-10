# AGENTS.md

## Project Overview
The current repository contains multiple Directus extensions using the "editor" extension type. This extension type is added into a forked version of the Directus codebase. The editor extension type overrides the default Vue component when editing an item within a collection.

## Extensions

### process-map-editor
- **Type**: Editor extension for singleton collections
- **Technology**: Vue Flow for rendering
- **Purpose**: [Add brief description of what this does]

### workflows-editor
- **Type**: Editor extension for standard collections
- **Technology**: Vue Flow for rendering
- **Purpose**: [Add brief description of what this does]

## Development Environment

### Prerequisites
- Docker and Docker Compose
- pnpm package manager
- Node.js (specify version if relevant)

### Setup
1. Ensure Docker Compose environment is running: `docker compose up -d`
2. Credentials can be found in the docker-compose file
3. Extensions auto-reload after building

## Development Workflow

### Making Changes
1. Make your changes to the extension code
2. Run `pnpm build` to build the extension
3. Changes should be automatically picked up
4. Check browser console for any unusual behavior

### File Structure
├── process-map-editor/

│   ├── src/

│   ├── package.json

│   └── ...

├── workflows-editor/

│   ├── src/

│   ├── package.json

│   └── ...

└── docker-compose.yml

## Debugging & Troubleshooting

### Common Issues
- Always check browser console for errors
- Ensure Docker Compose is running before making changes
- Verify build completed successfully after `pnpm build`

### Debugging Steps
1. Check browser console for JavaScript errors
2. Verify Docker containers are healthy: `docker compose ps`
3. Check build output for compilation errors
4. Restart containers if needed: `docker compose restart`

## Important Rules

### Code Changes
- **NEVER** commit changes unless explicitly prompted
- Always test changes locally before any commits
- Use `pnpm build` after every change

### Documentation & Research
- Always consult technical documentation when unsure
- Use context7 or firecrawl for additional research
- Reference Vue Flow documentation for rendering issues

## Technical Details

### Key Technologies
- Directus (forked version)
- Vue.js
- Vue Flow
- Docker Compose
- pnpm

### Extension Architecture
- Extensions override default Vue components
- Editor type extensions modify item editing interface
- Singleton vs standard collection handling differs between extensions

## Common Tasks
- Building extensions: `pnpm build`
- Starting environment: `docker compose up -d`
- Viewing logs: `docker compose logs -f`
- Stopping environment: `docker compose down`
