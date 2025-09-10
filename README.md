# Directus Extensions Monorepo

This is a pnpm monorepo containing shared Vue Flow components and Directus editor extensions.

## Structure

```
directus-extensions/
├── packages/
│   └── vue-flow-shared/          # Shared Vue Flow components and composables
│       ├── src/
│       │   ├── components/       # Reusable Vue Flow node components
│       │   │   ├── PhaseNode.vue
│       │   │   ├── DecisionNode.vue
│       │   │   ├── TerminalNode.vue
│       │   │   ├── ProcessNode.vue
│       │   │   └── OffPageNode.vue
│       │   └── composables/      # Shared composables for Vue Flow logic
│       │       ├── usePrograms.ts
│       │       ├── useSaveLoad.ts
│       │       └── useFlowHandlers.ts
│       └── package.json
├── extensions/
│   ├── process-map-editor/       # Process mapping editor extension
│   └── workflows-editor/         # Workflows editor extension
├── pnpm-workspace.yaml
└── package.json
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

### Develop with watch mode
```bash
pnpm dev
```

## Shared Components

The `@directus-extensions/vue-flow-shared` package provides:

- **PhaseNode**: Node for representing process phases
- **DecisionNode**: Diamond-shaped decision node with multiple connection points
- **TerminalNode**: Start/end terminal nodes
- **ProcessNode**: Standard process step nodes  
- **OffPageNode**: Off-page connector nodes

## Usage in Extensions

Both editor extensions now import shared components:

```typescript
import { 
  PhaseNode, 
  DecisionNode, 
  TerminalNode, 
  ProcessNode, 
  OffPageNode 
} from '@directus-extensions/vue-flow-shared';
```

This ensures consistency across extensions and reduces code duplication.
Monorepo containing various extensions
