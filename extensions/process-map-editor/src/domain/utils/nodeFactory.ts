import type { Node } from '@vue-flow/core';

export function createDefaultNodes(): Node[] {
	return [
		{
			id: 'request-node',
			type: 'phase',
			position: { x: 100, y: 80 },
			data: { label: 'Request\nService/Report', phase: 'request' }
		},
		{
			id: 'evaluate-node',
			type: 'phase',
			position: { x: 300, y: 80 },
			data: { label: 'Evaluate Service', phase: 'evaluate' }
		},
		{
			id: 'provide-node',
			type: 'phase',
			position: { x: 500, y: 80 },
			data: { label: 'Provide Services', phase: 'provide' }
		},
		{
			id: 'reevaluate-node',
			type: 'phase',
			position: { x: 900, y: 80 },
			data: { label: 'Reevaluate Services', phase: 'reevaluate' }
		},
		{
			id: 'end-node',
			type: 'phase',
			position: { x: 1100, y: 200 },
			data: { label: 'End Of Services', phase: 'end' }
		},
		{
			id: 'decision-node',
			type: 'decision',
			position: { x: 840, y: 200 },
			data: { label: 'Appropriate\nTo\nContinue?', yesLabel: 'Yes', noLabel: 'No' }
		}
	];
}
