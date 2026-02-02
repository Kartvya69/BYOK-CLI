#!/usr/bin/env node

import React, { useState, useEffect } from 'react';
import { render, Box, Text, useApp, useInput } from 'ink';
import { Select, TextInput, Spinner, ConfirmInput } from '@inkjs/ui';
import { Layout } from './components/Layout.js';
import { colors, emojis, steps } from './theme.js';
import { PROVIDERS, getProviderChoices, PROVIDER_TYPES } from './providers.js';
import { extractProviderName } from './utils/extractProviderName.js';
import { validateUrl, validateOpenAICompatibleUrl } from './utils/validateUrl.js';
import { fetchModels } from './utils/api.js';
import { getModelDisplayName } from './utils/modelsDev.js';
import {
  generateModelConfig,
  addModelToSettings,
  getSettingsPath,
  saveProvider,
  readSavedProviders,
  trackModel,
  getTrackedModelsByProvider,
  type ProviderConfig,
  type TrackedModel
} from './config.js';
import type { AppState, Step } from './types.js';
import { initialState } from './types.js';
import { BoxConfirmInput } from './components/BoxConfirmInput.js';
import { ModelSelectInput } from './components/ModelSelectInput.js';


function App() {
  const { exit } = useApp();
  const [state, setState] = useState<AppState>(initialState);
  const [savedProviders, setSavedProviders] = useState<ProviderConfig[]>([]);
  const [existingModels, setExistingModels] = useState<TrackedModel[]>([]);
  const [selectedSavedProvider, setSelectedSavedProvider] = useState<ProviderConfig | null>(null);
  const [isLoadingProviders, setIsLoadingProviders] = useState(true);

  // Load saved providers on mount
  useEffect(() => {
    loadSavedProviders();
  }, []);

  const loadSavedProviders = async () => {
    try {
      const providers = await readSavedProviders();
      setSavedProviders(providers);
    } catch (error) {
      // Ignore errors, just start with empty list
    } finally {
      setIsLoadingProviders(false);
    }
  };

  // Handle ESC key for going back
  useInput((_input: string, key: { escape: boolean }) => {
    if (key.escape) {
      goBack();
    }
  });

  const goBack = () => {
    const stepOrder: Step[] = ['provider', 'provider-detail', 'url', 'title', 'key', 'models', 'settings', 'confirm'];
    const currentIndex = stepOrder.indexOf(state.step);

    if (currentIndex > 0) {
      const prevStep = stepOrder[currentIndex - 1];
      // If going back from detail, clear selected provider
      if (state.step === 'provider-detail') {
        setSelectedSavedProvider(null);
      }
      setState(prev => ({ ...prev, step: prevStep, error: null }));
    }
  };

  const resetToProviderSelection = () => {
    setState({ ...initialState, step: 'provider' });
    setSelectedSavedProvider(null);
    setExistingModels([]);
    loadSavedProviders(); // Refresh the list
  };

  // Step 1: Provider Selection
  const handleProviderSelect = async (value: string) => {
    // Check if this is a saved provider selection (prefixed with 'saved:')
    if (value.startsWith('saved:')) {
      const baseUrl = value.replace('saved:', '');
      const savedProvider = savedProviders.find(p => p.baseUrl === baseUrl);
      if (savedProvider) {
        const models = await getTrackedModelsByProvider(savedProvider.baseUrl);
        setExistingModels(models);
        setSelectedSavedProvider(savedProvider);
        setState(prev => ({
          ...prev,
          providerKey: 'custom',
          providerName: savedProvider.name,
          baseUrl: savedProvider.baseUrl,
          providerType: savedProvider.providerType,
          apiKey: savedProvider.apiKey || '',
          displayTitle: savedProvider.name,
          extractedProviderName: savedProvider.name,
          step: 'provider-detail'
        }));
        return;
      }
    }

    const provider = PROVIDERS[value]!;

    const newState = {
      ...state,
      providerKey: value,
      providerName: provider.name,
      baseUrl: provider.baseUrl || '',
      providerType: provider.type || 'generic-chat-completion-api',
    };

    if (value === 'custom') {
      setState({ ...newState, step: 'url' });
    } else if (provider.requiresBaseUrl) {
      setState({ ...newState, step: 'url' });
    } else {
      setState({ ...newState, extractedProviderName: provider.name, displayTitle: provider.name, step: 'key' });
    }
  };

  // Handle saved provider actions
  const handleSavedProviderAction = (action: 'add-models' | 'edit' | 'back') => {
    if (action === 'back') {
      setSelectedSavedProvider(null);
      setExistingModels([]);
      setState(prev => ({ ...prev, step: 'provider' }));
    } else if (action === 'add-models') {
      // Skip to fetching models
      setState(prev => ({ ...prev, step: 'fetching' }));
    } else if (action === 'edit') {
      // Go to URL step to reconfigure
      setState(prev => ({ ...prev, step: 'url' }));
    }
  };

  // Step 2: Base URL Input
  const handleUrlSubmit = (url: string) => {
    // Use OpenAI-compatible validation for generic-chat-completion-api providers
    const isOpenAICompatible = state.providerType === 'generic-chat-completion-api';
    const validation = isOpenAICompatible ? validateOpenAICompatibleUrl(url) : validateUrl(url);
    
    if (!validation.valid) {
      setState(prev => ({ ...prev, error: validation.error || '❌ Invalid URL' }));
      return;
    }
    
    const extractedName = extractProviderName(validation.normalizedUrl || url);
    setState(prev => ({
      ...prev,
      baseUrl: validation.normalizedUrl || url,
      extractedProviderName: extractedName,
      displayTitle: extractedName,
      error: null,
      step: 'title',
    }));
  };

  // Step 3: Title Configuration
  const handleTitleSubmit = (title: string) => {
    setState(prev => {
      // Safety check: if title looks like a URL, use extracted name instead
      const finalTitle = title || prev.extractedProviderName;
      const safeTitle = finalTitle.includes('http') || finalTitle.includes('/') 
        ? prev.extractedProviderName 
        : finalTitle;
      
      return { 
        ...prev, 
        displayTitle: safeTitle, 
        step: 'key',
        error: null 
      };
    });
  };

  // Step 4: API Key
  const handleKeySubmit = (key: string) => {
    setState(prev => ({ ...prev, apiKey: key, step: 'fetching', error: null }));
  };

  // Fetch models when entering fetching step
  useEffect(() => {
    if (state.step === 'fetching') {
      fetchModelsFromProvider();
    }
  }, [state.step]);

  // Store model display names for use in final config
  const [modelDisplayNames, setModelDisplayNames] = useState<Record<string, string>>({});

  const fetchModelsFromProvider = async () => {
    try {
      const provider = PROVIDERS[state.providerKey];
      const models = await fetchModels(
        state.baseUrl,
        state.apiKey,
        provider?.modelsEndpoint,
        provider?.noAuth || false,
        state.providerType
      );

      // Enrich with models.dev data and store display names
      const displayNames: Record<string, string> = {};
      const enrichedModels = await Promise.all(
        models.map(async (m) => {
          const displayName = await getModelDisplayName(m.id);
          displayNames[m.id] = displayName;
          return {
            label: `${displayName} (${m.id})`,
            value: m.id,
          };
        })
      );

      setModelDisplayNames(displayNames);
      setState(prev => ({
        ...prev,
        availableModels: enrichedModels,
        step: 'models',
        error: null
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        availableModels: [],
        step: 'models',
        error: null
      }));
    }
  };

  // Step 5: Model Selection
  const handleModelsSelect = (models: string[]) => {
    setState(prev => ({ ...prev, selectedModels: models, step: 'settings', error: null }));
  };

  const handleManualModelSubmit = async (modelId: string) => {
    if (modelId.trim()) {
      const trimmedId = modelId.trim();
      // Fetch display name for manual entry
      const displayName = await getModelDisplayName(trimmedId);
      setModelDisplayNames(prev => ({ ...prev, [trimmedId]: displayName }));
      setState(prev => ({ ...prev, selectedModels: [trimmedId], step: 'settings', error: null }));
    }
  };



  // Step 6: Settings
  const handleSettingsSubmit = (settings: { maxTokens: number; supportsImages: boolean }) => {
    setState(prev => ({
      ...prev,
      maxOutputTokens: settings.maxTokens,
      supportsImages: settings.supportsImages,
      step: 'confirm',
      error: null,
    }));
  };

  // Step 7: Confirmation and Save
  const [isSaving, setIsSaving] = useState(false);

  const handleConfirm = async (confirmed: boolean) => {
    if (!confirmed) {
      exit();
      return;
    }

    setIsSaving(true);

    try {
      for (const modelId of state.selectedModels) {
        // Use cached display name or fetch it
        const displayName = modelDisplayNames[modelId] || await getModelDisplayName(modelId);
        // Safety check: ensure displayTitle is not a URL
        const safeDisplayTitle = state.displayTitle.includes('http') || state.displayTitle.includes('://')
          ? extractProviderName(state.baseUrl)
          : state.displayTitle;
        const config = generateModelConfig({
          model: modelId,
          displayName: `${displayName} [${safeDisplayTitle}]`,
          baseUrl: state.baseUrl,
          apiKey: state.apiKey,
          provider: state.providerType,
          maxOutputTokens: state.maxOutputTokens,
          supportsImages: state.supportsImages,
        });
        await addModelToSettings(config);

        // Track the model in BYOK-CLI storage with full config
        await trackModel({
          modelId,
          providerName: safeDisplayTitle,
          baseUrl: state.baseUrl,
          displayName: `${displayName} [${safeDisplayTitle}]`,
          maxOutputTokens: state.maxOutputTokens,
          supportsImages: state.supportsImages,
          provider: state.providerType,
        });
      }

      await saveProvider({
        name: state.displayTitle,
        baseUrl: state.baseUrl,
        providerType: state.providerType,
        apiKey: state.apiKey,
        modelsEndpoint: PROVIDERS[state.providerKey]?.modelsEndpoint || '/models',
        noAuth: PROVIDERS[state.providerKey]?.noAuth || false,
      });

      // Refresh saved providers list
      await loadSavedProviders();

      // Go to done step (set step first to avoid race condition with isSaving)
      setState(prevState => ({ ...prevState, step: 'done', error: null }));
      setIsSaving(false);
    } catch (error) {
      setIsSaving(false);
      setState(prevState => ({
        ...prevState,
        error: error instanceof Error ? error.message : '💥 Unknown error'
      }));
    }
  };

  // Render current step
  switch (state.step) {
    case 'provider':
      // Build options: saved providers first, then regular providers
      const providerOptions = [
        // Saved providers at the top
        ...savedProviders.map(p => ({
          label: `${emojis.heart} ${p.name} (saved)`,
          value: `saved:${p.baseUrl}`
        })),
        // Separator if there are saved providers
        ...(savedProviders.length > 0 ? [{ label: '───────────────', value: '_separator_' }] : []),
        // Regular providers
        ...getProviderChoices().map(p => ({
          label: `${emojis.star} ${p.name}`,
          value: p.value
        }))
      ];

      return (
        <Layout currentStep="provider" state={state} showHistory={false}>
          <Text color={colors.hotPink} bold>{emojis.provider} Select your provider:</Text>
          <Text color={colors.dimGray} dimColor>Choose the API provider for your custom models</Text>

          <Box marginTop={1}>
            <Select
              options={providerOptions}
              onChange={(value) => {
                if (value !== '_separator_') {
                  handleProviderSelect(value);
                }
              }}
            />
          </Box>
        </Layout>
      );

    case 'provider-detail':
      if (!selectedSavedProvider) return null;
      return (
        <Layout currentStep="provider" state={state} showHistory={false}>
          <Text color={colors.hotPink} bold>{emojis.provider} Provider Details:</Text>

          <Box flexDirection="column" marginY={1} padding={1} borderStyle="round" borderColor={colors.hotPink}>
            <Box flexDirection="row" gap={1}>
              <Text color={colors.lightPink}>Name:</Text>
              <Text color={colors.white} bold>{selectedSavedProvider.name}</Text>
            </Box>
            <Box flexDirection="row" gap={1}>
              <Text color={colors.lightPink}>Base URL:</Text>
              <Text color={colors.white}>{selectedSavedProvider.baseUrl}</Text>
            </Box>
            <Box flexDirection="row" gap={1}>
              <Text color={colors.lightPink}>Type:</Text>
              <Text color={colors.white}>{selectedSavedProvider.providerType}</Text>
            </Box>
          </Box>

          {existingModels.length > 0 && (
            <Box flexDirection="column" marginY={1}>
              <Text color={colors.lightPink} bold>{emojis.model} Existing Models:</Text>
              <Box flexDirection="column" padding={1} borderStyle="round" borderColor={colors.lightPink}>
                {existingModels.map((model) => (
                  <Box key={model.modelId} flexDirection="row" gap={1}>
                    <Text color={colors.success}>{emojis.check}</Text>
                    <Text color={colors.white}>{model.displayName}</Text>
                    <Text color={colors.dimGray}>({model.maxOutputTokens} tokens{model.supportsImages ? ', images' : ''})</Text>
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          <Box marginY={1}>
            <Text color={colors.dimGray} dimColor>What would you like to do?</Text>
          </Box>

          <Box marginTop={1}>
            <Select
              options={[
                { label: `${emojis.model} Add more models`, value: 'add-models' },
                { label: `${emojis.settings} Edit provider configuration`, value: 'edit' },
                { label: `${emojis.back} Go back`, value: 'back' }
              ]}
              onChange={(value) => handleSavedProviderAction(value as 'add-models' | 'edit' | 'back')}
            />
          </Box>
        </Layout>
      );

    case 'url':
      return (
        <Layout currentStep="url" state={state}>
          <Text color={colors.hotPink} bold>{emojis.url} Enter your API base URL:</Text>
          <Text color={colors.dimGray} dimColor>This is the endpoint for your OpenAI-compatible API</Text>
          {state.error && (
            <Text color={colors.error}>{state.error}</Text>
          )}
          <Box marginTop={1}>
            <TextInput
              placeholder="https://api.example.com/v1"
              onSubmit={handleUrlSubmit}
            />
          </Box>
          <Text color={colors.dimGray} dimColor>Example: https://api.openai.com/v1</Text>
        </Layout>
      );

    case 'title':
      return (
        <Layout currentStep="title" state={state}>
          <Text color={colors.hotPink} bold>{emojis.title} Configure provider display name:</Text>
          
          <Box flexDirection="column" marginY={1} padding={1} borderStyle="round" borderColor={colors.lightPink}>
            <Text color={colors.success}>{emojis.sparkle} Auto-detected from URL:</Text>
            <Text color={colors.white} bold>{state.extractedProviderName}</Text>
          </Box>

          <Box flexDirection="column" marginY={1}>
            <Text color={colors.lightPink}>{emojis.info} Preview:</Text>
            <Text color={colors.white}>Models will appear as "gpt-4 [{state.extractedProviderName}]"</Text>
          </Box>
          
          <Box marginTop={1}>
            <TextInput
              key={state.extractedProviderName}
              defaultValue={state.extractedProviderName}
              placeholder="Enter custom display name (or press Enter to accept)"
              onSubmit={handleTitleSubmit}
            />
          </Box>
        </Layout>
      );

    case 'key':
      const provider = PROVIDERS[state.providerKey];
      if (provider?.noAuth) {
        handleKeySubmit('not-needed');
        return (
          <Layout currentStep="key" state={state}>
            <Spinner label={`${emojis.info} This provider doesn't require an API key...`} />
          </Layout>
        );
      }

      return (
        <Layout currentStep="key" state={state}>
          <Text color={colors.hotPink} bold>{emojis.key} Enter your API key:</Text>
          <Text color={colors.dimGray} dimColor>Your key is stored securely in the system keychain</Text>
          <Box marginTop={1}>
            <TextInput
              placeholder="sk-..."
              onSubmit={handleKeySubmit}
            />
          </Box>
        </Layout>
      );

    case 'fetching':
      return (
        <Layout currentStep="models" state={state}>
          <Spinner label={`${emojis.loading} Fetching available models from ${state.displayTitle}...`} />
        </Layout>
      );

    case 'models':
      if (state.availableModels.length === 0) {
        return (
          <Layout currentStep="models" state={state}>
            <Text color={colors.warning}>{emojis.warning} Could not fetch models automatically</Text>
            <Text color={colors.dimGray} dimColor>Enter the model ID manually (e.g., gpt-4, claude-3-opus, kimi-k2.5)</Text>
            <Box marginTop={1}>
              <TextInput
                placeholder="model-id"
                onSubmit={handleManualModelSubmit}
              />
            </Box>
          </Layout>
        );
      }

      return (
        <Layout currentStep="models" state={state}>
          <Text color={colors.hotPink} bold>{emojis.model} Select models to add:</Text>
          <Text color={colors.dimGray} dimColor>Choose one or more models from {state.displayTitle}</Text>
          <Box marginTop={1}>
            <ModelSelectInput
              options={state.availableModels}
              onSubmit={handleModelsSelect}
            />
          </Box>
        </Layout>
      );

    case 'settings':
      return (
        <SettingsStep 
          onSubmit={handleSettingsSubmit}
          state={state}
        />
      );

    case 'confirm':
      if (isSaving) {
        return (
          <Layout currentStep="confirm" state={state}>
            <Spinner label={`${emojis.loading} Saving models and configuration...`} />
          </Layout>
        );
      }
      return (
        <ConfirmStep
          state={state}
          onConfirm={handleConfirm}
          modelDisplayNames={modelDisplayNames}
        />
      );

    case 'done':
      return (
        <Layout currentStep="done" state={state}>
          <Box flexDirection="column" alignItems="center">
            <Text color={colors.success} bold>{emojis.success} Success!</Text>
            <Text color={colors.white}>
              {emojis.sparkle} {state.selectedModels.length} model(s) added:
            </Text>
            <Box flexDirection="column" marginY={1} padding={1} borderStyle="round" borderColor={colors.success}>
              {state.selectedModels.map((modelId) => (
                <Text key={modelId} color={colors.white}>
                  {emojis.check} {modelDisplayNames[modelId] || modelId}
                </Text>
              ))}
            </Box>
            <Text color={colors.lightPink}>Saved to: {getSettingsPath()}</Text>

            <Box marginTop={2} flexDirection="column" alignItems="center">
              <Text color={colors.dimGray} dimColor>
                Press Ctrl+C to exit or continue to add more models
              </Text>
              <Box marginTop={1}>
                <Select
                  options={[
                    { label: `${emojis.provider} Add more models to this provider`, value: 'add-more-same' },
                    { label: `${emojis.star} Add models to another provider`, value: 'add-more-other' },
                    { label: `${emojis.cross} Exit`, value: 'exit' }
                  ]}
                  onChange={(value) => {
                    if (value === 'exit') {
                      exit();
                    } else if (value === 'add-more-same') {
                      // Reset to fetching for same provider
                      setState({ ...state, step: 'fetching', selectedModels: [] });
                    } else if (value === 'add-more-other') {
                      // Reset to provider selection
                      resetToProviderSelection();
                    }
                  }}
                />
              </Box>
            </Box>
          </Box>
        </Layout>
      );

    default:
      return null;
  }
}

function SettingsStep({ onSubmit, state }: { onSubmit: (settings: { maxTokens: number; supportsImages: boolean }) => void; state: AppState }) {
  const [maxTokens, setMaxTokens] = useState(state.maxOutputTokens.toString());
  const [currentSubStep, setCurrentSubStep] = useState<'tokens' | 'images'>('tokens');

  if (currentSubStep === 'tokens') {
    return (
      <Layout currentStep="settings" state={state}>
        <Text color={colors.hotPink} bold>{emojis.settings} Configure model settings:</Text>
        <Text color={colors.dimGray} dimColor>Set the maximum output tokens for your models</Text>
        <Box marginTop={1}>
          <TextInput
            defaultValue={state.maxOutputTokens.toString()}
            placeholder="16384"
            onSubmit={(value: string) => {
              setMaxTokens(value || '16384');
              setCurrentSubStep('images');
            }}
          />
        </Box>
        <Text color={colors.dimGray} dimColor>Default: 16384 tokens</Text>
      </Layout>
    );
  }

  return (
    <Layout currentStep="settings" state={state}>
      <Text color={colors.hotPink} bold>{emojis.settings} Image support:</Text>
      <Text color={colors.dimGray} dimColor>Can these models process image inputs?</Text>
      <Box marginTop={1}>
        <BoxConfirmInput
          onConfirm={() => onSubmit({ maxTokens: parseInt(maxTokens) || 16384, supportsImages: true })}
          onCancel={() => onSubmit({ maxTokens: parseInt(maxTokens) || 16384, supportsImages: false })}
          prompt="Support image inputs?"
        />
      </Box>
    </Layout>
  );
}

function ConfirmStep({ state, onConfirm, modelDisplayNames }: { state: AppState; onConfirm: (confirmed: boolean) => void; modelDisplayNames: Record<string, string> }) {
  // Generate the config that will be saved
  const generateConfigs = () => {
    // Safety check: ensure displayTitle is not a URL
    const safeDisplayTitle = state.displayTitle.includes('http') || state.displayTitle.includes('://')
      ? extractProviderName(state.baseUrl)
      : state.displayTitle;

    return state.selectedModels.map(modelId => ({
      model: modelId,
      displayName: `${modelDisplayNames[modelId] || modelId} [${safeDisplayTitle}]`,
      baseUrl: state.baseUrl,
      apiKey: state.apiKey,
      provider: state.providerType,
      maxOutputTokens: state.maxOutputTokens,
      supportsImages: state.supportsImages,
    }));
  };

  const configs = generateConfigs();
  const jsonConfig = JSON.stringify(configs, null, 2);

  return (
    <Layout currentStep="confirm" state={state}>
      <Text color={colors.hotPink} bold>{emojis.summary} Configuration Summary:</Text>

      <Box flexDirection="column" marginY={1} padding={1} borderStyle="round" borderColor={colors.hotPink}>
        <Box flexDirection="row" gap={1}>
          <Text color={colors.lightPink}>{emojis.provider} Provider:</Text>
          <Text color={colors.white} bold>{state.displayTitle}</Text>
        </Box>
        <Box flexDirection="row" gap={1}>
          <Text color={colors.lightPink}>{emojis.url} Base URL:</Text>
          <Text color={colors.white}>{state.baseUrl}</Text>
        </Box>
        <Box flexDirection="row" gap={1}>
          <Text color={colors.lightPink}>{emojis.model} Models:</Text>
          <Text color={colors.white}>{state.selectedModels.map(id => modelDisplayNames[id] || id).join(', ')}</Text>
        </Box>
        <Box flexDirection="row" gap={1}>
          <Text color={colors.lightPink}>{emojis.settings} Max Tokens:</Text>
          <Text color={colors.white}>{state.maxOutputTokens}</Text>
        </Box>
        <Box flexDirection="row" gap={1}>
          <Text color={colors.lightPink}>{emojis.settings} Images:</Text>
          <Text color={colors.white}>{state.supportsImages ? 'Yes' : 'No'}</Text>
        </Box>
      </Box>

      <Box marginTop={1}>
        <BoxConfirmInput
          onConfirm={() => onConfirm(true)}
          onCancel={() => onConfirm(false)}
          defaultSelected="yes"
          prompt="Save this configuration?"
          jsonConfig={jsonConfig}
        />
      </Box>
    </Layout>
  );
}

render(<App />);
