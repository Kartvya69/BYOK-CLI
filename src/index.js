#!/usr/bin/env node

import { Command } from 'commander';
import inquirer from 'inquirer';
import autocompletePrompt from 'inquirer-autocomplete-prompt';
import { PROVIDERS, PROVIDER_TYPES, getProviderChoices } from './providers.js';
import { fetchModels, formatModelChoices, normalizeModelName } from './fetcher.js';
import { generateModelConfig, addModelToSettings, getSettingsPath, saveProvider, readSavedProviders, saveModels, getSavedModelsPath } from './config.js';

inquirer.registerPrompt('autocomplete', autocompletePrompt);

const program = new Command();

program
  .name('byok-cli')
  .description('Configure custom models for Factory CLI BYOK')
  .version('1.0.0');

program
  .command('add')
  .description('Add a new custom model configuration')
  .action(addModel);

program
  .command('interactive')
  .description('Interactive mode to configure a custom model')
  .action(addModel);

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  addModel();
}

function printTitle() {
  console.log('\n');
  console.log('  ╔═══════════════════════════════════════════════════════════════╗');
  console.log('  ║                                                               ║');
  console.log('  ║   ██████╗ ██╗   ██╗ ██████╗ ██╗  ██╗      ██████╗██╗     ██╗  ║');
  console.log('  ║   ██╔══██╗╚██╗ ██╔╝██╔═══██╗██║ ██╔╝     ██╔════╝██║     ██║  ║');
  console.log('  ║   ██████╔╝ ╚████╔╝ ██║   ██║█████╔╝      ██║     ██║     ██║  ║');
  console.log('  ║   ██╔══██╗  ╚██╔╝  ██║   ██║██╔═██╗      ██║     ██║     ██║  ║');
  console.log('  ║   ██████╔╝   ██║   ╚██████╔╝██║  ██╗     ╚██████╗███████╗██║  ║');
  console.log('  ║   ╚═════╝    ╚═╝    ╚═════╝ ╚═╝  ╚═╝      ╚═════╝╚══════╝╚═╝  ║');
  console.log('  ║                                                               ║');
  console.log('  ║          Factory CLI - Custom Model Configuration             ║');
  console.log('  ║                                                               ║');
  console.log('  ╚═══════════════════════════════════════════════════════════════╝');
  console.log('\n');
}

const BACK_OPTION = { name: '← Go Back', value: '__BACK__' };

async function addModel() {
  printTitle();

  try {
    // Step 1: Provider Selection
    let provider, providerKey, baseUrl, providerType, apiKey, providerName;
    
    while (true) {
      const savedProviders = await readSavedProviders();
      const builtInChoices = getProviderChoices();
      
      let allChoices = [];
      
      if (savedProviders.length > 0) {
        allChoices = [
          new inquirer.Separator('── Saved Providers ──'),
          ...savedProviders.map(p => ({
            name: `${p.name} (saved)`,
            value: { type: 'saved', provider: p }
          })),
          new inquirer.Separator('── Built-in Providers ──'),
          ...builtInChoices.map(c => ({
            name: c.name,
            value: { type: 'builtin', key: c.value }
          }))
        ];
      } else {
        allChoices = builtInChoices.map(c => ({
          name: c.name,
          value: { type: 'builtin', key: c.value }
        }));
      }

      const { providerSelection } = await inquirer.prompt([
        {
          type: 'list',
          name: 'providerSelection',
          message: 'Select a provider:',
          choices: allChoices
        }
      ]);

      if (providerSelection.type === 'saved') {
        const savedProvider = providerSelection.provider;
        providerName = savedProvider.name;
        baseUrl = savedProvider.baseUrl;
        providerType = savedProvider.providerType;
        apiKey = savedProvider.apiKey;
        provider = { 
          name: savedProvider.name, 
          modelsEndpoint: savedProvider.modelsEndpoint || '/models',
          noAuth: savedProvider.noAuth || false
        };
        providerKey = 'saved';
      } else {
        providerKey = providerSelection.key;
        provider = PROVIDERS[providerKey];
        providerName = provider.name;
        baseUrl = provider.baseUrl;
        providerType = provider.type;

        if (provider.requiresBaseUrl || providerKey === 'custom') {
          const prompts = [
            {
              type: 'input',
              name: 'baseUrl',
              message: 'Enter the base URL (or "back" to go back):',
              validate: input => {
                if (input.toLowerCase() === 'back') return true;
                return input.startsWith('http') ? true : 'Must be a valid URL';
              }
            }
          ];
          
          if (providerKey === 'custom') {
            prompts.push({
              type: 'list',
              name: 'providerType',
              message: 'Select API compatibility:',
              choices: PROVIDER_TYPES
            });
          }
          
          const customAnswers = await inquirer.prompt(prompts);
          if (customAnswers.baseUrl.toLowerCase() === 'back') {
            continue;
          }
          baseUrl = customAnswers.baseUrl;
          if (customAnswers.providerType) {
            providerType = customAnswers.providerType;
          }
        }

        const apiKeyAnswer = await inquirer.prompt([
          {
            type: 'password',
            name: 'apiKey',
            message: 'Enter your API key (or "back" to go back):',
            mask: '*',
            validate: input => {
              if (input.toLowerCase() === 'back') return true;
              if (provider.noAuth) return true;
              return input.length > 0 ? true : 'API key is required';
            },
            default: provider.noAuth ? 'not-needed' : undefined
          }
        ]);
        if (apiKeyAnswer.apiKey.toLowerCase() === 'back') {
          continue;
        }
        apiKey = apiKeyAnswer.apiKey;
      }
      break;
    }

    // Step 2: Model Selection
    let selectedModels = [];
    
    modelSelection: while (true) {
      const { modelSource } = await inquirer.prompt([
        {
          type: 'list',
          name: 'modelSource',
          message: 'How would you like to select models?',
          choices: [
            { name: 'Fetch available models from API', value: 'fetch' },
            { name: 'Enter model ID manually', value: 'manual' },
            BACK_OPTION
          ]
        }
      ]);

      if (modelSource === '__BACK__') {
        return addModel(); // Restart
      }

      selectedModels = [];

      if (modelSource === 'fetch') {
        if (!provider.modelsEndpoint && providerKey !== 'custom' && !provider.requiresBaseUrl) {
          console.log('\n⚠️  This provider does not support model listing. Switching to manual entry.\n');
          const { manualModel } = await inquirer.prompt([
            {
              type: 'input',
              name: 'manualModel',
              message: 'Enter the model ID:',
              validate: input => input.length > 0 ? true : 'Model ID is required'
            }
          ]);
          selectedModels = [manualModel];
        } else {
          console.log('\n📡 Fetching available models...\n');
          try {
            let models = await fetchModels(baseUrl, apiKey, provider.modelsEndpoint, provider.noAuth, providerType);
            
            // If no models found and using anthropic type, try generic-chat-completion-api
            if (models.length === 0 && providerType === 'anthropic') {
              console.log('Trying OpenAI-compatible endpoint...\n');
              models = await fetchModels(baseUrl, apiKey, provider.modelsEndpoint, provider.noAuth, 'generic-chat-completion-api');
            }
            
            // If still no models and using generic type, try without /v1
            if (models.length === 0 && providerType === 'generic-chat-completion-api') {
              try {
                models = await fetchModels(baseUrl, apiKey, '/models', provider.noAuth, 'anthropic');
              } catch (e) {
                // Ignore fallback errors
              }
            }
            
            if (models.length === 0) {
              console.log('No models found. Please enter manually.\n');
              const { manualModel } = await inquirer.prompt([
                {
                  type: 'input',
                  name: 'manualModel',
                  message: 'Enter the model ID:',
                  validate: input => input.length > 0 ? true : 'Model ID is required'
                }
              ]);
              selectedModels = [manualModel];
            } else {
              console.log(`Found ${models.length} models.\n`);
              
              const modelChoices = formatModelChoices(models);
              
              const { selectionMode } = await inquirer.prompt([
                {
                  type: 'list',
                  name: 'selectionMode',
                  message: 'How would you like to select models?',
                  choices: [
                    { name: 'Search and select (type to filter)', value: 'search' },
                    { name: 'Browse full list (checkbox)', value: 'checkbox' },
                    BACK_OPTION
                  ]
                }
              ]);

              if (selectionMode === '__BACK__') {
                continue modelSelection;
              }

              if (selectionMode === 'search') {
                let continueSelecting = true;
                let currentSearchTerm = '';
                
                while (continueSelecting) {
                  const availableChoices = modelChoices.filter(choice => !selectedModels.includes(choice.value));
                  
                  const { selectedModel } = await inquirer.prompt([
                    {
                      type: 'autocomplete',
                      name: 'selectedModel',
                      message: `Search model (${selectedModels.length} selected) - type to filter:`,
                      source: (answersSoFar, input) => {
                        currentSearchTerm = (input || '').toLowerCase();
                        const filtered = availableChoices.filter(choice => 
                          choice.name.toLowerCase().includes(currentSearchTerm)
                        );
                        
                        const results = [
                          BACK_OPTION,
                          ...(currentSearchTerm && filtered.length > 0 
                            ? [{ name: `★ Select all "${currentSearchTerm}" matches (${filtered.length})`, value: '__SELECT_ALL__' }]
                            : []),
                          ...filtered.slice(0, 20)
                        ];
                        return Promise.resolve(results);
                      },
                      pageSize: 17
                    }
                  ]);
                  
                  if (selectedModel === '__BACK__') {
                    if (selectedModels.length === 0) {
                      continue modelSelection;
                    }
                    const removed = selectedModels.pop();
                    console.log(`  ↩ Removed: ${removed}`);
                    continue;
                  }
                  
                  if (selectedModel === '__SELECT_ALL__') {
                    const matchingModels = availableChoices
                      .filter(choice => choice.name.toLowerCase().includes(currentSearchTerm))
                      .map(choice => choice.value);
                    
                    selectedModels.push(...matchingModels);
                    console.log(`  ✓ Added ${matchingModels.length} models matching "${currentSearchTerm}":`);
                    matchingModels.forEach(m => console.log(`    - ${m}`));
                  } else {
                    selectedModels.push(selectedModel);
                    console.log(`  ✓ Added: ${selectedModel}`);
                  }
                  
                  const { nextAction } = await inquirer.prompt([
                    {
                      type: 'list',
                      name: 'nextAction',
                      message: `${selectedModels.length} model(s) selected. What next?`,
                      choices: [
                        { name: 'Add more models', value: 'add' },
                        { name: 'Done selecting', value: 'done' },
                        { name: 'Remove last selection', value: 'undo' },
                        { name: 'Clear all selections', value: 'clear' }
                      ]
                    }
                  ]);
                  
                  if (nextAction === 'done') {
                    continueSelecting = false;
                  } else if (nextAction === 'undo') {
                    const removed = selectedModels.pop();
                    if (removed) console.log(`  ↩ Removed: ${removed}`);
                  } else if (nextAction === 'clear') {
                    selectedModels = [];
                    console.log('  ↩ Cleared all selections');
                  }
                }
              } else {
                const { chosenModels } = await inquirer.prompt([
                  {
                    type: 'checkbox',
                    name: 'chosenModels',
                    message: 'Select models to add:',
                    choices: modelChoices,
                    pageSize: 20,
                    validate: input => input.length > 0 ? true : 'Select at least one model'
                  }
                ]);
                selectedModels = chosenModels;
              }
            }
          } catch (error) {
            console.log(`\n⚠️  Failed to fetch models: ${error.message}`);
            console.log('Switching to manual entry.\n');
            const { manualModel } = await inquirer.prompt([
              {
                type: 'input',
                name: 'manualModel',
                message: 'Enter the model ID:',
                validate: input => input.length > 0 ? true : 'Model ID is required'
              }
            ]);
            selectedModels = [manualModel];
          }
        }
      } else {
        const { manualModel } = await inquirer.prompt([
          {
            type: 'input',
            name: 'manualModel',
            message: 'Enter the model ID:',
            validate: input => input.length > 0 ? true : 'Model ID is required'
          }
        ]);
        selectedModels = [manualModel];
      }
      
      if (selectedModels.length > 0) {
        break;
      }
    }

    // Step 3: Use provider name as display title
    const displayTitle = providerName;

    // Step 4: Model settings
    const { maxOutputTokens, supportsImages, configureAdvanced } = await inquirer.prompt([
      {
        type: 'number',
        name: 'maxOutputTokens',
        message: 'Max output tokens (applies to all selected models):',
        default: 16384
      },
      {
        type: 'confirm',
        name: 'supportsImages',
        message: 'Do these models support image inputs?',
        default: false
      },
      {
        type: 'confirm',
        name: 'configureAdvanced',
        message: 'Configure advanced settings (temperature, top_p, headers, etc.)?',
        default: false
      }
    ]);

    let extraArgs = {};
    let extraHeaders = {};

    if (configureAdvanced) {
      console.log('\n⚙️  Advanced Settings (leave blank to skip)\n');
      
      const advancedAnswers = await inquirer.prompt([
        {
          type: 'input',
          name: 'temperature',
          message: 'Temperature (0.0 - 2.0):',
          validate: input => {
            if (input === '') return true;
            const num = parseFloat(input);
            return (!isNaN(num) && num >= 0 && num <= 2) ? true : 'Must be a number between 0 and 2';
          }
        },
        {
          type: 'input',
          name: 'topP',
          message: 'Top P (0.0 - 1.0):',
          validate: input => {
            if (input === '') return true;
            const num = parseFloat(input);
            return (!isNaN(num) && num >= 0 && num <= 1) ? true : 'Must be a number between 0 and 1';
          }
        },
        {
          type: 'input',
          name: 'topK',
          message: 'Top K (integer, e.g., 40):',
          validate: input => {
            if (input === '') return true;
            const num = parseInt(input);
            return (!isNaN(num) && num > 0) ? true : 'Must be a positive integer';
          }
        },
        {
          type: 'input',
          name: 'frequencyPenalty',
          message: 'Frequency penalty (-2.0 - 2.0):',
          validate: input => {
            if (input === '') return true;
            const num = parseFloat(input);
            return (!isNaN(num) && num >= -2 && num <= 2) ? true : 'Must be a number between -2 and 2';
          }
        },
        {
          type: 'input',
          name: 'presencePenalty',
          message: 'Presence penalty (-2.0 - 2.0):',
          validate: input => {
            if (input === '') return true;
            const num = parseFloat(input);
            return (!isNaN(num) && num >= -2 && num <= 2) ? true : 'Must be a number between -2 and 2';
          }
        },
        {
          type: 'input',
          name: 'stopSequences',
          message: 'Stop sequences (comma-separated):',
        },
        {
          type: 'confirm',
          name: 'addCustomArgs',
          message: 'Add custom extraArgs (JSON key-value pairs)?',
          default: false
        }
      ]);

      if (advancedAnswers.temperature !== '') {
        extraArgs.temperature = parseFloat(advancedAnswers.temperature);
      }
      if (advancedAnswers.topP !== '') {
        extraArgs.top_p = parseFloat(advancedAnswers.topP);
      }
      if (advancedAnswers.topK !== '') {
        extraArgs.top_k = parseInt(advancedAnswers.topK);
      }
      if (advancedAnswers.frequencyPenalty !== '') {
        extraArgs.frequency_penalty = parseFloat(advancedAnswers.frequencyPenalty);
      }
      if (advancedAnswers.presencePenalty !== '') {
        extraArgs.presence_penalty = parseFloat(advancedAnswers.presencePenalty);
      }
      if (advancedAnswers.stopSequences !== '') {
        extraArgs.stop = advancedAnswers.stopSequences.split(',').map(s => s.trim());
      }

      if (advancedAnswers.addCustomArgs) {
        const { customArgsJson } = await inquirer.prompt([
          {
            type: 'input',
            name: 'customArgsJson',
            message: 'Enter custom extraArgs as JSON (e.g., {"seed": 42}):',
            validate: input => {
              if (input === '') return true;
              try {
                JSON.parse(input);
                return true;
              } catch {
                return 'Invalid JSON format';
              }
            }
          }
        ]);
        if (customArgsJson !== '') {
          extraArgs = { ...extraArgs, ...JSON.parse(customArgsJson) };
        }
      }

      const { addHeaders } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'addHeaders',
          message: 'Add custom HTTP headers?',
          default: false
        }
      ]);

      if (addHeaders) {
        const { headersJson } = await inquirer.prompt([
          {
            type: 'input',
            name: 'headersJson',
            message: 'Enter headers as JSON (e.g., {"X-Custom-Header": "value"}):',
            validate: input => {
              if (input === '') return true;
              try {
                JSON.parse(input);
                return true;
              } catch {
                return 'Invalid JSON format';
              }
            }
          }
        ]);
        if (headersJson !== '') {
          extraHeaders = JSON.parse(headersJson);
        }
      }
    }

    const modelConfigs = selectedModels.map(modelId => {
      const normalizedName = normalizeModelName(modelId);
      const displayName = `${normalizedName} [${displayTitle}]`;
      return generateModelConfig({
        model: modelId,
        displayName,
        baseUrl,
        apiKey,
        provider: providerType,
        maxOutputTokens,
        supportsImages,
        extraArgs: Object.keys(extraArgs).length > 0 ? extraArgs : undefined,
        extraHeaders: Object.keys(extraHeaders).length > 0 ? extraHeaders : undefined
      });
    });

    console.log(`\n📋 Generated ${modelConfigs.length} configuration(s):\n`);
    modelConfigs.forEach((config, i) => {
      console.log(`${i + 1}. ${config.displayName}`);
    });
    console.log('\nFull config preview:');
    console.log(JSON.stringify(modelConfigs, null, 2));

    const { confirmSave } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirmSave',
        message: `Add ${modelConfigs.length} model(s) to ${getSettingsPath()}?`,
        default: true
      }
    ]);

    if (confirmSave) {
      for (const config of modelConfigs) {
        await addModelToSettings(config);
      }
      console.log(`\n✅ ${modelConfigs.length} model configuration(s) saved to ${getSettingsPath()}`);
      console.log('Use /model command in Factory CLI to switch to these models.\n');

      // Save models locally to byok-models.json
      await saveModels(modelConfigs);
      console.log(`📦 Models also saved locally to ${getSavedModelsPath()}`);

      if (providerKey !== 'saved') {
        const { saveProviderChoice } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'saveProviderChoice',
            message: 'Save this provider for future use? (API key will be stored locally)',
            default: true
          }
        ]);

        if (saveProviderChoice) {
          const { providerSaveName } = await inquirer.prompt([
            {
              type: 'input',
              name: 'providerSaveName',
              message: 'Name for this saved provider:',
              default: providerName
            }
          ]);

          await saveProvider({
            name: providerSaveName,
            baseUrl,
            providerType,
            apiKey,
            modelsEndpoint: provider.modelsEndpoint || '/models',
            noAuth: provider.noAuth || false
          });
          console.log(`\n✅ Provider "${providerSaveName}" saved for future use.`);
        }
      }
    } else {
      console.log('\n❌ Configuration not saved.\n');
      console.log('You can manually add the above JSON to your settings.json file.\n');
    }

  } catch (error) {
    if (error.name === 'ExitPromptError') {
      console.log('\n👋 Cancelled.\n');
      process.exit(0);
    }
    console.error(`\n❌ Error: ${error.message}\n`);
    process.exit(1);
  }
}
