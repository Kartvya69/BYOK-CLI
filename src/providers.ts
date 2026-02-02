export interface ProviderConfig {
  name: string;
  baseUrl: string | null;
  type: string;
  modelsEndpoint: string | null;
  requiresBaseUrl?: boolean;
  noAuth?: boolean;
}

export const PROVIDERS: Record<string, ProviderConfig> = {
  'openai-compatible': {
    name: 'OpenAI Compatible (Custom URL)',
    baseUrl: null,
    type: 'generic-chat-completion-api',
    modelsEndpoint: '/models',
    requiresBaseUrl: true
  },
  'anthropic-compatible': {
    name: 'Anthropic Compatible (Custom URL)',
    baseUrl: null,
    type: 'anthropic',
    modelsEndpoint: null,
    requiresBaseUrl: true
  },
  openrouter: {
    name: 'OpenRouter',
    baseUrl: 'https://openrouter.ai/api/v1',
    type: 'generic-chat-completion-api',
    modelsEndpoint: '/models'
  },
  deepinfra: {
    name: 'DeepInfra',
    baseUrl: 'https://api.deepinfra.com/v1/openai',
    type: 'generic-chat-completion-api',
    modelsEndpoint: '/models'
  },
  fireworks: {
    name: 'Fireworks AI',
    baseUrl: 'https://api.fireworks.ai/inference/v1',
    type: 'generic-chat-completion-api',
    modelsEndpoint: '/models'
  },
  groq: {
    name: 'Groq',
    baseUrl: 'https://api.groq.com/openai/v1',
    type: 'generic-chat-completion-api',
    modelsEndpoint: '/models'
  },
  ollama: {
    name: 'Ollama (Local)',
    baseUrl: 'http://localhost:11434/v1',
    type: 'generic-chat-completion-api',
    modelsEndpoint: '/models',
    noAuth: true
  },
  gemini: {
    name: 'Google Gemini',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/',
    type: 'generic-chat-completion-api',
    modelsEndpoint: null
  },
  huggingface: {
    name: 'Hugging Face',
    baseUrl: 'https://router.huggingface.co/v1',
    type: 'generic-chat-completion-api',
    modelsEndpoint: '/models'
  },
  baseten: {
    name: 'Baseten',
    baseUrl: 'https://inference.baseten.co/v1',
    type: 'generic-chat-completion-api',
    modelsEndpoint: null
  },
  anthropic: {
    name: 'Anthropic',
    baseUrl: 'https://api.anthropic.com',
    type: 'anthropic',
    modelsEndpoint: null
  },
  openai: {
    name: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
    type: 'openai',
    modelsEndpoint: '/models'
  },
  custom: {
    name: 'Custom Provider',
    baseUrl: null,
    type: 'generic-chat-completion-api',
    modelsEndpoint: '/models'
  }
};

export const PROVIDER_TYPES = [
  { value: 'generic-chat-completion-api', name: 'OpenAI-compatible (Chat Completions API)' },
  { value: 'openai', name: 'OpenAI (Responses API)' },
  { value: 'anthropic', name: 'Anthropic (Messages API)' }
];

export function getProviderChoices(): { name: string; value: string }[] {
  return Object.entries(PROVIDERS).map(([key, provider]) => ({
    name: provider.name,
    value: key
  }));
}
