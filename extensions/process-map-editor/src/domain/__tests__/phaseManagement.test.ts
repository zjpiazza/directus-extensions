import { describe, it, expect } from 'vitest';
import { 
	createDefaultPhases, 
	convertPhasesToLinksMap, 
	createPhasesFromLinks,
	type Phase,
	type WorkflowItem
} from '../phaseManagement';

describe('phaseManagement', () => {
	describe('createDefaultPhases', () => {
		it('creates 4 default phases', () => {
			const phases = createDefaultPhases();
			expect(phases).toHaveLength(4);
		});

		it('creates phases with correct IDs', () => {
			const phases = createDefaultPhases();
			expect(phases.map(p => p.id)).toEqual([
				'request_service',
				'evaluate_service',
				'provide_services',
				'end_of_service'
			]);
		});

		it('creates phases with correct titles', () => {
			const phases = createDefaultPhases();
			expect(phases[0]?.title).toBe('REQUEST SERVICE/REPORT');
			expect(phases[1]?.title).toBe('EVALUATE SERVICE');
			expect(phases[2]?.title).toBe('PROVIDE SERVICES AND REEVALUATE SERVICES');
			expect(phases[3]?.title).toBe('END OF SERVICES');
		});

		it('creates phases with correct colors', () => {
			const phases = createDefaultPhases();
			const expectedColor = 'var(--theme--primary, #7c3aed)';
			expect(phases[0]?.color).toBe(expectedColor);
			expect(phases[1]?.color).toBe(expectedColor);
			expect(phases[2]?.color).toBe(expectedColor);
			expect(phases[3]?.color).toBe(expectedColor);
		});

		it('creates phases with empty workflow arrays', () => {
			const phases = createDefaultPhases();
			phases.forEach(phase => {
				expect(phase.workflows).toEqual([]);
			});
		});
	});

	describe('convertPhasesToLinksMap', () => {
		it('converts phases to links map', () => {
			const phases: Phase[] = [
				{
					id: 'request_service',
					title: 'Request Service',
					color: '#D1E7DD',
					workflows: [
						{ id: 'wl-1', order: 0, title: 'Workflow 1', workflowId: 'w1' }
					]
				},
				{
					id: 'evaluate_service',
					title: 'Evaluate Service',
					color: '#FFF3CD',
					workflows: []
				}
			];

			const map = convertPhasesToLinksMap(phases);

			expect(map.request_service).toHaveLength(1);
			expect(map.request_service?.[0]?.title).toBe('Workflow 1');
			expect(map.evaluate_service).toEqual([]);
		});

		it('ensures all required phase keys exist in map', () => {
			const phases: Phase[] = [];

			const map = convertPhasesToLinksMap(phases);

			expect(map).toHaveProperty('request_service');
			expect(map).toHaveProperty('evaluate_service');
			expect(map).toHaveProperty('provide_services');
			expect(map).toHaveProperty('end_of_service');
		});

		it('clones workflow items to prevent mutations', () => {
			const workflow: WorkflowItem = { id: 'wl-1', order: 0, title: 'Test', workflowId: 'w1' };
			const phases: Phase[] = [
				{
					id: 'request_service',
					title: 'Request Service',
					color: '#D1E7DD',
					workflows: [workflow]
				}
			];

			const map = convertPhasesToLinksMap(phases);
			const item = map.request_service?.[0];
			if (item) item.title = 'Modified';

			expect(workflow.title).toBe('Test');
		});

		it('handles phases with non-array workflows', () => {
			const phases: any = [
				{
					id: 'request_service',
					title: 'Request Service',
					color: '#D1E7DD',
					workflows: null
				}
			];

			const map = convertPhasesToLinksMap(phases);

			expect(map.request_service).toEqual([]);
		});
	});

	describe('createPhasesFromLinks', () => {
		it('creates phases from workflow links', () => {
			const workflowLinks: Record<string, WorkflowItem[]> = {
				request_service: [
					{ id: 'wl-1', order: 0, title: 'Workflow 1', workflowId: 'w1' }
				],
				evaluate_service: [],
				provide_services: [],
				end_of_service: []
			};

			const phases = createPhasesFromLinks(workflowLinks);

			expect(phases).toHaveLength(4);
			expect(phases[0]?.workflows).toHaveLength(1);
			expect(phases[0]?.workflows[0]?.title).toBe('Workflow 1');
		});

		it('uses default phase configuration', () => {
			const workflowLinks: Record<string, WorkflowItem[]> = {
				request_service: [],
				evaluate_service: [],
				provide_services: [],
				end_of_service: []
			};

			const phases = createPhasesFromLinks(workflowLinks);

			expect(phases[0]?.id).toBe('request_service');
			expect(phases[0]?.title).toBe('REQUEST SERVICE/REPORT');
			expect(phases[0]?.color).toBe('var(--theme--primary, #7c3aed)');
		});

		it('handles missing workflow links', () => {
			const workflowLinks: Record<string, WorkflowItem[]> = {};

			const phases = createPhasesFromLinks(workflowLinks);

			expect(phases).toHaveLength(4);
			phases.forEach(phase => {
				expect(phase.workflows).toEqual([]);
			});
		});

		it('clones workflow items to prevent mutations', () => {
			const workflow: WorkflowItem = { id: 'wl-1', order: 0, title: 'Test', workflowId: 'w1' };
			const workflowLinks: Record<string, WorkflowItem[]> = {
				request_service: [workflow],
				evaluate_service: [],
				provide_services: [],
				end_of_service: []
			};

			const phases = createPhasesFromLinks(workflowLinks);
			const item = phases[0]?.workflows[0];
			if (item) item.title = 'Modified';

			expect(workflow.title).toBe('Test');
		});
	});
});
