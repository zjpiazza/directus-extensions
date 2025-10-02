import { describe, it, expect } from 'vitest';
import { normalizeProgramKey } from '../utils/dataTransformers';

describe('dataTransformers', () => {
	describe('normalizeProgramKey', () => {
		it('converts number to string', () => {
			expect(normalizeProgramKey(123)).toBe('123');
		});

		it('keeps string as string', () => {
			expect(normalizeProgramKey('abc')).toBe('abc');
		});

		it('converts null to "default"', () => {
			expect(normalizeProgramKey(null)).toBe('default');
		});

		it('converts undefined to "default"', () => {
			expect(normalizeProgramKey(undefined)).toBe('default');
		});

		it('converts empty string to "default"', () => {
			expect(normalizeProgramKey('')).toBe('default');
		});

		it('handles zero correctly', () => {
			expect(normalizeProgramKey(0)).toBe('0');
		});

		it('handles negative numbers', () => {
			expect(normalizeProgramKey(-5)).toBe('-5');
		});

		it('handles floating point numbers', () => {
			expect(normalizeProgramKey(3.14)).toBe('3.14');
		});
	});
});
