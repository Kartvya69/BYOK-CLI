# Examples

## Example 1: Adding OpenRouter Models

```
$ byok-cli

  ╔═══════════════════════════════════════════════════════════════╗
  ║   ██████╗ ██╗   ██╗ ██████╗ ██╗  ██╗      ██████╗██╗     ██╗  ║
  ║   ██████╔╝ ╚████╔╝ ██║   ██║█████╔╝      ██║     ██║     ██║  ║
  ║   ╚═════╝    ╚═╝    ╚═════╝ ╚═╝  ╚═╝      ╚═════╝╚══════╝╚═╝  ║
  ╚═══════════════════════════════════════════════════════════════╝

? Select a provider: OpenRouter
? Enter your API key: sk-or-v1-****
? How would you like to add models? Fetch available models from API

📡 Fetching available models...

Found 200+ models.

? How would you like to select models? Search and select (type to filter)
? Search model: claude

  ★ Select all "claude" matches (12)
  ❯ anthropic/claude-3-opus
    anthropic/claude-3-sonnet
    anthropic/claude-3-haiku
    anthropic/claude-3.5-sonnet
    ...

✓ Added 4 models

? Max output tokens: 16384
? Do these models support image inputs? Yes
? Configure advanced settings? No

📋 Generated 4 configuration(s):

1. Claude 3 Opus [OpenRouter]
2. Claude 3 Sonnet [OpenRouter]
3. Claude 3 Haiku [OpenRouter]
4. Claude 3.5 Sonnet [OpenRouter]

? Add 4 model(s) to ~/.factory/settings.json? Yes

✅ 4 model configuration(s) saved to ~/.factory/settings.json
📦 Models also saved locally to ~/.factory/byok-models.json

? Save this provider for future use? Yes
? Name for this saved provider: OpenRouter

✅ Provider "OpenRouter" saved for future use.
```

## Example 2: Using Groq for Fast Inference

```
$ byok-cli

? Select a provider: Groq
? Enter your API key: gsk_****
? How would you like to add models? Fetch available models from API

📡 Fetching available models...

Found 15 models.

? How would you like to select models? Checkbox selection
? Select models to add:
  ❯ ◉ llama-3.1-70b-versatile
    ◉ llama-3.1-8b-instant
    ◯ mixtral-8x7b-32768
    ◯ gemma2-9b-it

? Max output tokens: 8192
? Do these models support image inputs? No

📋 Generated 2 configuration(s):

1. LLaMA 3.1 70B Versatile [Groq]
2. LLaMA 3.1 8B Instant [Groq]

? Add 2 model(s) to ~/.factory/settings.json? Yes

✅ 2 model configuration(s) saved
```

## Example 3: Local Ollama Models

```
$ byok-cli

? Select a provider: Ollama (Local)
? How would you like to add models? Fetch available models from API

📡 Fetching available models...

Found 5 models.

? Select models to add:
  ❯ ◉ llama3.2:latest
    ◉ codellama:13b
    ◯ mistral:latest
    ◯ phi3:latest

? Max output tokens: 4096

📋 Generated 2 configuration(s):

1. LLaMA 3.2 [Ollama]
2. CodeLLaMA 13B [Ollama]

✅ 2 model configuration(s) saved
```

## Example 4: Custom Provider (LM Studio)

```
$ byok-cli

? Select a provider: Custom Provider
? Enter the base URL: http://localhost:1234/v1
? Select provider type: OpenAI Compatible (generic-chat-completion-api)
? Does this provider require authentication? No
? How would you like to add models? Enter manually

? Enter the model ID: local-model
? Max output tokens: 4096

📋 Generated configuration:

{
  "model": "local-model",
  "displayName": "Local Model [Custom]",
  "baseUrl": "http://localhost:1234/v1",
  "provider": "generic-chat-completion-api",
  "maxOutputTokens": 4096
}

✅ Configuration saved
```

## Example 5: Adding DeepSeek Models with Advanced Settings

```
$ byok-cli

? Select a provider: DeepInfra
? Enter your API key: ****
? How would you like to add models? Fetch available models from API

📡 Fetching available models...

? Search model: deepseek

  ★ Select all "deepseek" matches (3)
  ❯ deepseek-ai/deepseek-v3
    deepseek-ai/deepseek-r1
    deepseek-ai/deepseek-coder-33b

✓ Added 2 models

? Max output tokens: 32768
? Do these models support image inputs? No
? Configure advanced settings? Yes

? Temperature (0-2, leave empty for default): 0.7
? Top P (0-1, leave empty for default): 0.9
? Top K (leave empty for default): 
? Frequency Penalty (-2 to 2, leave empty for default): 0.1
? Presence Penalty (-2 to 2, leave empty for default): 
? Stop sequences (comma-separated, leave empty for none): 
? Additional extraArgs (JSON format, leave empty for none): 
? Additional extraHeaders (JSON format, leave empty for none): 

📋 Generated 2 configuration(s):

1. DeepSeek V3 [DeepInfra]
   extraArgs: { temperature: 0.7, top_p: 0.9, frequency_penalty: 0.1 }

2. DeepSeek R1 [DeepInfra]
   extraArgs: { temperature: 0.7, top_p: 0.9, frequency_penalty: 0.1 }

✅ 2 model configuration(s) saved
```

## Example 6: Using a Saved Provider

```
$ byok-cli

? Select a provider: 
  ── Saved Providers ──
  ❯ OpenRouter (https://openrouter.ai/api/v1)
    My Custom API (https://api.example.com/v1)
  ── Built-in Providers ──
    OpenAI Compatible
    Anthropic Compatible
    ...

? Select a provider: OpenRouter (saved)

📡 Fetching available models...

Found 200+ models.

? Search model: gpt

✓ Added 3 models matching "gpt"

✅ 3 model configuration(s) saved
```

## Generated Configuration Format

Each model configuration is saved in the following format:

```json
{
  "model": "anthropic/claude-3-opus",
  "displayName": "Claude 3 Opus [OpenRouter]",
  "baseUrl": "https://openrouter.ai/api/v1",
  "apiKey": "sk-or-v1-****",
  "provider": "generic-chat-completion-api",
  "maxOutputTokens": 16384,
  "supportsImages": true,
  "extraArgs": {
    "temperature": 0.7,
    "top_p": 0.9
  }
}
```

## Using Models in Factory CLI

After adding models with BYOK CLI, use them in Factory CLI:

```bash
# List available models
droid /model

# Switch to a custom model
droid /model Claude 3 Opus [OpenRouter]

# Start a conversation
droid "Hello, how are you?"
```
