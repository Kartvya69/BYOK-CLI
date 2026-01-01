# Configuration

## Storage Locations

BYOK CLI stores configuration in the following locations:

| File | Purpose |
|------|---------|
| `~/.factory/settings.json` | Factory CLI settings (models for Droid) |
| `~/.factory/byok-providers.json` | Saved providers with API keys |
| `~/.factory/byok-models.json` | Local backup of all added models |

## Settings File Structure

### ~/.factory/settings.json

```json
{
  "customModels": [
    {
      "model": "anthropic/claude-3-opus",
      "displayName": "Claude 3 Opus [OpenRouter]",
      "baseUrl": "https://openrouter.ai/api/v1",
      "apiKey": "sk-or-v1-****",
      "provider": "generic-chat-completion-api",
      "maxOutputTokens": 16384,
      "supportsImages": true
    },
    {
      "model": "llama-3.1-70b-versatile",
      "displayName": "LLaMA 3.1 70B Versatile [Groq]",
      "baseUrl": "https://api.groq.com/openai/v1",
      "apiKey": "gsk_****",
      "provider": "generic-chat-completion-api",
      "maxOutputTokens": 8192
    }
  ]
}
```

### ~/.factory/byok-providers.json

```json
[
  {
    "name": "OpenRouter",
    "baseUrl": "https://openrouter.ai/api/v1",
    "providerType": "generic-chat-completion-api",
    "apiKey": "sk-or-v1-****",
    "modelsEndpoint": "/models",
    "noAuth": false
  },
  {
    "name": "My Local API",
    "baseUrl": "http://localhost:8000/v1",
    "providerType": "generic-chat-completion-api",
    "apiKey": "",
    "modelsEndpoint": "/models",
    "noAuth": true
  }
]
```

### ~/.factory/byok-models.json

```json
[
  {
    "model": "anthropic/claude-3-opus",
    "displayName": "Claude 3 Opus [OpenRouter]",
    "baseUrl": "https://openrouter.ai/api/v1",
    "apiKey": "sk-or-v1-****",
    "provider": "generic-chat-completion-api",
    "maxOutputTokens": 16384
  }
]
```

## Model Configuration Options

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `model` | string | Yes | The model ID as recognized by the provider |
| `displayName` | string | Yes | Human-readable name shown in Factory CLI |
| `baseUrl` | string | Yes | API endpoint URL |
| `apiKey` | string | No | API key for authentication |
| `provider` | string | Yes | Provider type (see below) |
| `maxOutputTokens` | number | No | Maximum tokens in response (default: 16384) |
| `supportsImages` | boolean | No | Whether model supports image inputs |
| `extraArgs` | object | No | Additional arguments passed to API |
| `extraHeaders` | object | No | Additional HTTP headers |

## Provider Types

| Type | Description |
|------|-------------|
| `generic-chat-completion-api` | OpenAI-compatible API |
| `anthropic` | Anthropic API format |
| `openai` | Native OpenAI API |

## Environment Variables

BYOK CLI respects the following environment variables:

| Variable | Description |
|----------|-------------|
| `OPENAI_API_KEY` | Default OpenAI API key |
| `ANTHROPIC_API_KEY` | Default Anthropic API key |

## Manual Configuration

You can manually edit the configuration files:

```bash
# Edit Factory CLI settings
nano ~/.factory/settings.json

# Edit saved providers
nano ~/.factory/byok-providers.json

# Edit saved models
nano ~/.factory/byok-models.json
```

## Backup and Restore

### Backup

```bash
cp ~/.factory/settings.json ~/.factory/settings.json.backup
cp ~/.factory/byok-providers.json ~/.factory/byok-providers.json.backup
cp ~/.factory/byok-models.json ~/.factory/byok-models.json.backup
```

### Restore

```bash
cp ~/.factory/settings.json.backup ~/.factory/settings.json
cp ~/.factory/byok-providers.json.backup ~/.factory/byok-providers.json
cp ~/.factory/byok-models.json.backup ~/.factory/byok-models.json
```

## Reset Configuration

To reset all BYOK CLI configuration:

```bash
rm ~/.factory/byok-providers.json
rm ~/.factory/byok-models.json
```

To remove all custom models from Factory CLI:

```bash
# Edit settings.json and remove the customModels array
nano ~/.factory/settings.json
```
