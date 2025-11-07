import { ref, computed } from 'vue';
import { useApi } from '@directus/extensions-sdk';

export interface ModuleConfig {
  workflowsCollection: string;
}

export function useModuleConfig() {
  const api = useApi();
  const workflowsCollection = ref<string>('');
  const isInitialized = ref(false);
  const error = ref<string | null>(null);

  const initializeCollection = async () => {
    try {
      // Try to get the configured collection from module settings
      // First, check if there's a stored config in the browser
      const storedConfig = localStorage.getItem('workflow-module-config');
      if (storedConfig) {
        const config = JSON.parse(storedConfig);
        if (config.collection) {
          workflowsCollection.value = config.collection;
          isInitialized.value = true;
          return config.collection;
        }
      }

      // Try to find a collection named "workflows"
      const collectionsResponse = await api.get('/collections', {
        params: {
          fields: ['collection', 'meta.name']
        }
      });

      const collections = collectionsResponse.data.data || [];
      const workflowsExists = collections.find(
        (c: any) => c.collection === 'workflows' && !c.collection.startsWith('directus_')
      );

      if (workflowsExists) {
        workflowsCollection.value = 'workflows';
        saveConfig('workflows');
        isInitialized.value = true;
        return 'workflows';
      }

      // If no "workflows" collection, prompt user to select one
      // Store the available collections for the user to choose from
      const availableCollections = collections
        .filter((c: any) => !c.collection.startsWith('directus_'))
        .map((c: any) => ({
          value: c.collection,
          text: c.meta?.name || c.collection
        }));

      if (availableCollections.length > 0) {
        error.value = 'Workflows collection not found. Please configure it.';
      } else {
        error.value = 'No collections available.';
      }

      return null;
    } catch (e) {
      error.value = `Failed to initialize module: ${e instanceof Error ? e.message : 'Unknown error'}`;
      console.error('Module initialization error:', e);
      return null;
    } finally {
      isInitialized.value = true;
    }
  };

  const saveConfig = (collection: string) => {
    try {
      localStorage.setItem('workflow-module-config', JSON.stringify({
        collection,
        timestamp: Date.now()
      }));
      workflowsCollection.value = collection;
      error.value = null;
    } catch (e) {
      console.error('Failed to save config:', e);
    }
  };

  const isConfigured = computed(() => {
    return workflowsCollection.value !== '' && !error.value;
  });

  return {
    workflowsCollection,
    isInitialized,
    isConfigured,
    error,
    initializeCollection,
    saveConfig,
  };
}
