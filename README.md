# Directus Extensions Monorepo

This is a pnpm monorepo containing shared Vue Flow components and Directus editor extensions.

## Structure

```
directus-extensions/
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