import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import DecisionNode from '../components/DecisionNode.vue'

describe('DecisionNode', () => {
  let wrapper: any

  const defaultProps = {
    id: 'decision-node-1',
    data: {
      label: 'Decision\nPoint',
      description: 'Choose path'
    },
    position: { x: 200, y: 200 }
  }

  beforeEach(() => {
    wrapper = mount(DecisionNode, {
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

  it('displays the decision label', () => {
    expect(wrapper.text()).toContain('Decision')
    expect(wrapper.text()).toContain('Point')
  })

  it('shows description when provided', () => {
    expect(wrapper.text()).toContain('Choose path')
  })

  it('applies diamond shape styling', () => {
    expect(wrapper.classes()).toContain('decision-node')
    expect(wrapper.find('.diamond-shape').exists()).toBe(true)
  })

  it('handles missing label gracefully', async () => {
    await wrapper.setProps({
      data: {
        description: 'Just description'
      }
    })

    expect(wrapper.text()).toContain('Decision') // Falls back to default
    expect(wrapper.text()).toContain('Just description')
  })
})