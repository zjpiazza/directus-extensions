import type { Node, Edge, Connection } from '@vue-flow/core';
import { debugLog } from '../utils/debugHelpers';

export function useNodeUtilities() {
	/**
	 * Get icon for a node type
	 */
	const getNodeIcon = (type: string): string => {
		const iconMap: Record<string, string> = {
			start: 'play_arrow',
			end: 'stop',
			process: 'task',
			decision: 'help',
			page: 'pentagon',
			terminal: 'terminal'
		};
		return iconMap[type] || 'circle';
	};

	/**
	 * Format node type for display
	 */
	const formatNodeType = (type: string): string => {
		const typeMap: Record<string, string> = {
			start: 'Start Node',
			end: 'End Node', 
			process: 'Process Node',
			decision: 'Decision Node',
			page: 'Page Node',
			terminal: 'Terminal Node'
		};
		return typeMap[type] || type.charAt(0).toUpperCase() + type.slice(1);
	};

	/**
	 * Validate a connection between nodes
	 */
	const validateConnection = (connection: Connection, existingEdges: Edge[]): boolean => {
		// Check if connection has required properties
		if (!connection.source || !connection.target) {
		debugLog('❌ Invalid connection: missing source or target', JSON.stringify({ 
			source: connection.source, 
			target: connection.target 
		}));
			return false;
		}

		// Prevent self-connections
		if (connection.source === connection.target) {
			debugLog('❌ Prevented self-connection', '');
			return false;
		}

		// Check if edge already exists
		const existingEdge = existingEdges.find(edge =>
			edge.source === connection.source &&
			edge.target === connection.target &&
			edge.sourceHandle === connection.sourceHandle &&
			edge.targetHandle === connection.targetHandle
		);

		if (existingEdge) {
			debugLog('❌ Edge already exists, skipping duplicate', '');
			return false;
		}

		return true;
	};

	/**
	 * Create a new edge from a connection
	 */
	const createEdgeFromConnection = (connection: Connection, defaultEdgeType: string = 'bezier'): Edge => {
		return {
			id: `edge-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
			source: connection.source!,
			target: connection.target!,
			sourceHandle: connection.sourceHandle,
			targetHandle: connection.targetHandle,
			type: defaultEdgeType,
			animated: true,
			style: { strokeWidth: 2 },
			markerEnd: { type: 'arrowclosed' as any },
			data: { label: '' },
		};
	};

	/**
	 * Handle opening a collection in a new tab
	 */
	const handleOpenCollection = (collectionName: string) => {
		if (!collectionName) return;
		debugLog('open-collection requested', collectionName);
		// Construct the URL for creating a new entry in the collection
		const collectionUrl = `/admin/content/${collectionName}/+`;
		// Open in a new window/tab
		window.open(collectionUrl, '_blank');
	};

	/**
	 * Create a new node from drag and drop data
	 */
	const createNodeFromDrop = (
		nodeType: any,
		position: { x: number; y: number },
		currentPageId: string,
		defaultNodeSize: string = 'medium'
	): Node => {
		return {
			id: `${nodeType.type}-${Date.now()}`,
			type: nodeType.type,
			position,
			data: {
				label: nodeType.label,
				name: nodeType.label,
				description: '',
				nodeSize: defaultNodeSize,
				pageId: currentPageId,
				...(nodeType.subtype && { subtype: nodeType.subtype }),
				...(nodeType.subtype === 'form' && { targetCollection: '' }),
				...(nodeType.type === 'process' && { openCollection: handleOpenCollection }),
				...(nodeType.type === 'page' && { 
					targetPageId: null,
					nodeCount: 0,
					color: '#3b82f6'
				}),
			},
		};
	};

	/**
	 * Get default edge type from model value or item
	 */
	const getDefaultEdgeType = (modelValue: any, item: any): string => {
		return modelValue?.defaultEdgeType || item?.defaultEdgeType || 'bezier';
	};

	/**
	 * Get default node size from model value or item
	 */
	const getDefaultNodeSize = (modelValue: any, item: any): string => {
		return modelValue?.defaultNodeSize || item?.defaultNodeSize || 'medium';
	};

	return {
		getNodeIcon,
		formatNodeType,
		validateConnection,
		createEdgeFromConnection,
		handleOpenCollection,
		createNodeFromDrop,
		getDefaultEdgeType,
		getDefaultNodeSize,
	};
}