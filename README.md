# BYOK-CLI

```
  ╔═══════════════════════════════════════════════════════════════╗
  ║                                                               ║
  ║   ██████╗ ██╗   ██╗ ██████╗ ██╗  ██╗      ██████╗██╗     ██╗  ║
  ║   ██╔══██╗╚██╗ ██╔╝██╔═══██╗██║ ██╔╝     ██╔════╝██║     ██║  ║
  ║   ██████╔╝ ╚████╔╝ ██║   ██║█████╔╝      ██║     ██║     ██║  ║
  ║   ██╔══██╗  ╚██╔╝  ██║   ██║██╔═██╗      ██║     ██║     ██║  ║
  ║   ██████╔╝   ██║   ╚██████╔╝██║  ██╗     ╚██████╗███████╗██║  ║
  ║   ╚═════╝    ╚═╝    ╚═════╝ ╚═╝  ╚═╝      ╚═════╝╚══════╝╚═╝  ║
  ║                                                               ║
  ║          Factory CLI - Custom Model Configuration             ║
  ║                                                               ║
  ╚═══════════════════════════════════════════════════════════════╝
```

A CLI tool to configure custom models for [Factory CLI](https://docs.factory.ai/cli/byok/) BYOK (Bring Your Own Key).

## Features

- **13+ Built-in Providers** - OpenRouter, DeepInfra, Fireworks, Groq, Ollama, Google Gemini, Hugging Face, Baseten, Anthropic, OpenAI, and more
- **OpenAI & Anthropic Compatible** - Add any OpenAI-compatible or Anthropic-compatible API endpoint
- **Live Model Search** - Type to filter models, select all matching with one click
- **Multi-select Models** - Add multiple models at once with checkbox or search selection
- **Smart Name Normalization** - Converts `claude-sonnet-4-5-20250929` → `Claude Sonnet 4.5`
- **Provider Saving** - Save providers with API keys for future use
- **Advanced Settings** - Configure temperature, top_p, top_k, penalties, custom headers
- **Go Back Navigation** - Navigate back at any step

## Installation

```bash
npm install -g byok-cli
```

## Usage

```bash
byok-cli
```

### From Source

```bash
git clone https://github.com/Kartvya69/BYOK-CLI.git
cd BYOK-CLI
npm install
npm start
```

## Supported Providers

| Provider | Type | Base URL |
|----------|------|----------|
| OpenAI Compatible | `generic-chat-completion-api` | Custom URL |
| Anthropic Compatible | `anthropic` | Custom URL |
| OpenRouter | `generic-chat-completion-api` | `https://openrouter.ai/api/v1` |
| DeepInfra | `generic-chat-completion-api` | `https://api.deepinfra.com/v1/openai` |
| Fireworks AI | `generic-chat-completion-api` | `https://api.fireworks.ai/inference/v1` |
| Groq | `generic-chat-completion-api` | `https://api.groq.com/openai/v1` |
| Ollama (Local) | `generic-chat-completion-api` | `http://localhost:11434/v1` |
| Google Gemini | `generic-chat-completion-api` | `https://generativelanguage.googleapis.com/v1beta/` |
| Hugging Face | `generic-chat-completion-api` | `https://router.huggingface.co/v1` |
| Baseten | `generic-chat-completion-api` | `https://inference.baseten.co/v1` |
| Anthropic | `anthropic` | `https://api.anthropic.com` |
| OpenAI | `openai` | `https://api.openai.com/v1` |

## Model Name Normalization

The CLI automatically normalizes model names for better readability:

| Original | Normalized |
|----------|------------|
| `claude-sonnet-4-5-20250929` | `Claude Sonnet 4.5` |
| `anthropic/claude-3-opus` | `Claude 3 Opus` |
| `gpt-4-turbo-2024-04-09` | `GPT 4 Turbo` |
| `meta-llama/llama-3-70b-instruct` | `LLaMA 3 70B Instruct` |
| `qwen2.5-coder:32b` | `Qwen 2.5 Coder 32B` |
| `deepseek-r1-distill-llama-70b` | `DeepSeek R1 Distill LLaMA 70B` |
| `Mixtral-8x7B-v0.1` | `Mixtral 8x7B V0.1` |

## Storage Locations

| File | Purpose |
|------|---------|
| `~/.factory/settings.json` | Factory CLI settings (models for Droid) |
| `~/.factory/byok-providers.json` | Saved providers with API keys |
| `~/.factory/byok-models.json` | Local backup of all added models |

## Example Flow

```
? Select a provider: OpenRouter
? Enter your API key: ********
? How would you like to select models? Fetch available models from API
? How would you like to select models? Search and select (type to filter)

? Search model (0 selected) - type to filter: claude
  ← Go Back
> ★ Select all "claude" matches (5)
  anthropic/claude-3-opus (anthropic)
  anthropic/claude-3-sonnet (anthropic)
  ...

✓ Added 5 models matching "claude":
  - anthropic/claude-3-opus
  - anthropic/claude-3-sonnet
  ...

? Max output tokens: 16384
? Do these models support image inputs? No
? Configure advanced settings? No

📋 Generated 5 configuration(s):
1. Claude 3 Opus [OpenRouter]
2. Claude 3 Sonnet [OpenRouter]
...

? Add 5 model(s) to ~/.factory/settings.json? Yes

✅ 5 model configuration(s) saved
📦 Models also saved locally
```

## License

MIT
