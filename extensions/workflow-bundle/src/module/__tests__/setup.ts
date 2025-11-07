import { vi } from 'vitest'

// Mock Vue Flow core components and composables
vi.mock('@vue-flow/core', () => ({
  useNode: () => ({
    node: {
      dimensions: { width: 100, height: 100 },
      position: { x: 0, y: 0 }
    }
  }),
  useVueFlow: () => ({
    addNodes: vi.fn(),
    addEdges: vi.fn(),
    removeNodes: vi.fn(),
    removeEdges: vi.fn(),
    getNodes: vi.fn(() => []),
    getEdges: vi.fn(() => []),
    fitView: vi.fn()
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
  },
  ConnectionMode: {
    Strict: 'strict',
    Loose: 'loose'
  }
}))

// Mock Directus SDK
vi.mock('@directus/extensions-sdk', () => ({
  useApi: () => ({
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn()
  })
}))