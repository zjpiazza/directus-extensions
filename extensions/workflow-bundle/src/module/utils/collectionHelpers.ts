import { ref } from 'vue';
import { useApi } from '@directus/extensions-sdk';

export interface Collection {
  value: string;
  text: string;
}

export interface Workflow {
  id: string;
  name: string;
}

export function useCollectionData() {
  const api = useApi();
  const availableCollections = ref<Collection[]>([]);
  const availableWorkflows = ref<Workflow[]>([]);

  const fetchCollections = async () => {
    try {
      const response = await api.get('/collections', {
        params: {
          fields: ['collection', 'meta.name']
        }
      });

      availableCollections.value = response.data.data
        .filter((collection: any) => !collection.collection.startsWith('directus_'))
        .map((collection: any) => ({
          value: collection.collection,
          text: collection.meta?.name || collection.collection
        }));
    } catch (error) {
      console.error('Failed to fetch collections:', error);
      availableCollections.value = [];
    }
  };

  const collectionExists = async (collectionName: string): Promise<boolean> => {
    try {
      const response = await api.get('/collections', {
        params: {
          fields: ['collection'],
        }
      });
      return response.data.data.some((c: any) => c.collection === collectionName);
    } catch (error) {
      console.error('Failed to check if collection exists:', error);
      return false;
    }
  };

  const loadWorkflows = async (collectionName: string, currentId?: string) => {
    try {
      const res = await api.get(`/items/${collectionName}`, { 
        params: { fields: 'id,name', limit: -1 } 
      });
      const items = res?.data?.data || [];
      availableWorkflows.value = items
        .filter((w: any) => w.id?.toString() !== currentId)
        .map((w: any) => ({ 
          id: w.id?.toString(), 
          name: w.name || `Workflow ${w.id}` 
        }));
      return availableWorkflows.value;
    } catch (e) {
      console.error('Failed to load workflows:', e);
      return [];
    }
  };

  return {
    availableCollections,
    availableWorkflows,
    fetchCollections,
    loadWorkflows,
    collectionExists,
  };
}

