import { describe, it, expect } from 'vitest'

// Example utility functions to test
export function generateId(): string {
  return 'node-' + Date.now() + '-' + Math.random().toString(36).substring(2, 11)
}

export function validateNodeData(data: any): boolean {
  return !!(data && typeof data.label === 'string' && data.label.length > 0)
}

export function formatNodeLabel(label: string): string {
  return label.trim().toUpperCase()
}

describe('Utility Functions', () => {
  describe('generateId', () => {
    it('generates a unique ID', () => {
      const id1 = generateId()
      const id2 = generateId()
      
      expect(id1).toMatch(/^node-\d+-[a-z0-9]+$/)
      expect(id2).toMatch(/^node-\d+-[a-z0-9]+$/)
      expect(id1).not.toBe(id2)
    })

    it('starts with "node-" prefix', () => {
      const id = generateId()
      expect(id).toMatch(/^node-/)
    })
  })

  describe('validateNodeData', () => {
    it('returns true for valid node data', () => {
      const validData = { label: 'Test Node' }
      expect(validateNodeData(validData)).toBe(true)
    })

    it('returns false for invalid node data', () => {
      expect(validateNodeData(null)).toBe(false)
      expect(validateNodeData({})).toBe(false)
      expect(validateNodeData({ label: '' })).toBe(false)
      expect(validateNodeData({ label: 123 })).toBe(false)
    })
  })

  describe('formatNodeLabel', () => {
    it('trims and converts to uppercase', () => {
      expect(formatNodeLabel('  test label  ')).toBe('TEST LABEL')
      expect(formatNodeLabel('lowercase')).toBe('LOWERCASE')
      expect(formatNodeLabel('MixedCase')).toBe('MIXEDCASE')
    })

    it('handles empty strings', () => {
      expect(formatNodeLabel('')).toBe('')
      expect(formatNodeLabel('   ')).toBe('')
    })
  })
})