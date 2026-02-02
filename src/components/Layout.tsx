import React, { useState, useEffect } from 'react';
import { Box, Text, useStdout } from 'ink';
import { colors, emojis, steps, borders } from '../theme.js';
import type { AppState } from '../types.js';

interface LayoutProps {
  children: React.ReactNode;
  currentStep: string;
  state: AppState;
  showHistory?: boolean;
}

export function Layout({ children, currentStep, state, showHistory = true }: LayoutProps) {
  const { stdout } = useStdout();
  const [columns, setColumns] = useState(stdout.columns);
  const currentStepIndex = steps.findIndex(s => s.id === currentStep);
  const isWide = columns >= 80;
  
  useEffect(() => {
    const handleResize = () => setColumns(stdout.columns);
    stdout.on('resize', handleResize);
    return () => {
      stdout.off('resize', handleResize);
    };
  }, [stdout]);
  
  return (
    <Box flexDirection="column" padding={1}>
      {/* Logo Header */}
      <Logo isWide={isWide} />
      
      {/* Step Indicator */}
      {isWide ? (
        <WideStepIndicator currentStep={currentStep} />
      ) : (
        <NarrowStepIndicator currentStep={currentStep} />
      )}
      
      {/* Main Content */}
      <Box flexDirection="column" marginTop={1} marginBottom={1}>
        {children}
      </Box>
      
      {/* History / Previous Entries */}
      {showHistory && <History state={state} currentStep={currentStep} isWide={isWide} />}
      
      {/* Footer with navigation hints */}
      <Box marginTop={1}>
        <Text color={colors.dimGray} dimColor>
          → Enter to continue • ← ESC to go back • Step {currentStepIndex + 1} of {steps.length}
        </Text>
      </Box>
    </Box>
  );
}

function Logo({ isWide }: { isWide: boolean }) {
  if (isWide) {
    return (
      <Box flexDirection="column" alignItems="center" marginBottom={1}>
        <Text color={colors.hotPink} bold>
          {'╭───────────────────────────────────────────────────────────────╮'}
        </Text>
        <Text color={colors.hotPink} bold>
          {'│  ██████╗ ██╗   ██╗ ██████╗ ██╗  ██╗      ██████╗██╗     ██╗  │'}
        </Text>
        <Text color={colors.hotPink} bold>
          {'│  ██╔══██╗╚██╗ ██╔╝██╔═══██╗██║ ██╔╝     ██╔════╝██║     ██║  │'}
        </Text>
        <Text color={colors.lightPink} bold>
          {'│  ██████╔╝ ╚████╔╝ ██║   ██║█████╔╝      ██║     ██║     ██║  │'}
        </Text>
        <Text color={colors.lightPink} bold>
          {'│  ██╔══██╗  ╚██╔╝  ██║   ██║██╔═██╗      ██║     ██║     ██║  │'}
        </Text>
        <Text color={colors.pastelPink}>
          {'│  ██████╔╝   ██║   ╚██████╔╝██║  ██╗     ╚██████╗███████╗██║  │'}
        </Text>
        <Text color={colors.pastelPink}>
          {'│  ╚═════╝    ╚═╝    ╚═════╝ ╚═╝  ╚═╝      ╚═════╝╚══════╝╚═╝  │'}
        </Text>
        <Text color={colors.mistyRose}>
          {'│                                                               │'}
        </Text>
        <Text color={colors.white} backgroundColor={colors.hotPink} bold>
          {'│          Factory CLI - Custom Model Configuration             │'}
        </Text>
        <Text color={colors.hotPink} bold>
          {'╰───────────────────────────────────────────────────────────────╯'}
        </Text>
      </Box>
    );
  }

  // Compact logo for narrow terminals
  return (
    <Box flexDirection="column" alignItems="center" marginBottom={1}>
      <Text color={colors.hotPink} bold>
        {'╭──────────────────────────────╮'}
      </Text>
      <Text color={colors.hotPink} bold>
        {'│  BYOK CLI - Model Config     │'}
      </Text>
      <Text color={colors.lightPink}>
        {'│  Custom AI Model Setup       │'}
      </Text>
      <Text color={colors.hotPink} bold>
        {'╰──────────────────────────────╯'}
      </Text>
    </Box>
  );
}

function WideStepIndicator({ currentStep }: { currentStep: string }) {
  const currentIndex = steps.findIndex(s => s.id === currentStep);
  
  return (
    <Box flexDirection="column" marginBottom={1}>
      <Box flexDirection="row" justifyContent="center">
        <Text color={colors.lightPink}>
          {borders.rounded.topLeft}{borders.rounded.horizontal.repeat(68)}{borders.rounded.topRight}
        </Text>
      </Box>
      <Box flexDirection="row" justifyContent="center" paddingX={1}>
        <Text color={colors.mistyRose}>Step {currentIndex + 1} of {steps.length}: </Text>
        {steps.map((step, index) => {
          const isActive = index === currentIndex;
          const isCompleted = index < currentIndex;
          
          if (isActive) {
            return (
              <Text key={step.id} color={colors.white} backgroundColor={colors.hotPink} bold>
                {step.emoji} {step.label}
              </Text>
            );
          } else if (isCompleted) {
            return (
              <Text key={step.id} color={colors.success}>
                {emojis.check} {step.label}
              </Text>
            );
          } else {
            return (
              <Text key={step.id} color={colors.dimGray} dimColor>
                {step.emoji} {step.label}
              </Text>
            );
          }
        }).reduce((prev, curr, i) => (
          <>{prev}<Text color={colors.lightPink}> → </Text>{curr}</>
        ))}
      </Box>
      <Box flexDirection="row" justifyContent="center">
        <Text color={colors.lightPink}>
          {borders.rounded.bottomLeft}{borders.rounded.horizontal.repeat(68)}{borders.rounded.bottomRight}
        </Text>
      </Box>
    </Box>
  );
}

function NarrowStepIndicator({ currentStep }: { currentStep: string }) {
  const currentIndex = steps.findIndex(s => s.id === currentStep);
  
  return (
    <Box flexDirection="column" marginBottom={1} borderStyle="round" borderColor={colors.lightPink} paddingX={1}>
      <Text color={colors.mistyRose} bold>Step {currentIndex + 1} of {steps.length}</Text>
      {steps.map((step, index) => {
        const isActive = index === currentIndex;
        const isCompleted = index < currentIndex;
        
        if (isActive) {
          return (
            <Text key={step.id} color={colors.white} backgroundColor={colors.hotPink} bold>
              {index + 1}. → {step.emoji} {step.label}
            </Text>
          );
        } else if (isCompleted) {
          return (
            <Text key={step.id} color={colors.success}>
              {index + 1}. {emojis.check} {step.label}
            </Text>
          );
        } else {
          return (
            <Text key={step.id} color={colors.dimGray} dimColor>
              {index + 1}. ○ {step.emoji} {step.label}
            </Text>
          );
        }
      })}
    </Box>
  );
}

function History({ state, currentStep, isWide }: { state: AppState; currentStep: string; isWide: boolean }) {
  const entries: { label: string; value: string; emoji: string }[] = [];
  
  if (currentStep !== 'provider' && state.providerName) {
    entries.push({ 
      label: 'Provider', 
      value: state.providerName,
      emoji: emojis.provider 
    });
  }
  
  if (currentStep !== 'url' && state.baseUrl) {
    entries.push({ 
      label: 'Base URL', 
      value: state.baseUrl,
      emoji: emojis.url 
    });
  }
  
  if (currentStep !== 'title' && state.displayTitle) {
    entries.push({ 
      label: 'Title', 
      value: state.displayTitle,
      emoji: emojis.title 
    });
  }
  
  if (currentStep !== 'key' && state.apiKey && state.apiKey !== 'not-needed') {
    entries.push({ 
      label: 'API Key', 
      value: '••••••••',
      emoji: emojis.key 
    });
  }
  
  if (entries.length === 0) return null;
  
  // Truncate values in narrow mode
  const truncate = (str: string, maxLen: number) => {
    if (isWide || str.length <= maxLen) return str;
    return str.substring(0, maxLen - 3) + '...';
  };
  
  return (
    <Box flexDirection="column" marginTop={1}>
      <Text color={colors.lightPink} dimColor>
        {borders.rounded.horizontal.repeat(isWide ? 40 : 25)}
      </Text>
      <Text color={colors.mistyRose} bold>Completed:</Text>
      {entries.map((entry, index) => (
        <Box key={index} flexDirection="row" gap={1}>
          <Text color={colors.success}>{emojis.check}</Text>
          <Text color={colors.lightPink}>{entry.emoji} {entry.label}:</Text>
          <Text color={colors.white}>{truncate(entry.value, isWide ? 50 : 20)}</Text>
        </Box>
      ))}
    </Box>
  );
}
