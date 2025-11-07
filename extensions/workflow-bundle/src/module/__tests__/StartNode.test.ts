import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import StartNode from '../flow-nodes/StartNode.vue'

describe('StartNode', () => {
  let wrapper: any

  const defaultProps = {
    id: 'start-node-1',
    type: 'start',
    selected: false,
    connectable: true,
    dimensions: { width: 100, height: 50 },
    dragging: false,
    resizing: false,
    zIndex: 1,
    events: {},
    data: {
      label: 'Start Process'
    },
    position: { x: 0, y: 0 }
  }

  beforeEach(() => {
    wrapper = mount(StartNode, {
      props: defaultProps,
      global: {
        stubs: {
          Handle: true, // Stub Vue Flow Handle component
          'v-icon': true // Stub Directus v-icon component
        }
      }
    })
  })

  it('renders the component', () => {
    expect(wrapper.exists()).toBe(true)
  })

  it('displays the start label', () => {
    expect(wrapper.text()).toContain('Start Process')
  })

  it('applies start node styling', () => {
    expect(wrapper.classes()).toContain('start-node')
  })

  it('handles default label when none provided', async () => {
    await wrapper.setProps({
      data: {}
    })

    // Check if component handles missing label gracefully
    expect(wrapper.exists()).toBe(true)
  })

  it('updates when data changes', async () => {
    await wrapper.setProps({
      data: {
        label: 'Begin Workflow'
      }
    })

    expect(wrapper.text()).toContain('Begin Workflow')
  })
})