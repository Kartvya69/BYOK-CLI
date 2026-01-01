# Getting Started

## Prerequisites

- Node.js 18 or higher
- Factory CLI installed

## Installation

### 1. Install Factory CLI

```bash
curl -fsSL https://app.factory.ai/cli | sh
```

### 2. Install BYOK CLI

```bash
npm install -g byok-cli
```

### 3. Verify Installation

```bash
byok-cli --version
```

## First Run

Simply run:

```bash
byok-cli
```

This will launch the interactive mode where you can:

1. Select a provider (OpenRouter, DeepInfra, Groq, etc.)
2. Enter your API key
3. Fetch and select models
4. Configure settings
5. Save to Factory CLI

## Basic Workflow

```
┌─────────────────┐
│ Select Provider │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Enter API Key  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Fetch Models   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Select Model(s) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│Configure Options│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Save Config    │
└─────────────────┘
```

## Next Steps

- [View supported providers](./providers.md)
- [See examples](./examples.md)
- [Configure advanced settings](./advanced-usage.md)
