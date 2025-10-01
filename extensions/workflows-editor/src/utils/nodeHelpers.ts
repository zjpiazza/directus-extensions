import type { Node } from '@vue-flow/core';

export type NodeType = 'start' | 'process' | 'decision' | 'end' | 'page';
export type ProcessSubtype = 'task' | 'form' | 'notification';

export interface NodeData {
  label?: string;
  type?: NodeType;
  subtype?: ProcessSubtype;
  description?: string;
  targetCollection?: string;
  targetCollections?: Array<{ collection: string; label?: string }>;
  targetWorkflowId?: string;
  targetPageId?: string;
  pageId?: string;
  [key: string]: any;
}

export function isStartNode(node: Node): boolean {
  return node.type === 'start';
}

export function isProcessNode(node: Node): boolean {
  return node.type === 'process';
}

export function isDecisionNode(node: Node): boolean {
  return node.type === 'decision';
}

export function isEndNode(node: Node): boolean {
  return node.type === 'end';
}

export function isPageNode(node: Node): boolean {
  return node.type === 'page';
}

export function isFormNode(node: Node): boolean {
  return node.type === 'process' && node.data?.subtype === 'form';
}

export function isTaskNode(node: Node): boolean {
  return node.type === 'process' && node.data?.subtype === 'task';
}

export function isNotificationNode(node: Node): boolean {
  return node.type === 'process' && node.data?.subtype === 'notification';
}

export function getNodeLabel(node: Node): string {
  return node.data?.label || node.id;
}

export function getNodeType(node: Node): NodeType | undefined {
  return node.type as NodeType;
}

export function getProcessSubtype(node: Node): ProcessSubtype | undefined {
  if (!isProcessNode(node)) return undefined;
  return node.data?.subtype as ProcessSubtype;
}

export function hasTargetCollection(node: Node): boolean {
  return Boolean(node.data?.targetCollection || node.data?.targetCollections?.length);
}

export function hasTargetWorkflow(node: Node): boolean {
  return Boolean(node.data?.targetWorkflowId);
}

export function hasTargetPage(node: Node): boolean {
  return Boolean(node.data?.targetPageId);
}

export function validateNodeData(node: Node): boolean {
  if (!node.type) return false;
  
  if (isFormNode(node)) {
    return hasTargetCollection(node);
  }
  
  if (isEndNode(node)) {
    return true;
  }
  
  if (isPageNode(node)) {
    return hasTargetPage(node);
  }
  
  return true;
}

export function formatNodeForDisplay(node: Node): string {
  const type = getNodeType(node);
  const label = getNodeLabel(node);
  const subtype = getProcessSubtype(node);
  
  if (subtype) {
    return `${type} (${subtype}): ${label}`;
  }
  
  return `${type}: ${label}`;
}

export function createDefaultNodeData(type: NodeType, subtype?: ProcessSubtype): NodeData {
  const data: NodeData = {
    type,
    label: '',
  };
  
  if (subtype) {
    data.subtype = subtype;
  }
  
  return data;
}
