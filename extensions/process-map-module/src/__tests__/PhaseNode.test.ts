import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import PhaseNode from '../components/PhaseNode.vue'

describe('PhaseNode', () => {
  let wrapper: any

  const defaultProps = {
    id: 'test-node-1',
    data: {
      label: 'Test Phase\nNode',
      phase: 'test'
    },
    position: { x: 100, y: 100 }
  }

  beforeEach(() => {
    wrapper = mount(PhaseNode, {
      props: defaultProps,
      global: {
        stubs: {
          Handle: true // Stub Vue Flow Handle component
        }
      }
    })
  })

  it('renders the component', () => {
    expect(wrapper.exists()).toBe(true)
  })

  it('displays the correct label', () => {
    expect(wrapper.text()).toContain('Test Phase')
    expect(wrapper.text()).toContain('Node')
  })

  it('applies the correct CSS classes', () => {
    expect(wrapper.classes()).toContain('phase-node')
  })

  it('handles prop changes', async () => {
    await wrapper.setProps({
      data: {
        label: 'Updated Phase\nLabel',
        phase: 'updated'
      }
    })

    expect(wrapper.text()).toContain('Updated Phase')
    expect(wrapper.text()).toContain('Label')
  })
})