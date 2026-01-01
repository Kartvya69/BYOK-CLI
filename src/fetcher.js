// Brand name mappings for proper capitalization
const BRANDS = {
  'gpt': 'GPT',
  'llama': 'LLaMA',
  'claude': 'Claude',
  'gemini': 'Gemini',
  'qwen': 'Qwen',
  'mistral': 'Mistral',
  'mixtral': 'Mixtral',
  'deepseek': 'DeepSeek',
  'codestral': 'Codestral',
  'phi': 'Phi',
  'yi': 'Yi',
  'glm': 'GLM',
  'kimi': 'Kimi',
  'granite': 'Granite',
  'falcon': 'Falcon',
  'vicuna': 'Vicuna',
  'wizardlm': 'WizardLM',
  'starcoder': 'StarCoder',
  'codellama': 'CodeLLaMA',
  'solar': 'Solar',
  'command': 'Command',
  'dbrx': 'DBRX',
  'jamba': 'Jamba',
  'nemotron': 'Nemotron',
  'olmo': 'OLMo',
  'aya': 'Aya',
  'zephyr': 'Zephyr',
  'openchat': 'OpenChat',
  'openhermes': 'OpenHermes',
  'nous': 'Nous',
  'hermes': 'Hermes',
  'dolphin': 'Dolphin',
  'neural': 'Neural',
  'titan': 'Titan',
  'palm': 'PaLM',
  'bard': 'Bard',
  'cohere': 'Cohere',
  'ai': 'AI',
  'moe': 'MoE',
  'minimax': 'MiniMax',
  'oss': 'OSS'
};

// Purpose/variant suffixes
const PURPOSES = {
  'instruct': 'Instruct',
  'chat': 'Chat',
  'base': 'Base',
  'vision': 'Vision',
  'coder': 'Coder',
  'code': 'Code',
  'embed': 'Embed',
  'embedding': 'Embedding',
  'guard': 'Guard',
  'guardian': 'Guardian',
  'turbo': 'Turbo',
  'preview': 'Preview',
  'pro': 'Pro',
  'ultra': 'Ultra',
  'flash': 'Flash',
  'haiku': 'Haiku',
  'sonnet': 'Sonnet',
  'opus': 'Opus',
  'mini': 'Mini',
  'nano': 'Nano',
  'micro': 'Micro',
  'large': 'Large',
  'medium': 'Medium',
  'small': 'Small',
  'scout': 'Scout',
  'maverick': 'Maverick',
  'lite': 'Lite',
  'plus': 'Plus',
  'max': 'Max',
  'distill': 'Distill',
  'reasoning': 'Reasoning',
  'thinking': 'Thinking',
  'terminus': 'Terminus',
  'it': 'IT',
  'hf': 'HF',
  'use': 'Use',
  'computer': 'Computer',
  'image': 'Image'
};

// Provider prefixes to remove
const PROVIDER_PREFIXES = [
  'anthropic/',
  'openai/',
  'meta-llama/',
  'meta/',
  'mistralai/',
  'google/',
  'deepseek-ai/',
  'qwen/',
  'alibaba/',
  'microsoft/',
  'nvidia/',
  'ibm-granite/',
  'ibm/',
  'cohere/',
  'accounts/fireworks/models/',
  'accounts/fireworks/',
  'fireworks/',
  'together/',
  'anyscale/',
  'perplexity/',
  'groq/',
  'huggingface/',
  'hf/',
  'thebloke/',
  'nousresearch/',
  'teknium/',
  'cognitivecomputations/',
  'openchat/',
  'lmsys/',
  'berkeley-nest/',
  'stabilityai/',
  'stability/',
  'databricks/',
  'snowflake/',
  'ai21/',
  'writer/',
  'amazon/',
  'aws/',
  'zai-org/',
  'moonshotai/'
];

// File extensions and quantization suffixes to remove
const SUFFIXES_TO_REMOVE = [
  '.gguf',
  '.safetensors',
  '.bin',
  '.pt',
  '.pth',
  '-gguf',
  '-safetensors',
  '-fp16',
  '-fp32',
  '-bf16',
  '-fp8',
  '-int8',
  '-int4',
  '-awq',
  '-gptq',
  '-bnb',
  '-nf4',
  '-q4_0',
  '-q4_1',
  '-q4_k',
  '-q4_k_m',
  '-q4_k_s',
  '-q5_0',
  '-q5_1',
  '-q5_k',
  '-q5_k_m',
  '-q5_k_s',
  '-q6_k',
  '-q8_0',
  '-iq2_xxs',
  '-iq2_xs',
  '-iq3_xxs',
  '-exl2',
  ':latest'
];

export function normalizeModelName(modelId) {
  if (!modelId || typeof modelId !== 'string') {
    return modelId;
  }

  let name = modelId;

  // Step 1: Remove provider prefixes (case-insensitive)
  for (const prefix of PROVIDER_PREFIXES) {
    const regex = new RegExp(`^${prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i');
    name = name.replace(regex, '');
  }

  // Step 2: Remove file extensions and quantization suffixes
  for (const suffix of SUFFIXES_TO_REMOVE) {
    const regex = new RegExp(`${suffix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
    name = name.replace(regex, '');
  }

  // Step 3: Handle special patterns before tokenizing
  // Convert version patterns like "v3p1" to "v3.1"
  name = name.replace(/v(\d+)p(\d+)/gi, 'v$1.$2');
  
  // Convert patterns like "3p1" to "3.1" (without v prefix)
  name = name.replace(/(\d+)p(\d+)/g, '$1.$2');
  
  // Handle "r1", "k2" patterns - keep them together
  name = name.replace(/([rk])(\d+)/gi, (match, letter, num) => `${letter.toUpperCase()}${num}`);

  // Step 4: Tokenize - split on delimiters but preserve some patterns
  let tokens = name.split(/[-_/:]+/);

  // Step 5: Process each token
  const processedTokens = [];
  let i = 0;

  while (i < tokens.length) {
    let token = tokens[i].trim();
    
    if (!token) {
      i++;
      continue;
    }

    // Check if this is a date stamp (8 digits like 20250929)
    if (/^\d{8}$/.test(token)) {
      i++;
      continue;
    }

    // Check if this is a 4-digit date stamp (like 2407, 0905) or year (2024, 2025)
    if (/^\d{4}$/.test(token)) {
      const num = parseInt(token);
      // Skip if it looks like YYMM, MMDD, or year format
      if ((num >= 100 && num <= 1231) || (num >= 2020 && num <= 2099) || (num >= 2400 && num <= 2512)) {
        i++;
        continue;
      }
    }

    // Check if this is a 2-digit number that could be part of a date (like 04, 09)
    if (/^0\d$/.test(token)) {
      i++;
      continue;
    }

    // Check for version pattern: two adjacent single-digit number tokens (e.g., "4", "5" -> "4.5")
    if (/^\d$/.test(token) && i + 1 < tokens.length && /^\d$/.test(tokens[i + 1])) {
      processedTokens.push(`${token}.${tokens[i + 1]}`);
      i += 2;
      continue;
    }

    // Handle size indicators (e.g., "8b", "70b", "278m")
    const sizeMatch = token.match(/^(\d+(?:\.\d+)?)(b|m)$/i);
    if (sizeMatch) {
      processedTokens.push(`${sizeMatch[1]}${sizeMatch[2].toUpperCase()}`);
      i++;
      continue;
    }

    // Handle MoE format (e.g., "8x7b", "16x17b")
    const moeMatch = token.match(/^(\d+)x(\d+)(b|m)?$/i);
    if (moeMatch) {
      const suffix = moeMatch[3] ? moeMatch[3].toUpperCase() : 'B';
      processedTokens.push(`${moeMatch[1]}x${moeMatch[2]}${suffix}`);
      i++;
      continue;
    }

    // Handle version with 'v' prefix (e.g., "v0.1", "v3")
    const versionMatch = token.match(/^v(\d+(?:\.\d+)?)$/i);
    if (versionMatch) {
      processedTokens.push(`V${versionMatch[1]}`);
      i++;
      continue;
    }

    // Handle R1, K2, M2 etc. (already processed, just keep uppercase)
    if (/^[RKM]\d+$/i.test(token)) {
      processedTokens.push(token.toUpperCase());
      i++;
      continue;
    }

    // Handle standalone numbers (keep as-is)
    if (/^\d+(?:\.\d+)?$/.test(token)) {
      processedTokens.push(token);
      i++;
      continue;
    }

    // Handle 'e' suffix for experts (e.g., "16e" -> "16E")
    const expertMatch = token.match(/^(\d+)e$/i);
    if (expertMatch) {
      processedTokens.push(`${expertMatch[1]}E`);
      i++;
      continue;
    }

    // Handle size with number attached to word (e.g., "qwen2" -> "Qwen 2", "a35b" -> "A35B")
    const brandNumberMatch = token.match(/^([a-zA-Z]+)(\d+(?:\.\d+)?)(b|m)?$/i);
    if (brandNumberMatch) {
      const brandPart = brandNumberMatch[1].toLowerCase();
      const numberPart = brandNumberMatch[2];
      const sizeSuffix = brandNumberMatch[3] ? brandNumberMatch[3].toUpperCase() : '';
      
      // Check if it's a size indicator like "a35b"
      if (sizeSuffix && brandPart.length <= 2) {
        processedTokens.push(`${brandPart.toUpperCase()}${numberPart}${sizeSuffix}`);
      } else if (BRANDS[brandPart]) {
        processedTokens.push(BRANDS[brandPart]);
        processedTokens.push(numberPart + sizeSuffix);
      } else if (PURPOSES[brandPart]) {
        processedTokens.push(PURPOSES[brandPart]);
        processedTokens.push(numberPart + sizeSuffix);
      } else {
        processedTokens.push(titleCase(brandPart));
        processedTokens.push(numberPart + sizeSuffix);
      }
      i++;
      continue;
    }

    // Check brand mappings
    const lowerToken = token.toLowerCase();
    if (BRANDS[lowerToken]) {
      processedTokens.push(BRANDS[lowerToken]);
      i++;
      continue;
    }

    // Check purpose mappings
    if (PURPOSES[lowerToken]) {
      processedTokens.push(PURPOSES[lowerToken]);
      i++;
      continue;
    }

    // Default: title case
    processedTokens.push(titleCase(token));
    i++;
  }

  // Step 6: Join tokens and clean up
  let result = processedTokens.join(' ');
  
  // Clean up multiple spaces
  result = result.replace(/\s+/g, ' ').trim();

  return result || modelId;
}

function titleCase(str) {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export async function fetchModels(baseUrl, apiKey, modelsEndpoint, noAuth = false, providerType = 'generic-chat-completion-api') {
  let url;
  
  // Normalize base URL
  let normalizedBaseUrl = baseUrl.replace(/\/$/, '');
  
  // For OpenAI-compatible APIs, ensure /v1 is in the path if not already
  if (providerType === 'generic-chat-completion-api' || providerType === 'openai') {
    if (!normalizedBaseUrl.endsWith('/v1')) {
      normalizedBaseUrl = `${normalizedBaseUrl}/v1`;
    }
    url = `${normalizedBaseUrl}${modelsEndpoint || '/models'}`;
  } else if (providerType === 'anthropic') {
    // Anthropic-compatible: no /v1 needed, use /v1/models endpoint
    url = `${normalizedBaseUrl}${modelsEndpoint || '/v1/models'}`;
  } else {
    url = `${normalizedBaseUrl}${modelsEndpoint || '/models'}`;
  }
  
  const headers = {
    'Content-Type': 'application/json'
  };
  
  if (!noAuth && apiKey) {
    if (providerType === 'anthropic') {
      headers['x-api-key'] = apiKey;
      headers['anthropic-version'] = '2023-06-01';
    } else {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }
  }

  try {
    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.data && Array.isArray(data.data)) {
      return data.data.map(model => ({
        id: model.id,
        name: model.name || model.id,
        owned_by: model.owned_by || 'unknown'
      }));
    }
    
    if (Array.isArray(data.models)) {
      return data.models.map(model => ({
        id: typeof model === 'string' ? model : model.id || model.name,
        name: typeof model === 'string' ? model : model.name || model.id,
        owned_by: model.owned_by || 'unknown'
      }));
    }
    
    if (Array.isArray(data)) {
      return data.map(model => ({
        id: typeof model === 'string' ? model : model.id || model.name,
        name: typeof model === 'string' ? model : model.name || model.id,
        owned_by: model.owned_by || 'unknown'
      }));
    }
    
    throw new Error('Unexpected response format from models endpoint');
  } catch (error) {
    throw new Error(`Failed to fetch models: ${error.message}`);
  }
}

export function formatModelChoices(models) {
  return models.map(model => ({
    name: `${model.id} (${model.owned_by})`,
    value: model.id
  }));
}
