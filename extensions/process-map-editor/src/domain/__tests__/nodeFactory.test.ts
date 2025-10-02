import { describe, it, expect } from 'vitest';
import { createDefaultNodes } from '../utils/nodeFactory';

describe('nodeFactory', () => {
	describe('createDefaultNodes', () => {
		it('creates 6 default nodes', () => {
			const nodes = createDefaultNodes();
			expect(nodes).toHaveLength(6);
		});

		it('creates nodes with unique IDs', () => {
			const nodes = createDefaultNodes();
			const ids = nodes.map(n => n.id);
			const uniqueIds = new Set(ids);

			expect(uniqueIds.size).toBe(6);
		});

		it('creates phase nodes with correct type', () => {
			const nodes = createDefaultNodes();
			const phaseNodes = nodes.filter(n => n.type === 'phase');

			expect(phaseNodes).toHaveLength(5);
		});

		it('creates decision node with correct type', () => {
			const nodes = createDefaultNodes();
			const decisionNode = nodes.find(n => n.id === 'decision-node');

			expect(decisionNode?.type).toBe('decision');
		});

		it('creates request node with correct data', () => {
			const nodes = createDefaultNodes();
			const requestNode = nodes.find(n => n.id === 'request-node');

			expect(requestNode?.data.label).toBe('Request\nService/Report');
			expect(requestNode?.data.phase).toBe('request');
		});

		it('creates evaluate node with correct data', () => {
			const nodes = createDefaultNodes();
			const evaluateNode = nodes.find(n => n.id === 'evaluate-node');

			expect(evaluateNode?.data.label).toBe('Evaluate Service');
			expect(evaluateNode?.data.phase).toBe('evaluate');
		});

		it('creates provide node with correct data', () => {
			const nodes = createDefaultNodes();
			const provideNode = nodes.find(n => n.id === 'provide-node');

			expect(provideNode?.data.label).toBe('Provide Services');
			expect(provideNode?.data.phase).toBe('provide');
		});

		it('creates reevaluate node with correct data', () => {
			const nodes = createDefaultNodes();
			const reevaluateNode = nodes.find(n => n.id === 'reevaluate-node');

			expect(reevaluateNode?.data.label).toBe('Reevaluate Services');
			expect(reevaluateNode?.data.phase).toBe('reevaluate');
		});

		it('creates end node with correct data', () => {
			const nodes = createDefaultNodes();
			const endNode = nodes.find(n => n.id === 'end-node');

			expect(endNode?.data.label).toBe('End Of Services');
			expect(endNode?.data.phase).toBe('end');
		});

		it('creates decision node with correct data', () => {
			const nodes = createDefaultNodes();
			const decisionNode = nodes.find(n => n.id === 'decision-node');

			expect(decisionNode?.data.label).toBe('Appropriate\nTo\nContinue?');
			expect(decisionNode?.data.yesLabel).toBe('Yes');
			expect(decisionNode?.data.noLabel).toBe('No');
		});

		it('positions nodes with x and y coordinates', () => {
			const nodes = createDefaultNodes();

			nodes.forEach(node => {
				expect(node.position).toHaveProperty('x');
				expect(node.position).toHaveProperty('y');
				expect(typeof node.position.x).toBe('number');
				expect(typeof node.position.y).toBe('number');
			});
		});
	});
});
