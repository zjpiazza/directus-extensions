# Testing Guide for Directus Extensions

This guide explains how to test your Directus extensions using **Vitest** and **Vue Test Utils**.

## Overview

This project uses:
- **Vitest** - A blazing fast unit testing framework for Vite projects
- **Vue Test Utils** - The official testing utility library for Vue.js components
- **Happy DOM** - A JavaScript implementation of the DOM and HTML for Node.js environments

## Setup

### Dependencies

The following testing dependencies are installed at the root level:
- `vitest` - Testing framework
- `@vue/test-utils` - Vue component testing utilities
- `@vitejs/plugin-vue` - Vue plugin for Vite
- `happy-dom` - DOM environment for tests

### Configuration

Each extension has its own `vitest.config.ts` file that:
- Sets up Vue plugin for processing `.vue` files
- Configures happy-dom as the test environment
- Sets up global test APIs (describe, it, expect, etc.)
- Defines test file patterns
- Includes setup files for mocking

## Running Tests

### All Extensions
```bash
# Run tests for all extensions
pnpm test

# Run tests once without watching
pnpm test:run

# Run tests with UI (if available)
pnpm test:ui
```

### Individual Extensions
```bash
# Process Map Editor
cd extensions/process-map-editor
pnpm test:run

# Workflows Editor  
cd extensions/workflows-editor
pnpm test:run
```

## Test Structure

### Example Test File

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import MyComponent from '../components/MyComponent.vue'

describe('MyComponent', () => {
  let wrapper: any

  const defaultProps = {
    id: 'test-id',
    data: { label: 'Test Label' }
  }

  beforeEach(() => {
    wrapper = mount(MyComponent, {
      props: defaultProps,
      global: {
        stubs: {
          Handle: true, // Stub Vue Flow components
          'v-icon': true // Stub Directus components
        }
      }
    })
  })

  it('renders the component', () => {
    expect(wrapper.exists()).toBe(true)
  })

  it('displays the correct content', () => {
    expect(wrapper.text()).toContain('Test Label')
  })
})
```

## Mocking Strategy

### Vue Flow Components

Vue Flow components are mocked in setup files to avoid complex dependencies:

```typescript
// src/__tests__/setup.ts
vi.mock('@vue-flow/core', () => ({
  useNode: () => ({
    node: {
      dimensions: { width: 100, height: 100 },
      position: { x: 0, y: 0 }
    }
  }),
  Handle: {
    name: 'Handle',
    props: ['id', 'type', 'position', 'style'],
    template: '<div class="mock-handle"></div>'
  },
  Position: {
    Top: 'top',
    Bottom: 'bottom',
    Left: 'left',
    Right: 'right'
  }
}))
```

### Directus SDK

Directus API calls are mocked to avoid external dependencies:

```typescript
vi.mock('@directus/extensions-sdk', () => ({
  useApi: () => ({
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn()
  })
}))
```

## Test Categories

### 1. Component Tests
Test Vue components in isolation:
- Rendering behavior
- Props handling
- User interactions
- State changes

### 2. Utility Function Tests
Test pure functions and helpers:
- Input/output validation
- Edge cases
- Error handling

### 3. Integration Tests
Test component interactions:
- Parent-child communication
- Event handling
- Data flow

## Best Practices

### 1. Test Structure
- Use descriptive test names
- Group related tests with `describe`
- Use `beforeEach` for common setup
- Keep tests focused and isolated

### 2. Component Testing
- Test the component interface, not implementation
- Mock external dependencies
- Test user interactions
- Verify rendered output

### 3. Assertions
- Be specific with assertions
- Test both positive and negative cases
- Verify error states
- Check edge cases

### 4. Mocking Guidelines
- Mock external APIs and services
- Stub child components when testing parents
- Use minimal mocks - only what's necessary
- Keep mocks simple and focused

## File Organization

```
extensions/
├── process-map-editor/
│   ├── src/
│   │   ├── __tests__/
│   │   │   ├── setup.ts          # Test setup and mocks
│   │   │   ├── PhaseNode.test.ts # Component tests
│   │   │   ├── DecisionNode.test.ts
│   │   │   └── utils.test.ts     # Utility function tests
│   │   └── components/
│   └── vitest.config.ts          # Vitest configuration
└── workflows-editor/
    ├── src/
    │   ├── __tests__/
    │   │   ├── setup.ts
    │   │   ├── StartNode.test.ts
    │   │   └── ProcessNode.test.ts
    │   └── flow-nodes/
    └── vitest.config.ts
```

## Debugging Tests

### 1. Verbose Output
```bash
pnpm test:run --reporter=verbose
```

### 2. Watch Mode
```bash
pnpm test
# Tests will re-run when files change
```

### 3. Debug Specific Tests
```bash
# Run only tests matching a pattern
pnpm test:run --grep="ProcessNode"
```

### 4. Console Output
Use `console.log` in tests for debugging:
```typescript
it('debugs component state', () => {
  console.log('Wrapper HTML:', wrapper.html())
  console.log('Component props:', wrapper.props())
  expect(wrapper.exists()).toBe(true)
})
```

## Common Issues

### 1. Vue Flow Mock Issues
If you see "Node not found" errors, ensure Vue Flow is properly mocked in setup files.

### 2. Missing Props
Vue Flow nodes require many props. Provide all required props in tests:
```typescript
const defaultProps = {
  id: 'node-1',
  type: 'process',
  selected: false,
  connectable: true,
  dimensions: { width: 100, height: 50 },
  dragging: false,
  resizing: false,
  zIndex: 1,
  events: {},
  data: { label: 'Test' },
  position: { x: 0, y: 0 }
}
```

### 3. Component Resolution Errors
Stub unknown components:
```typescript
global: {
  stubs: {
    'v-icon': true,
    'Handle': true,
    'unknown-component': true
  }
}
```

## Adding New Tests

1. Create test file: `ComponentName.test.ts`
2. Import testing utilities and component
3. Set up describe block with beforeEach
4. Write individual test cases
5. Mock external dependencies as needed
6. Run tests to verify they pass

## Continuous Integration

Tests should be run in CI/CD pipelines:
```yaml
# Example GitHub Actions step
- name: Run Tests
  run: pnpm test:run
```

This ensures code quality and prevents regressions.