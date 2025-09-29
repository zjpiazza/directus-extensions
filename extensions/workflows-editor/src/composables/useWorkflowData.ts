import { ref, computed } from 'vue';
import type { Node, Edge } from '@vue-flow/core';

export interface Page {
  id: string;
  name: string;
  description?: string;
  parentPageId?: string;
  color?: string;
}

export interface WorkflowData {
  nodes: Node[];
  edges: Edge[];
  pages?: Page[];
  currentPageId?: string;
}

export function useWorkflowData(initialData?: WorkflowData) {
  const flowNodes = ref<Node[]>(initialData?.nodes || []);
  const flowEdges = ref<Edge[]>(initialData?.edges || []);
  const pages = ref<Page[]>(initialData?.pages || []);
  const currentPageId = ref<string>(initialData?.currentPageId || 'root');
  const selectedNode = ref<Node | null>(null);

  // Computed properties
  const workflowData = computed((): WorkflowData => ({
    nodes: flowNodes.value,
    edges: flowEdges.value,
    pages: pages.value,
    currentPageId: currentPageId.value,
  }));

  // Get current page info
  const currentPage = computed(() => {
    if (currentPageId.value === 'root') {
      return { id: 'root', name: 'Main', description: 'Main workflow page' };
    }
    return pages.value.find(p => p.id === currentPageId.value) || null;
  });

  // Get page breadcrumb trail
  const pageBreadcrumbs = computed(() => {
    const breadcrumbs = [];
    let currentId = currentPageId.value;
    
    // Build the path from current page back to root
    const path = [];
    while (currentId && currentId !== 'root') {
      const page = pages.value.find(p => p.id === currentId);
      if (!page) break;
      path.unshift({ id: page.id, name: page.name });
      currentId = page.parentPageId || 'root';
    }
    
    // Always include root as first breadcrumb
    breadcrumbs.push({ id: 'root', name: 'Main' });
    breadcrumbs.push(...path);
    
    return breadcrumbs;
  });

  // Get nodes visible on current page
  const visibleNodes = computed(() => {
    return flowNodes.value.filter(node => 
      (node.data?.pageId || 'root') === currentPageId.value
    );
  });

  // Get edges visible on current page (both nodes must be visible)
  const visibleEdges = computed(() => {
    const visibleNodeIds = new Set(visibleNodes.value.map(n => n.id));
    return flowEdges.value.filter(edge =>
      visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target)
    );
  });

  // Methods
  const updateNodeData = () => {
    flowNodes.value = [...flowNodes.value];
  };

  const addNode = (node: Node) => {
    flowNodes.value.push(node);
  };

  const removeNode = (nodeId: string) => {
    flowNodes.value = flowNodes.value.filter((node: Node) => node.id !== nodeId);
    flowEdges.value = flowEdges.value.filter((edge: Edge) =>
      edge.source !== nodeId && edge.target !== nodeId
    );
  };

  const updateNode = (nodeId: string, updates: Partial<Node>) => {
    const nodeIndex = flowNodes.value.findIndex(n => n.id === nodeId);
    if (nodeIndex !== -1) {
      const existingNode = flowNodes.value[nodeIndex];
      if (existingNode) {
        flowNodes.value[nodeIndex] = { 
          ...existingNode, 
          ...updates,
          id: existingNode.id,
          position: updates.position || existingNode.position
        };
      }
    }
  };

  const addEdge = (edge: Edge) => {
    flowEdges.value.push(edge);
  };

  const removeEdge = (edgeId: string) => {
    flowEdges.value = flowEdges.value.filter(edge => edge.id !== edgeId);
  };

  const selectNode = (node: Node | null) => {
    selectedNode.value = node;
  };

  const clearSelection = () => {
    selectedNode.value = null;
  };

  // Page management methods
  const addPage = (page: Page) => {
    pages.value.push(page);
  };

  const removePage = (pageId: string) => {
    pages.value = pages.value.filter(p => p.id !== pageId);
    // Move nodes from deleted page to root
    flowNodes.value.forEach(node => {
      if (node.data?.pageId === pageId) {
        node.data.pageId = 'root';
      }
    });
  };

  const navigateToPage = (pageId: string) => {
    currentPageId.value = pageId;
  };

  const updatePageCounts = () => {
    pages.value.forEach(page => {
      // Count nodes assigned to this page (excluding the page node itself)
      const nodeCount = flowNodes.value.filter(node => 
        node.type !== 'page' && (node.data?.pageId || 'root') === page.id
      ).length;
      
      // Find page nodes that represent this page and update their count
      const pageNodes = flowNodes.value.filter(node => 
        node.type === 'page' && node.data?.pageId === page.id
      );
      pageNodes.forEach(pageNode => {
        if (pageNode.data) {
          pageNode.data.nodeCount = nodeCount;
        }
      });
    });
  };

  return {
    // Reactive data
    flowNodes,
    flowEdges,
    pages,
    currentPageId,
    selectedNode,
    workflowData,

    // Computed properties
    currentPage,
    pageBreadcrumbs,
    visibleNodes,
    visibleEdges,

    // Methods
    updateNodeData,
    addNode,
    removeNode,
    updateNode,
    addEdge,
    removeEdge,
    selectNode,
    clearSelection,
    
    // Page methods
    addPage,
    removePage,
    navigateToPage,
    updatePageCounts,
  };
}
