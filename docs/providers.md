# Supported Providers

BYOK CLI supports 13+ built-in providers plus custom OpenAI/Anthropic compatible endpoints.

## Built-in Providers

| Provider | Type | Base URL | Auth |
|----------|------|----------|------|
| OpenRouter | `generic-chat-completion-api` | `https://openrouter.ai/api/v1` | API Key |
| DeepInfra | `generic-chat-completion-api` | `https://api.deepinfra.com/v1/openai` | API Key |
| Fireworks AI | `generic-chat-completion-api` | `https://api.fireworks.ai/inference/v1` | API Key |
| Groq | `generic-chat-completion-api` | `https://api.groq.com/openai/v1` | API Key |
| Ollama | `generic-chat-completion-api` | `http://localhost:11434/v1` | None |
| Google Gemini | `generic-chat-completion-api` | `https://generativelanguage.googleapis.com/v1beta/` | API Key |
| Hugging Face | `generic-chat-completion-api` | `https://router.huggingface.co/v1` | API Key |
| Baseten | `generic-chat-completion-api` | `https://inference.baseten.co/v1` | API Key |
| Anthropic | `anthropic` | `https://api.anthropic.com` | API Key |
| OpenAI | `openai` | `https://api.openai.com/v1` | API Key |

## Compatible Providers

### OpenAI Compatible

Any provider that implements the OpenAI API format:

- LM Studio
- LocalAI
- vLLM
- Text Generation Inference
- Any `/v1/chat/completions` endpoint

**Type:** `generic-chat-completion-api`

### Anthropic Compatible

Any provider that implements the Anthropic API format:

- AWS Bedrock (Anthropic models)
- Custom Anthropic proxies

**Type:** `anthropic`

## Getting API Keys

### OpenRouter
1. Go to https://openrouter.ai/keys
2. Create a new API key
3. Copy and use in BYOK CLI

### DeepInfra
1. Go to https://deepinfra.com/dash/api_keys
2. Create a new API key
3. Copy and use in BYOK CLI

### Fireworks AI
1. Go to https://fireworks.ai/api-keys
2. Create a new API key
3. Copy and use in BYOK CLI

### Groq
1. Go to https://console.groq.com/keys
2. Create a new API key
3. Copy and use in BYOK CLI

### Google Gemini
1. Go to https://aistudio.google.com/app/apikey
2. Create a new API key
3. Copy and use in BYOK CLI

### Hugging Face
1. Go to https://huggingface.co/settings/tokens
2. Create a new token with "Read" access
3. Copy and use in BYOK CLI

### Anthropic
1. Go to https://console.anthropic.com/settings/keys
2. Create a new API key
3. Copy and use in BYOK CLI

### OpenAI
1. Go to https://platform.openai.com/api-keys
2. Create a new API key
3. Copy and use in BYOK CLI

## Custom Providers

To add a custom provider:

1. Select "Custom Provider" from the list
2. Enter the base URL (e.g., `https://my-api.example.com/v1`)
3. Select the provider type:
   - `generic-chat-completion-api` for OpenAI-compatible
   - `anthropic` for Anthropic-compatible
4. Enter your API key (or skip if no auth required)
5. Proceed with model selection

### Saving Custom Providers

After configuring a custom provider, you'll be prompted to save it for future use. Saved providers appear at the top of the provider list.

**Storage location:** `~/.factory/byok-providers.json`
