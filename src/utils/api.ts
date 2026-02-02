export interface ModelInfo {
  id: string;
  name?: string;
}

interface ApiModel {
  id?: string;
  name?: string;
}

interface ApiResponse {
  data?: ApiModel[];
  models?: ApiModel[];
}

/**
 * Fetch models from a provider's API
 */
export async function fetchModels(
  baseUrl: string,
  apiKey: string,
  modelsEndpoint: string | null | undefined,
  noAuth: boolean,
  providerType: string
): Promise<ModelInfo[]> {
  if (!modelsEndpoint) {
    return [];
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (!noAuth && apiKey) {
    if (providerType === 'anthropic') {
      headers['x-api-key'] = apiKey;
      headers['anthropic-dangerous-direct-browser-access'] = 'true';
    } else {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }
  }

  const url = `${baseUrl.replace(/\/$/, '')}${modelsEndpoint}`;
  
  try {
    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data: unknown = await response.json();
    
    // Handle different response formats
    if (typeof data === 'object' && data !== null) {
      const apiData = data as ApiResponse;
      
      if (apiData.data && Array.isArray(apiData.data)) {
        // OpenAI format
        return apiData.data.map((m: ApiModel) => ({
          id: m.id || '',
          name: m.name || m.id || '',
        }));
      } else if (apiData.models && Array.isArray(apiData.models)) {
        // Some providers wrap in 'models'
        return apiData.models.map((m: ApiModel) => ({
          id: m.id || '',
          name: m.name || m.id || '',
        }));
      }
    }
    
    if (Array.isArray(data)) {
      // Direct array format
      return data.map((m: unknown) => {
        if (typeof m === 'string') {
          return { id: m, name: m };
        }
        const model = m as ApiModel;
        return {
          id: model.id || '',
          name: model.name || model.id || '',
        };
      });
    }
    
    return [];
  } catch (error) {
    throw new Error(`Failed to fetch models: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Normalize model name for display
 */
export function normalizeModelName(modelId: string): string {
  return modelId
    .replace(/^[a-zA-Z0-9]+\//, '') // Remove provider prefix
    .replace(/-/g, ' ')
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}
