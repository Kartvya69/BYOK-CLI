# Troubleshooting

## Common Issues

### "Failed to fetch models" Error

**Cause:** The API endpoint is unreachable or returns an error.

**Solutions:**
1. Check your internet connection
2. Verify the base URL is correct
3. Ensure your API key is valid
4. Check if the provider's API is down

```bash
# Test API connection manually
curl -H "Authorization: Bearer YOUR_API_KEY" \
     https://api.provider.com/v1/models
```

### "HTTP 401: Unauthorized"

**Cause:** Invalid or missing API key.

**Solutions:**
1. Double-check your API key
2. Ensure the key has the correct permissions
3. Check if the key has expired
4. Regenerate a new API key

### "HTTP 404: Not Found"

**Cause:** The models endpoint doesn't exist or uses a different path.

**Solutions:**
1. BYOK CLI will automatically try fallback endpoints
2. Try selecting a different provider type
3. Enter the model ID manually

### "HTTP 429: Too Many Requests"

**Cause:** Rate limit exceeded.

**Solutions:**
1. Wait a few minutes and try again
2. Check your provider's rate limits
3. Upgrade your API plan if needed

### Models Not Showing in Factory CLI

**Cause:** Configuration not saved correctly.

**Solutions:**
1. Check if settings.json exists:
   ```bash
   cat ~/.factory/settings.json
   ```
2. Verify the customModels array contains your models
3. Restart Factory CLI

### "Command not found: byok-cli"

**Cause:** npm global bin not in PATH.

**Solutions:**
1. Check npm global bin location:
   ```bash
   npm bin -g
   ```
2. Add to PATH:
   ```bash
   export PATH="$(npm bin -g):$PATH"
   ```
3. Or run directly:
   ```bash
   npx byok-cli
   ```

### Provider Type Mismatch

**Cause:** Provider saved with wrong type (e.g., `anthropic` instead of `generic-chat-completion-api`).

**Solutions:**
1. BYOK CLI automatically tries fallback types
2. Delete and re-add the provider:
   ```bash
   # Edit saved providers
   nano ~/.factory/byok-providers.json
   ```
3. Change `providerType` to the correct value

### Ollama Connection Refused

**Cause:** Ollama server not running.

**Solutions:**
1. Start Ollama:
   ```bash
   ollama serve
   ```
2. Check if Ollama is running:
   ```bash
   curl http://localhost:11434/v1/models
   ```
3. Verify the port (default: 11434)

### JSON Parse Error

**Cause:** Corrupted configuration file.

**Solutions:**
1. Validate JSON:
   ```bash
   cat ~/.factory/settings.json | jq .
   ```
2. Fix or delete the corrupted file:
   ```bash
   rm ~/.factory/settings.json
   ```
3. Re-run BYOK CLI to recreate

### Model Names Not Normalizing

**Cause:** Unknown brand or format.

**Solutions:**
1. This is cosmetic only - the model will still work
2. The original model ID is preserved in the config
3. Report the issue on GitHub for future support

## Debug Mode

To see more detailed output, check the raw API response:

```bash
# Test model fetching
curl -s -H "Authorization: Bearer YOUR_KEY" \
     https://api.provider.com/v1/models | jq '.data[].id'
```

## Reset Everything

To start fresh:

```bash
# Remove all BYOK CLI data
rm ~/.factory/byok-providers.json
rm ~/.factory/byok-models.json

# Remove custom models from Factory CLI
# Edit settings.json and remove customModels array
nano ~/.factory/settings.json
```

## Getting Help

1. Check the [GitHub Issues](https://github.com/Kartvya69/BYOK-CLI/issues)
2. Open a new issue with:
   - BYOK CLI version (`byok-cli --version`)
   - Node.js version (`node --version`)
   - Error message
   - Steps to reproduce

## FAQ

### Q: Can I use multiple providers?

**A:** Yes! Run BYOK CLI multiple times to add models from different providers. Each run appends to your existing configuration.

### Q: Are my API keys stored securely?

**A:** API keys are stored in plain text in `~/.factory/settings.json` and `~/.factory/byok-providers.json`. Ensure these files have appropriate permissions:
```bash
chmod 600 ~/.factory/settings.json
chmod 600 ~/.factory/byok-providers.json
```

### Q: Can I edit configurations manually?

**A:** Yes! All configuration files are JSON and can be edited with any text editor.

### Q: How do I remove a model?

**A:** Edit `~/.factory/settings.json` and remove the model from the `customModels` array.

### Q: Does BYOK CLI work offline?

**A:** You can add models manually without fetching from an API, but you'll need to know the exact model IDs.
