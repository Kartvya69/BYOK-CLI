export interface ModelsDevModel {
  id: string;
  name: string;
  family?: string | undefined;
  providerId?: string | undefined;
  providerName?: string | undefined;
}

interface ModelsDevProvider {
  name?: string;
  models?: Record<string, ModelsDevModel>;
}

let modelsCache: Record<string, ModelsDevModel> | null = null;

/**
 * Fetch all models from models.dev API and build a lookup map
 */
export async function fetchModelsDevData(): Promise<Record<string, ModelsDevModel>> {
  if (modelsCache) {
    return modelsCache;
  }

  try {
    const response = await fetch('https://models.dev/api.json');
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data: unknown = await response.json();
    const modelMap: Record<string, ModelsDevModel> = {};

    if (typeof data === 'object' && data !== null) {
      // Parse the nested structure: provider -> models
      for (const [providerId, providerData] of Object.entries(data)) {
        const provider = providerData as ModelsDevProvider;
        const providerName = provider.name || providerId;
        const models = provider.models || {};

        for (const [modelId, modelData] of Object.entries(models)) {
          const model = modelData as ModelsDevModel;
          modelMap[modelId] = {
            id: modelId,
            name: model.name || modelId,
            family: model.family,
            providerId,
            providerName,
          };
        }
      }
    }

    modelsCache = modelMap;
    return modelMap;
  } catch (error) {
    console.warn('Failed to fetch models.dev data:', error);
    return {};
  }
}

/**
 * Get model info by ID from models.dev
 */
export async function getModelInfo(modelId: string): Promise<ModelsDevModel | null> {
  const models = await fetchModelsDevData();
  return models[modelId] || null;
}

/**
 * Get display name for a model, fallback to normalized ID if not found
 */
export async function getModelDisplayName(modelId: string): Promise<string> {
  const info = await getModelInfo(modelId);
  if (info?.name) {
    return info.name;
  }
  
  // Fallback: normalize the model ID
  return modelId
    .replace(/^[a-zA-Z0-9]+\//, '') // Remove provider prefix
    .replace(/-/g, ' ')
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}
