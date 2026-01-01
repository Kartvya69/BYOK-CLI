# Advanced Usage

## Advanced Settings

When adding models, you can configure advanced settings:

### Temperature

Controls randomness in responses.

- **Range:** 0 to 2
- **Default:** Model-dependent (usually 1)
- **Lower values:** More focused, deterministic
- **Higher values:** More creative, random

```
? Temperature (0-2, leave empty for default): 0.7
```

### Top P (Nucleus Sampling)

Controls diversity via nucleus sampling.

- **Range:** 0 to 1
- **Default:** 1
- **Lower values:** More focused on likely tokens
- **Higher values:** More diverse outputs

```
? Top P (0-1, leave empty for default): 0.9
```

### Top K

Limits vocabulary to top K tokens.

- **Range:** 1 to vocabulary size
- **Default:** Model-dependent
- **Lower values:** More focused
- **Higher values:** More diverse

```
? Top K (leave empty for default): 40
```

### Frequency Penalty

Reduces repetition of tokens based on frequency.

- **Range:** -2 to 2
- **Default:** 0
- **Positive values:** Reduce repetition
- **Negative values:** Increase repetition

```
? Frequency Penalty (-2 to 2, leave empty for default): 0.5
```

### Presence Penalty

Reduces repetition of topics.

- **Range:** -2 to 2
- **Default:** 0
- **Positive values:** Encourage new topics
- **Negative values:** Stay on topic

```
? Presence Penalty (-2 to 2, leave empty for default): 0.3
```

### Stop Sequences

Sequences that stop generation.

```
? Stop sequences (comma-separated, leave empty for none): ###,END,<|endoftext|>
```

### Extra Arguments

Additional JSON arguments passed to the API.

```
? Additional extraArgs (JSON format, leave empty for none): {"seed": 42, "repetition_penalty": 1.1}
```

### Extra Headers

Additional HTTP headers for requests.

```
? Additional extraHeaders (JSON format, leave empty for none): {"X-Custom-Header": "value"}
```

## Model Name Normalization

BYOK CLI automatically normalizes model names for better readability:

### Brand Mappings

| Input | Output |
|-------|--------|
| `gpt` | `GPT` |
| `llama` | `LLaMA` |
| `claude` | `Claude` |
| `gemini` | `Gemini` |
| `qwen` | `Qwen` |
| `mistral` | `Mistral` |
| `mixtral` | `Mixtral` |
| `deepseek` | `DeepSeek` |
| `phi` | `Phi` |
| `codellama` | `CodeLLaMA` |

### Purpose Mappings

| Input | Output |
|-------|--------|
| `instruct` | `Instruct` |
| `chat` | `Chat` |
| `coder` | `Coder` |
| `vision` | `Vision` |
| `turbo` | `Turbo` |
| `preview` | `Preview` |
| `pro` | `Pro` |
| `flash` | `Flash` |

### Examples

| Original | Normalized |
|----------|------------|
| `claude-sonnet-4-5-20250929` | `Claude Sonnet 4.5` |
| `meta-llama/llama-3-70b-instruct` | `LLaMA 3 70B Instruct` |
| `gpt-4-turbo-2024-04-09` | `GPT 4 Turbo` |
| `deepseek-r1-distill-llama-70b` | `DeepSeek R1 Distill LLaMA 70B` |
| `qwen2.5-coder:32b` | `Qwen 2.5 Coder 32B` |

## Search and Selection

### Live Search

Type to filter models in real-time:

```
? Search model: claude
  ← Go Back
  ★ Select all "claude" matches (5)
  anthropic/claude-3-opus
  anthropic/claude-3-sonnet
  anthropic/claude-3-haiku
  anthropic/claude-3.5-sonnet
  anthropic/claude-3.5-haiku
```

### Select All Matching

Press Enter on "★ Select all matches" to add all filtered models at once.

### Checkbox Selection

Use space to toggle selection, Enter to confirm:

```
? Select models to add:
  ◉ model-1
  ◯ model-2
  ◉ model-3
```

## Navigation

### Go Back

Type "back" or select "← Go Back" to return to the previous step.

### Cancel

Press `Ctrl+C` at any time to cancel and exit.

## Batch Operations

### Adding Multiple Models

1. Use search to filter models
2. Select "★ Select all matches"
3. All matching models are added at once

### Multiple Providers

Run BYOK CLI multiple times to add models from different providers. Each run appends to your existing configuration.

## API Fallback

BYOK CLI automatically handles API compatibility:

1. First tries the configured provider type
2. If that fails, tries alternative endpoints
3. Falls back to manual entry if all else fails

Example: If a provider is saved as `anthropic` but actually uses OpenAI format, BYOK CLI will automatically try `generic-chat-completion-api`.

## Debugging

### View Current Configuration

```bash
cat ~/.factory/settings.json | jq '.customModels'
```

### View Saved Providers

```bash
cat ~/.factory/byok-providers.json | jq
```

### Test API Connection

```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
     https://api.provider.com/v1/models
```

## Integration with Factory CLI

After adding models:

```bash
# List all models including custom ones
droid /model

# Use a specific custom model
droid /model "Claude 3 Opus [OpenRouter]"

# Start coding with custom model
droid "Help me write a Python script"
```
