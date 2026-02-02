export type Step = 'provider' | 'provider-detail' | 'url' | 'title' | 'key' | 'fetching' | 'models' | 'settings' | 'confirm' | 'done';

export interface AppState {
  step: Step;
  providerKey: string;
  providerName: string;
  baseUrl: string;
  providerType: string;
  apiKey: string;
  extractedProviderName: string;
  displayTitle: string;
  selectedModels: string[];
  availableModels: { label: string; value: string }[];
  maxOutputTokens: number;
  supportsImages: boolean;
  error: string | null;
}

export const initialState: AppState = {
  step: 'provider',
  providerKey: '',
  providerName: '',
  baseUrl: '',
  providerType: 'generic-chat-completion-api',
  apiKey: '',
  extractedProviderName: '',
  displayTitle: '',
  selectedModels: [],
  availableModels: [],
  maxOutputTokens: 16384,
  supportsImages: false,
  error: null,
};
