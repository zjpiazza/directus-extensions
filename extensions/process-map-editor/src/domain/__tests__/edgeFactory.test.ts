import { describe, it, expect } from 'vitest';
import { createDefaultEdges } from '../utils/edgeFactory';

describe('edgeFactory', () => {
	describe('createDefaultEdges', () => {
		it('creates 6 default edges', () => {
			const edges = createDefaultEdges();
			expect(edges).toHaveLength(6);
		});

		it('creates edges with unique IDs', () => {
			const edges = createDefaultEdges();
			const ids = edges.map(e => e.id);
			const uniqueIds = new Set(ids);

			expect(uniqueIds.size).toBe(6);
		});

		it('creates edges with step type', () => {
			const edges = createDefaultEdges();

			edges.forEach(edge => {
				expect(edge.type).toBe('step');
			});
		});

		it('creates edges with arrow markers', () => {
			const edges = createDefaultEdges();

			edges.forEach(edge => {
				expect(edge.markerEnd).toBe('arrowclosed');
			});
		});

		it('creates edge from request to evaluate', () => {
			const edges = createDefaultEdges();
			const edge = edges.find(e => e.id === 'e1');

			expect(edge?.source).toBe('request-node');
			expect(edge?.target).toBe('evaluate-node');
			expect(edge?.sourceHandle).toBe('right');
			expect(edge?.targetHandle).toBe('left');
		});

		it('creates edge from evaluate to provide', () => {
			const edges = createDefaultEdges();
			const edge = edges.find(e => e.id === 'e2');

			expect(edge?.source).toBe('evaluate-node');
			expect(edge?.target).toBe('provide-node');
		});

		it('creates edge from provide to reevaluate', () => {
			const edges = createDefaultEdges();
			const edge = edges.find(e => e.id === 'e3');

			expect(edge?.source).toBe('provide-node');
			expect(edge?.target).toBe('reevaluate-node');
		});

		it('creates edge from reevaluate to decision', () => {
			const edges = createDefaultEdges();
			const edge = edges.find(e => e.id === 'e4');

			expect(edge?.source).toBe('reevaluate-node');
			expect(edge?.target).toBe('decision-node');
			expect(edge?.sourceHandle).toBe('bottom');
			expect(edge?.targetHandle).toBe('right');
		});

		it('creates No edge from decision to end', () => {
			const edges = createDefaultEdges();
			const edge = edges.find(e => e.id === 'e5');

			expect(edge?.source).toBe('decision-node');
			expect(edge?.target).toBe('end-node');
			expect(edge?.label).toBe('No');
		});

		it('creates Yes edge from decision to provide', () => {
			const edges = createDefaultEdges();
			const edge = edges.find(e => e.id === 'e6');

			expect(edge?.source).toBe('decision-node');
			expect(edge?.target).toBe('provide-node');
			expect(edge?.label).toBe('Yes');
		});

		it('all edges have source and target handles', () => {
			const edges = createDefaultEdges();

			edges.forEach(edge => {
				expect(edge.sourceHandle).toBeTruthy();
				expect(edge.targetHandle).toBeTruthy();
			});
		});
	});
});
