import type { Edge } from '@vue-flow/core';

export function createDefaultEdges(): Edge[] {
	return [
		{ 
			id: 'e1', 
			source: 'request-node', 
			target: 'evaluate-node', 
			type: 'step', 
			sourceHandle: 'right', 
			targetHandle: 'left', 
			markerEnd: 'arrowclosed' 
		},
		{ 
			id: 'e2', 
			source: 'evaluate-node', 
			target: 'provide-node', 
			type: 'step', 
			sourceHandle: 'right', 
			targetHandle: 'left', 
			markerEnd: 'arrowclosed' 
		},
		{ 
			id: 'e3', 
			source: 'provide-node', 
			target: 'reevaluate-node', 
			type: 'step', 
			sourceHandle: 'right', 
			targetHandle: 'left', 
			markerEnd: 'arrowclosed' 
		},
		{ 
			id: 'e4', 
			source: 'reevaluate-node', 
			target: 'decision-node', 
			type: 'step', 
			sourceHandle: 'bottom', 
			targetHandle: 'right', 
			markerEnd: 'arrowclosed' 
		},
		{ 
			id: 'e5', 
			source: 'decision-node', 
			target: 'end-node', 
			type: 'step', 
			sourceHandle: 'bottom', 
			targetHandle: 'left', 
			label: 'No', 
			markerEnd: 'arrowclosed' 
		},
		{ 
			id: 'e6', 
			source: 'decision-node', 
			target: 'provide-node', 
			type: 'step', 
			sourceHandle: 'left', 
			targetHandle: 'bottom', 
			label: 'Yes', 
			markerEnd: 'arrowclosed' 
		}
	];
}
