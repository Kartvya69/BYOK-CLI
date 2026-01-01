import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { homedir } from 'os';
import { join, dirname } from 'path';

const SETTINGS_PATH = join(homedir(), '.factory', 'settings.json');
const SAVED_PROVIDERS_PATH = join(homedir(), '.factory', 'byok-providers.json');
const SAVED_MODELS_PATH = join(homedir(), '.factory', 'byok-models.json');

export function generateModelConfig(options) {
  const config = {
    model: options.model,
    displayName: options.displayName,
    baseUrl: options.baseUrl,
    apiKey: options.apiKey,
    provider: options.provider,
    maxOutputTokens: options.maxOutputTokens || 16384
  };

  if (options.supportsImages) {
    config.supportsImages = true;
  }

  if (options.extraArgs && Object.keys(options.extraArgs).length > 0) {
    config.extraArgs = options.extraArgs;
  }

  if (options.extraHeaders && Object.keys(options.extraHeaders).length > 0) {
    config.extraHeaders = options.extraHeaders;
  }

  return config;
}

export async function readSettings() {
  try {
    if (!existsSync(SETTINGS_PATH)) {
      return { customModels: [] };
    }
    const content = await readFile(SETTINGS_PATH, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return { customModels: [] };
    }
    throw new Error(`Failed to read settings: ${error.message}`);
  }
}

export async function writeSettings(settings) {
  try {
    const dir = dirname(SETTINGS_PATH);
    if (!existsSync(dir)) {
      await mkdir(dir, { recursive: true });
    }
    await writeFile(SETTINGS_PATH, JSON.stringify(settings, null, 2), 'utf-8');
  } catch (error) {
    throw new Error(`Failed to write settings: ${error.message}`);
  }
}

export async function addModelToSettings(modelConfig) {
  const settings = await readSettings();
  
  if (!settings.customModels) {
    settings.customModels = [];
  }
  
  const existingIndex = settings.customModels.findIndex(
    m => m.model === modelConfig.model && m.baseUrl === modelConfig.baseUrl
  );
  
  if (existingIndex >= 0) {
    settings.customModels[existingIndex] = modelConfig;
  } else {
    settings.customModels.push(modelConfig);
  }
  
  await writeSettings(settings);
  return SETTINGS_PATH;
}

export function getSettingsPath() {
  return SETTINGS_PATH;
}

export async function readSavedProviders() {
  try {
    if (!existsSync(SAVED_PROVIDERS_PATH)) {
      return [];
    }
    const content = await readFile(SAVED_PROVIDERS_PATH, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }
    return [];
  }
}

export async function saveProvider(providerConfig) {
  const providers = await readSavedProviders();
  
  const existingIndex = providers.findIndex(
    p => p.name === providerConfig.name || p.baseUrl === providerConfig.baseUrl
  );
  
  if (existingIndex >= 0) {
    providers[existingIndex] = providerConfig;
  } else {
    providers.push(providerConfig);
  }
  
  try {
    const dir = dirname(SAVED_PROVIDERS_PATH);
    if (!existsSync(dir)) {
      await mkdir(dir, { recursive: true });
    }
    await writeFile(SAVED_PROVIDERS_PATH, JSON.stringify(providers, null, 2), 'utf-8');
  } catch (error) {
    throw new Error(`Failed to save provider: ${error.message}`);
  }
  
  return SAVED_PROVIDERS_PATH;
}

export function getSavedProvidersPath() {
  return SAVED_PROVIDERS_PATH;
}

export async function readSavedModels() {
  try {
    if (!existsSync(SAVED_MODELS_PATH)) {
      return [];
    }
    const content = await readFile(SAVED_MODELS_PATH, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }
    return [];
  }
}

export async function saveModels(modelConfigs) {
  const existingModels = await readSavedModels();
  
  for (const config of modelConfigs) {
    const existingIndex = existingModels.findIndex(
      m => m.model === config.model && m.baseUrl === config.baseUrl
    );
    
    if (existingIndex >= 0) {
      existingModels[existingIndex] = config;
    } else {
      existingModels.push(config);
    }
  }
  
  try {
    const dir = dirname(SAVED_MODELS_PATH);
    if (!existsSync(dir)) {
      await mkdir(dir, { recursive: true });
    }
    await writeFile(SAVED_MODELS_PATH, JSON.stringify(existingModels, null, 2), 'utf-8');
  } catch (error) {
    throw new Error(`Failed to save models: ${error.message}`);
  }
  
  return SAVED_MODELS_PATH;
}

export function getSavedModelsPath() {
  return SAVED_MODELS_PATH;
}
