import { vi } from 'vitest'

// Mock Vue Flow core components and composables
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