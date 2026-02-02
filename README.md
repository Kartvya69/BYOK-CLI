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

A beautiful interactive CLI tool to configure custom models for [Factory CLI](https://docs.factory.ai/cli/byok/) BYOK (Bring Your Own Key).

## Features

- **13+ Built-in Providers** - OpenRouter, DeepInfra, Fireworks, Groq, Ollama, Google Gemini, Hugging Face, Baseten, Anthropic, OpenAI, and more
- **OpenAI & Anthropic Compatible** - Add any OpenAI-compatible or Anthropic-compatible API endpoint
- **Saved Providers** - Save and manage providers with API keys for quick access
- **Live Model Search** - Type to filter models with real-time search
- **Multi-select Models** - Add multiple models at once with Ctrl+A to select all
- **Smart Name Detection** - Fetches display names from [models.dev](https://models.dev) API
- **URL Validation** - Ensures OpenAI-compatible URLs end with `/v1`
- **Step-by-Step Wizard** - Beautiful pink-themed UI with progress indicator
- **Go Back Navigation** - Press ESC to navigate back at any step

## Installation

First, install Factory CLI:
```bash
curl -fsSL https://app.factory.ai/cli | sh
```

Then install BYOK CLI:
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

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Enter` | Continue to next step |
| `ESC` | Go back to previous step |
| `Space` | Toggle model selection |
| `Ctrl+A` | Select all visible models |
| `Ctrl+D` | Deselect all models |
| `Ctrl+K` | Clear search |
| `↑↓` | Navigate list |
| `←→` | Select Yes/No in confirmation |
| `J` | Toggle JSON config preview |

## Supported Providers

| Provider | Type | Base URL |
|----------|------|----------|
| OpenAI Compatible | `generic-chat-completion-api` | Custom URL (must end with `/v1`) |
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

## Storage Locations

| File | Purpose |
|------|---------|
| `~/.factory/settings.json` | Factory CLI settings (models for Droid) |
| `~/.byok-cli/providers.json` | Saved providers with API keys |
| `~/.byok-cli/models.json` | Tracked models with full configuration |

## Screenshots

### Provider Selection
Saved providers appear at the top with a heart icon for quick access:
```
💖 Xreatlabs (saved)
───────────────
⭐ OpenAI Compatible (Custom URL)
⭐ Anthropic Compatible (Custom URL)
⭐ OpenRouter
...
```

### Model Selection
Search and multi-select models with keyboard shortcuts:
```
🔍 Type to search models...
3 of 150 selected (showing 10 of 150)

☑️ Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)
☑️ GPT-4 Turbo (gpt-4-turbo)
☐ Gemini Pro (gemini-pro)
...

Space: toggle • Ctrl+A: select all • Ctrl+D: deselect
```

### Configuration Summary
Review before saving with JSON preview option:
```
📋 Configuration Summary:
╭─────────────────────────────────────────╮
│ 🏢 Provider: Xreatlabs                  │
│ 🔗 Base URL: https://api.xreatlabs.space/v1 │
│ 🤖 Models: Claude Sonnet 4.5, GPT-4     │
│ ⚙️ Max Tokens: 16384                    │
│ ⚙️ Images: Yes                          │
╰─────────────────────────────────────────╯
```

## Changelog

### v2.0.0
- **New:** Saved providers now appear in dropdown for quick selection
- **New:** URL validation requires `/v1` suffix for OpenAI-compatible APIs
- **New:** Navigation hints with arrow indicators
- **New:** Manual model entry now fetches display names from models.dev
- **Fixed:** Models now properly save to `~/.byok-cli/models.json`
- **Fixed:** Settings.json no longer gets reset on first run
- **Fixed:** Navigation after confirmation now works correctly
- **Fixed:** Race conditions in state management
- **Improved:** All state updates use functional patterns for reliability

### v1.0.1
- Bug fixes for model fetching and URL normalization

### v1.0.0
- Initial release

## License

MIT
