import { ref, computed, type Ref } from 'vue';
import type { Node } from '@vue-flow/core';
import type { Page } from './useWorkflowData';

export interface PageViewport {
  x: number;
  y: number;
  zoom: number;
}

export interface PageManagementOptions {
  onViewportChange?: (pageId: string, viewport: PageViewport) => void;
  onNavigate?: (pageId: string) => void;
}

export function usePageManagement(
  flowNodes: Ref<Node[]>,
  options: PageManagementOptions = {}
) {
  const pages = ref<Page[]>([]);
  const currentPageId = ref<string>('root');
  const pageViewports = ref<Record<string, PageViewport>>({});

  const currentPage = computed(() => {
    if (currentPageId.value === 'root') {
      return { id: 'root', name: 'Main', description: 'Main workflow page' };
    }
    return pages.value.find(p => p.id === currentPageId.value) || null;
  });

  const pageBreadcrumbs = computed(() => {
    const breadcrumbs = [];
    let currentId = currentPageId.value;
    
    const path = [];
    while (currentId && currentId !== 'root') {
      const page = pages.value.find(p => p.id === currentId);
      if (!page) break;
      path.unshift({ id: page.id, name: page.name });
      currentId = page.parentPageId || 'root';
    }
    
    breadcrumbs.push({ id: 'root', name: 'Main' });
    breadcrumbs.push(...path);
    
    return breadcrumbs;
  });

  const visibleNodes = computed(() => {
    return flowNodes.value.filter(node => 
      (node.data?.pageId || 'root') === currentPageId.value
    );
  });

  const rootPages = computed(() => {
    return pages.value.filter(p => !p.parentPageId || p.parentPageId === 'root');
  });

  const getChildPages = (pageId: string): Page[] => {
    return pages.value.filter(p => p.parentPageId === pageId);
  };

  const addPage = (page: Page) => {
    if (!page.color) {
      const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'];
      page.color = colors[pages.value.length % colors.length];
    }
    pages.value.push(page);
  };

  const removePage = (pageId: string) => {
    pages.value = pages.value.filter(p => p.id !== pageId);
    
    flowNodes.value.forEach(node => {
      if (node.data?.pageId === pageId) {
        node.data.pageId = 'root';
      }
    });
    
    const childPages = pages.value.filter(p => p.parentPageId === pageId);
    childPages.forEach(childPage => removePage(childPage.id));
    
    delete pageViewports.value[pageId];
    
    if (currentPageId.value === pageId) {
      const parentPage = pages.value.find(p => p.id === pageId);
      currentPageId.value = parentPage?.parentPageId || 'root';
    }
  };

  const updatePage = (pageId: string, updates: Partial<Pick<Page, 'name' | 'description' | 'color'>>) => {
    const pageIndex = pages.value.findIndex(p => p.id === pageId);
    if (pageIndex !== -1) {
      const existingPage = pages.value[pageIndex];
      if (existingPage) {
        pages.value[pageIndex] = { 
          ...existingPage, 
          ...updates
        };
      }
    }
  };

  const navigateToPage = (pageId: string) => {
    currentPageId.value = pageId;
    options.onNavigate?.(pageId);
  };

  const savePageViewport = (pageId: string, viewport: PageViewport) => {
    pageViewports.value[pageId] = { ...viewport };
    options.onViewportChange?.(pageId, viewport);
  };

  const getPageViewport = (pageId: string): PageViewport | null => {
    return pageViewports.value[pageId] || null;
  };

  const clearPageViewport = (pageId: string) => {
    delete pageViewports.value[pageId];
  };

  const updatePageCounts = () => {
    pages.value.forEach(page => {
      const nodeCount = flowNodes.value.filter(node => 
        node.type !== 'page' && (node.data?.pageId || 'root') === page.id
      ).length;
      
      const pageNodes = flowNodes.value.filter(node => 
        node.type === 'page' && node.data?.targetPageId === page.id
      );
      pageNodes.forEach(pageNode => {
        if (pageNode.data) {
          pageNode.data.nodeCount = nodeCount;
        }
      });
    });
  };

  const getPage = (pageId: string): Page | null => {
    if (pageId === 'root') {
      return { id: 'root', name: 'Main', description: 'Main workflow page' };
    }
    return pages.value.find(p => p.id === pageId) || null;
  };

  const hasPage = (pageId: string): boolean => {
    return pageId === 'root' || pages.value.some(p => p.id === pageId);
  };

  const getPageDepth = (pageId: string): number => {
    if (pageId === 'root') return 0;
    
    let depth = 1;
    let currentId = pageId;
    
    while (currentId && currentId !== 'root') {
      const page = pages.value.find(p => p.id === currentId);
      if (!page || !page.parentPageId) break;
      currentId = page.parentPageId;
      depth++;
    }
    
    return depth;
  };

  const getPagePath = (pageId: string): Page[] => {
    const path: Page[] = [];
    let currentId = pageId;
    
    while (currentId && currentId !== 'root') {
      const page = pages.value.find(p => p.id === currentId);
      if (!page) break;
      path.unshift(page);
      currentId = page.parentPageId || 'root';
    }
    
    return path;
  };

  return {
    pages,
    currentPageId,
    pageViewports,
    
    currentPage,
    pageBreadcrumbs,
    visibleNodes,
    rootPages,
    
    addPage,
    removePage,
    updatePage,
    navigateToPage,
    
    savePageViewport,
    getPageViewport,
    clearPageViewport,
    
    updatePageCounts,
    getPage,
    hasPage,
    getChildPages,
    getPageDepth,
    getPagePath,
  };
}
