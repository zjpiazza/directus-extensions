---
applyTo: "extensions/*module/**"
---

# Module Extensions - Copilot Instructions

## Module Extension Pattern

Module extensions provide custom full-page interfaces in Directus. They are rich Vue.js applications for specialized workflows like visualization, design, or reporting.

## Key Characteristics

- Full-page custom UI in Directus
- Access to Directus API and services
- Can use complex libraries (Vue Flow, reporting engines, etc.)
- Displayed as custom modules in Directus admin
- Exported from `src/index.ts`

## Development Structure

```
module-extension/
├── src/
│   ├── index.ts              # defineModule() export
│   ├── module.vue            # Main module component
│   ├── components/           # Reusable components
│   └── utils/                # Helper functions
├── package.json
├── tsconfig.json
├── vitest.config.ts          # For modules with tests
└── README.md
```

## defineModule() Pattern

```typescript
// src/index.ts
import { defineModule } from '@directus/extensions-sdk';
import ModuleComponent from './module.vue';

export default defineModule({
  id: 'custom-module-id',
  name: 'Custom Module',
  description: 'Description of module',
  icon: 'bookmark',
  component: ModuleComponent,
  routes: [
    {
      path: '',
      component: ModuleComponent
    }
  ]
});
```

## Vue Component Pattern

```vue
<template>
  <div class="module-container">
    <!-- Your full-page content -->
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useApi } from '@directus/extensions-sdk';

export default defineComponent({
  setup() {
    const api = useApi();
    
    return {
      api
    };
  }
});
</script>

<style scoped>
.module-container {
  padding: 20px;
  height: 100%;
  overflow: auto;
}
</style>
```

## Available Composables & Tools

```typescript
import {
  useApi,           // Directus API client
  useRouter,        // Vue Router for navigation
  useRoute,         // Current route info
  useCollection,    // Collection operations
  useItem,          // Item operations
  useSync           // Real-time sync
} from '@directus/extensions-sdk';
```

## Using Vue Flow (Process/Workflow Visualization)

Complex modules (process-map-module, workflow-module) use Vue Flow for node-based visualization:

```typescript
import { VueFlow } from '@vue-flow/core';
import { MiniMap, Controls, Background } from '@vue-flow/minimap';
import '@vue-flow/core/dist/style.css';

// Create nodes and edges for workflow/process visualization
const nodes = ref([
  { id: '1', label: 'Start', position: { x: 250, y: 5 } },
  { id: '2', label: 'Process', position: { x: 250, y: 100 } }
]);

const edges = ref([
  { id: 'e1-2', source: '1', target: '2' }
]);
```

## Building Module Extensions

```bash
cd extensions/module-name
pnpm build
```

## Testing

Some complex modules include tests with Vitest:

```bash
cd extensions/module-name
pnpm test              # Run tests
pnpm test:watch       # Watch mode
```

## CSS Guidelines for Modules

Modules often need custom styling:

```vue
<style scoped>
/* Use scoped styles to avoid conflicts */
.my-module {
  /* Custom styling */
}

/* Can reference Directus variables */
:root {
  /* Common Directus CSS variables */
}
</style>
```

## Directus API Integration

```typescript
const api = useApi();

// Get items
const items = await api.get('/items/collection-name');

// Create item
const newItem = await api.post('/items/collection-name', {
  field: 'value'
});

// Update item
const updated = await api.patch('/items/collection-name/id', {
  field: 'new-value'
});

// Delete item
await api.delete('/items/collection-name/id');
```

## Vue Styleguidist for Documentation

Complex modules support Vue Styleguidist for isolated component development:

```bash
cd extensions/module-name
pnpm run styleguide       # Start dev server
pnpm run styleguide:build # Build static site
```

Document components with JSDoc comments:

```vue
/**
 * MyComponent - Does something specific
 *
 * Main component for handling workflows
 *
 * @component
 * @example
 * <MyComponent title="My Title" :items="items" />
 */
```

## Common Patterns

### Process Map Module
- Node-based visualization of processes
- Vue Flow for rendering
- Drag-and-drop node creation
- Save/load process definitions

### Report Viewer
- Display formatted reports
- Read-only visualization
- Integration with report data API

### Report Designer
- Design custom reports
- Drag-and-drop report builder
- Preview and save reports

### Workflow Module
- Workflow visualization and editing
- Execution state tracking
- Integration with backend workflows

## Performance Considerations

- Lazy-load heavy libraries
- Paginate large datasets
- Use virtual scrolling for long lists
- Optimize Vue Flow node counts for large workflows
- Debounce API calls

## Testing & Validation
- Test module loads in Directus
- Verify API calls work
- Check performance with large datasets
- Test error handling
