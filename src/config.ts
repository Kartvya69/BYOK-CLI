import { readFile, writeFile, mkdir, access, chmod } from 'fs/promises';
import { constants } from 'fs';
import { homedir } from 'os';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { z } from 'zod';
import lockfile from 'proper-lockfile';

// Try to import keytar for secure credential storage
let keytar: any = null;
try {
  const keytarModule = await import('keytar');
  keytar = keytarModule.default || keytarModule;
  if (!keytar || typeof keytar.setPassword !== 'function') {
    keytar = null;
  }
} catch {
  keytar = null;
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const SETTINGS_PATH = join(homedir(), '.factory', 'settings.json');

// BYOK-CLI dedicated storage
const BYOK_DIR = join(homedir(), '.byok-cli');
const SAVED_PROVIDERS_PATH = join(BYOK_DIR, 'providers.json');
const SAVED_MODELS_PATH = join(BYOK_DIR, 'models.json');
const KEYTAR_SERVICE = 'byok-cli';
const KEYTAR_ACCOUNT_PREFIX = 'provider-';

// Zod schemas for validation
const ModelConfigSchema = z.object({
  model: z.string().min(1),
  displayName: z.string().min(1),
  baseUrl: z.string().url(),
  apiKey: z.string().optional(),
  provider: z.string().min(1),
  maxOutputTokens: z.number().int().min(1).max(2000000).default(() => 16384),
  supportsImages: z.boolean().optional(),
  extraArgs: z.record(z.string(), z.any()).optional(),
  extraHeaders: z.record(z.string(), z.string()).optional()
});

// Note: We don't use a Zod schema for the full settings.json
// to avoid stripping unknown fields that Droid uses

const ProviderConfigSchema = z.object({
  name: z.string().min(1),
  baseUrl: z.string().url(),
  providerType: z.string().min(1),
  modelsEndpoint: z.string().default(() => '/models'),
  noAuth: z.boolean().default(() => false),
  apiKey: z.string().optional()
});

export type ModelConfig = z.infer<typeof ModelConfigSchema>;
export type ProviderConfig = z.infer<typeof ProviderConfigSchema>;

function safeJsonParse(text: string, defaultValue: any = null) {
  try {
    return JSON.parse(text, (key, value) => {
      if (key === '__proto__' || key === 'constructor') {
        return undefined;
      }
      return value;
    });
  } catch {
    return defaultValue;
  }
}

function getKeytarAccount(providerName: string) {
  return `${KEYTAR_ACCOUNT_PREFIX}${providerName}`;
}

export function isSecureStorageAvailable() {
  return keytar !== null;
}

export async function storeApiKeySecurely(providerName: string, apiKey: string) {
  if (!keytar) return false;
  try {
    await keytar.setPassword(KEYTAR_SERVICE, getKeytarAccount(providerName), apiKey);
    return true;
  } catch {
    return false;
  }
}

export async function getApiKeySecurely(providerName: string) {
  if (!keytar) return null;
  try {
    return await keytar.getPassword(KEYTAR_SERVICE, getKeytarAccount(providerName));
  } catch {
    return null;
  }
}

async function setSecurePermissions(filePath: string) {
  try {
    await chmod(filePath, 0o600);
  } catch {
    // Ignore
  }
}

async function ensureSecureDirectory(dirPath: string) {
  try {
    await access(dirPath, constants.F_OK);
  } catch {
    await mkdir(dirPath, { recursive: true, mode: 0o700 });
  }
}

async function atomicWriteFile(filePath: string, content: string) {
  const dir = dirname(filePath);
  const tempPath = join(dir, `.tmp.${Date.now()}.${Math.random().toString(36).slice(2)}`);
  await writeFile(tempPath, content, 'utf-8');
  await setSecurePermissions(tempPath);
  const fs = await import('fs');
  await fs.promises.rename(tempPath, filePath);
}

async function withFileLock<T>(filePath: string, operation: () => Promise<T>, defaultContent: string = '[]'): Promise<T> {
  const dir = dirname(filePath);
  await ensureSecureDirectory(dir);
  
  // Ensure file exists before locking (proper-lockfile requires it)
  try {
    await access(filePath, constants.F_OK);
  } catch {
    await writeFile(filePath, defaultContent, 'utf-8');
    await setSecurePermissions(filePath);
  }
  
  let release: any;
  try {
    release = await lockfile.lock(filePath, {
      retries: { retries: 10, factor: 2, minTimeout: 100, maxTimeout: 1000 }
    });
    return await operation();
  } finally {
    if (release) await release();
  }
}

export function generateModelConfig(options: {
  model: string;
  displayName: string;
  baseUrl: string;
  apiKey?: string;
  provider: string;
  maxOutputTokens?: number;
  supportsImages?: boolean;
  extraArgs?: Record<string, any>;
  extraHeaders?: Record<string, string>;
}): ModelConfig {
  const config: ModelConfig = {
    model: options.model,
    displayName: options.displayName,
    baseUrl: options.baseUrl,
    apiKey: options.apiKey,
    provider: options.provider,
    maxOutputTokens: options.maxOutputTokens || 16384,
  };

  if (options.supportsImages) config.supportsImages = true;
  if (options.extraArgs && Object.keys(options.extraArgs).length > 0) {
    config.extraArgs = options.extraArgs;
  }
  if (options.extraHeaders && Object.keys(options.extraHeaders).length > 0) {
    config.extraHeaders = options.extraHeaders;
  }

  const result = ModelConfigSchema.safeParse(config);
  if (!result.success) {
    throw new Error(`Invalid model configuration: ${result.error.message}`);
  }

  return result.data;
}

export async function readSettingsRaw(): Promise<Record<string, any>> {
  try {
    await access(SETTINGS_PATH, constants.R_OK);
  } catch (error: any) {
    if (error.code === 'ENOENT') return {};
    throw error;
  }

  try {
    const content = await readFile(SETTINGS_PATH, 'utf-8');
    return safeJsonParse(content, {}) || {};
  } catch (error) {
    throw new Error(`Failed to read settings: ${error}`);
  }
}

export async function readSettings() {
  const raw = await readSettingsRaw();
  // Only extract customModels, don't validate the whole object
  return {
    customModels: Array.isArray(raw.customModels) ? raw.customModels : []
  };
}

export async function addModelToSettings(modelConfig: ModelConfig) {
  return withFileLock(SETTINGS_PATH, async () => {
    // Read raw settings to preserve all other fields
    const settings = await readSettingsRaw();

    // Ensure customModels array exists
    if (!Array.isArray(settings.customModels)) {
      settings.customModels = [];
    }

    // Find existing model by model+baseUrl
    const existingIndex = settings.customModels.findIndex(
      (m: any) => m.model === modelConfig.model && m.baseUrl === modelConfig.baseUrl
    );

    // Validate the new config before adding
    const result = ModelConfigSchema.safeParse(modelConfig);
    if (!result.success) {
      throw new Error(`Invalid model configuration: ${result.error.message}`);
    }

    if (existingIndex >= 0) {
      settings.customModels[existingIndex] = result.data;
    } else {
      settings.customModels.push(result.data);
    }

    await atomicWriteFile(SETTINGS_PATH, JSON.stringify(settings, null, 2));
    return SETTINGS_PATH;
  }, '{}');
}

export function getSettingsPath() {
  return SETTINGS_PATH;
}

export async function ensureByokDirectory() {
  await ensureSecureDirectory(BYOK_DIR);
}

export async function readSavedProviders(): Promise<ProviderConfig[]> {
  await ensureByokDirectory();

  try {
    await access(SAVED_PROVIDERS_PATH, constants.R_OK);
  } catch (error: any) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }

  try {
    const content = await readFile(SAVED_PROVIDERS_PATH, 'utf-8');
    const parsed = safeJsonParse(content, []);
    if (!Array.isArray(parsed)) return [];

    const validated: ProviderConfig[] = [];
    for (const provider of parsed) {
      const result = ProviderConfigSchema.safeParse(provider);
      if (result.success) {
        const secureKey = await getApiKeySecurely(result.data.name);
        validated.push({
          ...result.data,
          apiKey: secureKey || provider.apiKey
        });
      }
    }
    return validated;
  } catch {
    return [];
  }
}

export async function saveProvider(providerConfig: ProviderConfig) {
  const result = ProviderConfigSchema.safeParse(providerConfig);
  if (!result.success) {
    throw new Error(`Invalid provider configuration: ${result.error.message}`);
  }

  await ensureByokDirectory();

  return withFileLock(SAVED_PROVIDERS_PATH, async () => {
    const providers = await readSavedProviders();
    const existingIndex = providers.findIndex(
      p => p.name === providerConfig.name || p.baseUrl === providerConfig.baseUrl
    );

    const { apiKey, ...providerWithoutKey } = providerConfig;
    const validatedProvider = result.data;

    if (existingIndex >= 0) {
      providers[existingIndex] = validatedProvider;
    } else {
      providers.push(validatedProvider);
    }

    await atomicWriteFile(SAVED_PROVIDERS_PATH, JSON.stringify(providers, null, 2));

    if (apiKey && !providerConfig.noAuth) {
      await storeApiKeySecurely(providerConfig.name, apiKey);
    }

    return SAVED_PROVIDERS_PATH;
  });
}

// Model tracking for BYOK-CLI with full configuration
export interface TrackedModel {
  modelId: string;
  providerName: string;
  baseUrl: string;
  displayName: string;
  maxOutputTokens: number;
  supportsImages: boolean;
  provider: string;
  addedAt: string;
}

export async function readTrackedModels(): Promise<TrackedModel[]> {
  await ensureByokDirectory();

  try {
    await access(SAVED_MODELS_PATH, constants.R_OK);
  } catch (error: any) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }

  try {
    const content = await readFile(SAVED_MODELS_PATH, 'utf-8');
    const parsed = safeJsonParse(content, []);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function getTrackedModelsByProvider(baseUrl: string): Promise<TrackedModel[]> {
  const allModels = await readTrackedModels();
  return allModels.filter(m => m.baseUrl === baseUrl);
}

export async function trackModel(modelConfig: {
  modelId: string;
  providerName: string;
  baseUrl: string;
  displayName: string;
  maxOutputTokens: number;
  supportsImages: boolean;
  provider: string;
}) {
  await ensureByokDirectory();

  return withFileLock(SAVED_MODELS_PATH, async () => {
    const models = await readTrackedModels();

    const existingIndex = models.findIndex(
      m => m.modelId === modelConfig.modelId && m.baseUrl === modelConfig.baseUrl
    );

    const tracked: TrackedModel = {
      ...modelConfig,
      addedAt: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      models[existingIndex] = tracked;
    } else {
      models.push(tracked);
    }

    await atomicWriteFile(SAVED_MODELS_PATH, JSON.stringify(models, null, 2));
    return SAVED_MODELS_PATH;
  });
}

export async function getSavedProviderByName(name: string): Promise<ProviderConfig | null> {
  const providers = await readSavedProviders();
  return providers.find(p => p.name === name) || null;
}

export async function getSavedProviderByBaseUrl(baseUrl: string): Promise<ProviderConfig | null> {
  const providers = await readSavedProviders();
  return providers.find(p => p.baseUrl === baseUrl) || null;
}
