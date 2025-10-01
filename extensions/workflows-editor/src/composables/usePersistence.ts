import { ref, nextTick, type Ref } from 'vue';
import type { Node, Edge } from '@vue-flow/core';
import type { Page } from './useWorkflowData';
import type { PageViewport } from './usePageManagement';

export interface PersistenceOptions {
  collection: string;
  api: any;
  notifications?: {
    add: (payload: { title: string; text?: string; type?: string }) => void;
  };
  onSave?: (savedItem: any) => void;
  onLoad?: () => void;
  onError?: (error: any) => void;
}

export interface WorkflowPersistenceData {
  nodes: Node[];
  edges: Edge[];
  pages: Page[];
  currentPageId: string;
  pageViewports: Record<string, PageViewport>;
}

export function usePersistence(
  flowNodes: Ref<Node[]>,
  flowEdges: Ref<Edge[]>,
  pages: Ref<Page[]>,
  currentPageId: Ref<string>,
  pageViewports: Ref<Record<string, PageViewport>>,
  options: PersistenceOptions
) {
  const localSaving = ref(false);
  const savedItemId = ref<string | null>(null);
  const isLoadingInitialData = ref(false);
  const lastEmitVersion = ref('');

  const updateField = (
    fieldKey: string,
    value: any,
    modelValue: Record<string, any>,
    emit: (event: 'update:modelValue', value: Record<string, any>) => void,
    saving: boolean
  ) => {
    if (saving) return;

    const newEdits = { ...(modelValue || {}) };
    newEdits[fieldKey] = value;
    
    emit('update:modelValue', newEdits);
    lastEmitVersion.value = JSON.stringify(newEdits);
  };

  const saveFlow = async (
    primaryKey: string | null | undefined,
    isNew: boolean,
    modelValue: Record<string, any>,
    item: Record<string, any> | null,
    flowName: string,
    updatePageCounts: () => void
  ) => {
    if (localSaving.value) return;
    
    try {
      localSaving.value = true;
      updatePageCounts();
      
      const flowData: WorkflowPersistenceData = { 
        nodes: flowNodes.value, 
        edges: flowEdges.value,
        pages: pages.value,
        currentPageId: currentPageId.value,
        pageViewports: pageViewports.value
      };
      
      const payload: Record<string, any> = { 
        data: flowData
      };

      const nameValue = flowName?.trim() || modelValue.name || item?.name || 'Untitled Workflow';
      payload.name = nameValue;

      if (modelValue?.description !== undefined) {
        payload.description = modelValue.description;
      }

      const effectiveId = savedItemId.value || primaryKey;
      const isCreate = isNew || !effectiveId || effectiveId === '+';
      if (!isCreate && !effectiveId) throw new Error('Missing primary key for update operation');
      
      const endpoint = isCreate
        ? `/items/${options.collection}`
        : `/items/${options.collection}/${effectiveId}`;

      const response = isCreate
        ? await options.api.post(endpoint, payload)
        : await options.api.patch(endpoint, payload);

      const saved = response?.data?.data || response?.data;
      
      if (saved?.id) {
        savedItemId.value = saved.id;
      }

      options.notifications?.add({ 
        title: 'Workflow Saved', 
        text: saved?.id ? `ID: ${saved.id}` : 'Changes persisted', 
        type: 'success' 
      });

      options.onSave?.(saved);

      return saved;
    } catch (e: any) {
      const message = e?.response?.data?.errors?.[0]?.message || e.message || 'Failed to save workflow';
      options.notifications?.add({ title: 'Save Failed', text: message, type: 'error' });
      options.onError?.(e);
      throw e;
    } finally {
      localSaving.value = false;
    }
  };

  const cloneWorkflow = async (
    isNew: boolean,
    item: Record<string, any> | null,
    modelValue: Record<string, any>,
    flowName: string
  ) => {
    if (localSaving.value) return;
    if (isNew) {
      options.notifications?.add({ 
        title: 'Cannot Clone', 
        text: 'Save the workflow first before cloning', 
        type: 'error' 
      });
      return;
    }
    
    try {
      localSaving.value = true;
      
      const flowData: WorkflowPersistenceData = { 
        nodes: flowNodes.value, 
        edges: flowEdges.value,
        pages: pages.value,
        currentPageId: currentPageId.value,
        pageViewports: pageViewports.value
      };
      
      const originalName = flowName?.trim() || item?.name || 'Untitled Workflow';
      const cloneName = `${originalName} (Copy)`;
      
      const payload: Record<string, any> = {
        data: flowData,
        name: cloneName,
        description: item?.description || modelValue?.description || ''
      };

      const endpoint = `/items/${options.collection}`;
      const response = await options.api.post(endpoint, payload);
      const cloned = response?.data?.data || response?.data;

      options.notifications?.add({ 
        title: 'Workflow Cloned', 
        text: `Created "${cloneName}"`, 
        type: 'success' 
      });

      return cloned;
    } catch (e: any) {
      const message = e?.response?.data?.errors?.[0]?.message || e.message || 'Failed to clone workflow';
      options.notifications?.add({ title: 'Clone Failed', text: message, type: 'error' });
      options.onError?.(e);
      throw e;
    } finally {
      localSaving.value = false;
    }
  };

  const loadFlowData = (
    data: any,
    selectedNode: Ref<Node | null>,
    selectedEdge: Ref<Edge | null>,
    selectedNodes: Ref<Set<string>>,
    isMultiSelecting: Ref<boolean>,
    updatePageCounts: () => void,
    handleOpenCollection: (collectionName: string) => void
  ) => {
    isLoadingInitialData.value = true;
    
    selectedNodes.value.clear();
    isMultiSelecting.value = false;
    selectedNode.value = null;
    selectedEdge.value = null;
    
    if (data) {
      try {
        const flowData = typeof data === 'string' ? JSON.parse(data) : data;

        const validatedNodes = (flowData.nodes || []).map((node: Node, index: number) => {
          const cleanClass = (typeof node.class === 'string' && node.class) 
            ? node.class.replace(/\s*multi-selected\s*/g, ' ').trim()
            : '';
          
          const nodeId = node.id || `node-${index}-${Date.now()}`;
            
          return {
            ...node,
            id: nodeId,
            class: cleanClass,
            data: {
              label: node.data?.label || 'Unnamed',
              name: node.data?.name || node.data?.label || 'Unnamed',
              description: node.data?.description || '',
              ...node.data,
              ...(node.type === 'process' && { openCollection: handleOpenCollection }),
            },
          };
        });

        flowNodes.value = validatedNodes;
        flowEdges.value = (flowData.edges || []).map((edge: Edge) => ({
          ...edge,
          id: edge.id || `edge-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: edge.type || 'step',
          animated: edge.animated !== false,
          style: edge.style || { strokeWidth: 2 },
          markerEnd: edge.markerEnd || { type: 'arrowclosed' },
          data: { label: edge.data?.label || '', ...edge.data },
        }));
        
        pages.value = flowData.pages || [];
        currentPageId.value = flowData.currentPageId || 'root';
        pageViewports.value = flowData.pageViewports || {};
        
        updatePageCounts();

        if (validatedNodes && validatedNodes.length > 0) {
          nextTick(() => {
            isLoadingInitialData.value = false;
            options.onLoad?.();
          });
        } else {
          isLoadingInitialData.value = false;
        }
      } catch {
        flowNodes.value = [];
        flowEdges.value = [];
        pages.value = [];
        currentPageId.value = 'root';
        isLoadingInitialData.value = false;
      }
    } else {
      isLoadingInitialData.value = false;
    }
  };

  return {
    localSaving,
    savedItemId,
    isLoadingInitialData,
    lastEmitVersion,
    
    updateField,
    saveFlow,
    cloneWorkflow,
    loadFlowData,
  };
}
