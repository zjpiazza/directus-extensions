import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
	generateWorkflowLinkId,
	addWorkflow,
	removeWorkflow,
	reorderWorkflows,
	getPhaseTitle
} from '../workflowOperations';
import type { Phase } from '../phaseManagement';

describe('workflowOperations', () => {
	describe('generateWorkflowLinkId', () => {
		beforeEach(() => {
			vi.useFakeTimers();
		});

		afterEach(() => {
			vi.useRealTimers();
		});

		it('generates ID with wl- prefix', () => {
			const id = generateWorkflowLinkId();
			expect(id).toMatch(/^wl-/);
		});

		it('includes timestamp in ID', () => {
			const now = 1234567890000;
			vi.setSystemTime(new Date(now));

			const id = generateWorkflowLinkId();
			expect(id).toContain(String(now));
		});

		it('generates unique IDs', () => {
			const id1 = generateWorkflowLinkId();
			const id2 = generateWorkflowLinkId();

			expect(id1).not.toBe(id2);
		});
	});

	describe('addWorkflow', () => {
		const mockPhases: Phase[] = [
			{
				id: 'request_service',
				title: 'Request Service',
				color: '#D1E7DD',
				workflows: []
			},
			{
				id: 'evaluate_service',
				title: 'Evaluate Service',
				color: '#FFF3CD',
				workflows: [
					{ id: 'wl-1', order: 0, title: 'Existing Workflow', workflowId: 'w1' }
				]
			}
		];

		it('adds workflow to phase', () => {
			const result = addWorkflow(mockPhases, 'request_service', 'w2', 'New Workflow');

			expect(result).not.toBeNull();
			expect(result?.[0]?.workflows).toHaveLength(1);
			expect(result?.[0]?.workflows[0]?.title).toBe('New Workflow');
		});

		it('sets correct order for new workflow', () => {
			const result = addWorkflow(mockPhases, 'evaluate_service', 'w2', 'Second Workflow');

			expect(result?.[1]?.workflows).toHaveLength(2);
			expect(result?.[1]?.workflows[1]?.order).toBe(1);
		});

		it('generates unique ID for workflow', () => {
			const result = addWorkflow(mockPhases, 'request_service', 'w2', 'New Workflow');

			expect(result?.[0]?.workflows[0]?.id).toMatch(/^wl-/);
		});

		it('returns null for non-existent phase', () => {
			const result = addWorkflow(mockPhases, 'non_existent', 'w2', 'New Workflow');

			expect(result).toBeNull();
		});

		it('does not mutate original phases array', () => {
			const original = [...mockPhases];
			addWorkflow(mockPhases, 'request_service', 'w2', 'New Workflow');

			expect(mockPhases).toEqual(original);
		});
	});

	describe('removeWorkflow', () => {
		const mockPhases: Phase[] = [
			{
				id: 'request_service',
				title: 'Request Service',
				color: '#D1E7DD',
				workflows: [
					{ id: 'wl-1', order: 0, title: 'Workflow 1', workflowId: 'w1' },
					{ id: 'wl-2', order: 1, title: 'Workflow 2', workflowId: 'w2' },
					{ id: 'wl-3', order: 2, title: 'Workflow 3', workflowId: 'w3' }
				]
			}
		];

		it('removes workflow from phase', () => {
			const result = removeWorkflow(mockPhases, 'request_service', 'wl-2');

			expect(result?.[0]?.workflows).toHaveLength(2);
			expect(result?.[0]?.workflows.find(w => w.id === 'wl-2')).toBeUndefined();
		});

		it('reorders remaining workflows', () => {
			const result = removeWorkflow(mockPhases, 'request_service', 'wl-1');

			expect(result?.[0]?.workflows[0]?.order).toBe(0);
			expect(result?.[0]?.workflows[1]?.order).toBe(1);
		});

		it('returns null for non-existent phase', () => {
			const result = removeWorkflow(mockPhases, 'non_existent', 'wl-1');

			expect(result).toBeNull();
		});

		it('returns null for non-existent workflow', () => {
			const result = removeWorkflow(mockPhases, 'request_service', 'wl-999');

			expect(result).toBeNull();
		});

		it('does not mutate original phases array', () => {
			const original = [...mockPhases];
			removeWorkflow(mockPhases, 'request_service', 'wl-1');

			expect(mockPhases).toEqual(original);
		});
	});

	describe('reorderWorkflows', () => {
		const mockPhases: Phase[] = [
			{
				id: 'request_service',
				title: 'Request Service',
				color: '#D1E7DD',
				workflows: [
					{ id: 'wl-1', order: 5, title: 'Workflow 1', workflowId: 'w1' },
					{ id: 'wl-2', order: 10, title: 'Workflow 2', workflowId: 'w2' },
					{ id: 'wl-3', order: 15, title: 'Workflow 3', workflowId: 'w3' }
				]
			}
		];

		it('reorders workflows sequentially', () => {
			const result = reorderWorkflows(mockPhases, 'request_service');

			expect(result?.[0]?.workflows[0]?.order).toBe(0);
			expect(result?.[0]?.workflows[1]?.order).toBe(1);
			expect(result?.[0]?.workflows[2]?.order).toBe(2);
		});

		it('returns null for non-existent phase', () => {
			const result = reorderWorkflows(mockPhases, 'non_existent');

			expect(result).toBeNull();
		});

		it('does not mutate original phases array', () => {
			const original = [...mockPhases];
			reorderWorkflows(mockPhases, 'request_service');

			expect(mockPhases).toEqual(original);
		});

		it('handles empty workflows array', () => {
			const emptyPhases: Phase[] = [
				{
					id: 'request_service',
					title: 'Request Service',
					color: '#D1E7DD',
					workflows: []
				}
			];

			const result = reorderWorkflows(emptyPhases, 'request_service');

			expect(result?.[0]?.workflows).toEqual([]);
		});
	});

	describe('getPhaseTitle', () => {
		const mockPhases: Phase[] = [
			{
				id: 'request_service',
				title: 'Request Service',
				color: '#D1E7DD',
				workflows: []
			},
			{
				id: 'evaluate_service',
				title: 'Evaluate Service',
				color: '#FFF3CD',
				workflows: []
			}
		];

		it('returns phase title for valid phase ID', () => {
			const title = getPhaseTitle(mockPhases, 'request_service');

			expect(title).toBe('Request Service');
		});

		it('returns Unknown Phase for non-existent phase', () => {
			const title = getPhaseTitle(mockPhases, 'non_existent');

			expect(title).toBe('Unknown Phase');
		});

		it('returns Unknown Phase for null phase ID', () => {
			const title = getPhaseTitle(mockPhases, null);

			expect(title).toBe('Unknown Phase');
		});
	});
});
