import React from 'react';
import { Box, Text } from 'ink';

export function Logo() {
  return (
    <Box flexDirection="column" marginBottom={1}>
      <Text color="cyan">
        {'  ╔═══════════════════════════════════════════════════════════════╗'}
      </Text>
      <Text color="cyan">{'  ║                                                               ║'}</Text>
      <Text color="cyan">
        {'  ║   ██████╗ ██╗   ██╗ ██████╗ ██╗  ██╗      ██████╗██╗     ██╗  ║'}
      </Text>
      <Text color="cyan">
        {'  ║   ██╔══██╗╚██╗ ██╔╝██╔═══██╗██║ ██╔╝     ██╔════╝██║     ██║  ║'}
      </Text>
      <Text color="cyan">
        {'  ║   ██████╔╝ ╚████╔╝ ██║   ██║█████╔╝      ██║     ██║     ██║  ║'}
      </Text>
      <Text color="cyan">
        {'  ║   ██╔══██╗  ╚██╔╝  ██║   ██║██╔═██╗      ██║     ██║     ██║  ║'}
      </Text>
      <Text color="cyan">
        {'  ║   ██████╔╝   ██║   ╚██████╔╝██║  ██╗     ╚██████╗███████╗██║  ║'}
      </Text>
      <Text color="cyan">
        {'  ║   ╚═════╝    ╚═╝    ╚═════╝ ╚═╝  ╚═╝      ╚═════╝╚══════╝╚═╝  ║'}
      </Text>
      <Text color="cyan">{'  ║                                                               ║'}</Text>
      <Text color="cyan">
        {'  ║          Factory CLI - Custom Model Configuration             ║'}
      </Text>
      <Text color="cyan">{'  ║                                                               ║'}</Text>
      <Text color="cyan">
        {'  ╚═══════════════════════════════════════════════════════════════╝'}
      </Text>
    </Box>
  );
}
