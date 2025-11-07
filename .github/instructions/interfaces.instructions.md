---
applyTo: "extensions/email-interface/**,extensions/address-completion-interface/**"
---

# Interface Extensions - Copilot Instructions

## Interface Extension Pattern

Interface extensions provide custom Vue.js components for Directus field input. They handle display, formatting, and client-side validation only.

**Important**: Interface validation cannot be enforced server-side. API calls and database operations bypass interface validation. For server-side validation, use a Hook or Bundle extension.

## Key Characteristics

- Built with Vue.js + `defineInterface()`
- Client-side formatting and validation only
- Customizable through field options in Directus
- Cannot modify data before database save
- Exported from `src/index.ts`

## Development Structure

```
interface-extension/
├── src/
│   ├── index.ts              # defineInterface() export
│   ├── interface.vue         # Vue component
│   └── utils/                # Helpers if needed
├── package.json
├── tsconfig.json
└── README.md
```

## defineInterface() Pattern

```typescript
// src/index.ts
import { defineInterface } from '@directus/extensions-sdk';
import InterfaceComponent from './interface.vue';

export default defineInterface({
  id: 'custom-interface-id',
  name: 'Custom Interface',
  description: 'Description of what this interface does',
  icon: 'bookmark',
  component: InterfaceComponent,
  types: ['string', 'text'],  // Field types this works with
  options: [
    // Define customizable options for users
    {
      field: 'optionName',
      name: 'Option Label',
      type: 'string',
      meta: {
        interface: 'input',
        width: 'full'
      }
    }
  ]
});
```

## Vue Component Pattern

```vue
<template>
  <div class="custom-interface">
    <!-- Your input/display component -->
    <input
      :value="value"
      @input="$emit('input', $event.target.value)"
      placeholder="Enter value..."
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  props: {
    value: {
      type: [String, Number],
      default: null
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  emits: ['input']
});
</script>

<style scoped>
.custom-interface {
  /* Styling */
}
</style>
```

## Building Interface Extensions

```bash
cd extensions/interface-name
pnpm build
```

## Available Options in Props

Interfaces receive access to:
- `value` - Current field value
- `disabled` - Whether field is disabled
- `field` - Field configuration metadata
- `collection` - Collection name
- Any custom options defined in `defineInterface()` options array

## Testing
- Add the interface to a field in Directus
- Test creating and editing records
- Verify formatting works as expected
- Check browser console for errors

## Common Patterns

### Email Interface
- Input with email validation UI
- Visual feedback for valid/invalid format
- Optional masking or formatting

### Address Completion Interface
- Integration with external API (Smarty)
- Autocomplete address suggestions
- Address validation and parsing

## Limitations
- Cannot run server-side validation
- Cannot modify data before save
- Cannot access backend APIs directly (use fields/relations for data)
- Validation rules in metadata are UI-only, not enforced

## For Server-Side Validation
If you need to enforce validation on the server, create a **Hook extension** or use a **Bundle extension** to combine interface + hook.
