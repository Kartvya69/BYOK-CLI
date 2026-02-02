import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { colors, emojis } from '../theme.js';

interface BoxConfirmInputProps {
  onConfirm: () => void;
  onCancel: () => void;
  defaultSelected?: 'yes' | 'no';
  prompt?: string;
  jsonConfig?: string;
}

export function BoxConfirmInput({
  onConfirm,
  onCancel,
  defaultSelected = 'yes',
  prompt = 'Save this configuration?',
  jsonConfig
}: BoxConfirmInputProps) {
  const [selected, setSelected] = useState<'yes' | 'no'>(defaultSelected);
  const [showJson, setShowJson] = useState(false);

  useInput((input: string, key: { leftArrow: boolean; rightArrow: boolean; return: boolean }) => {
    if (key.leftArrow) {
      setSelected('yes');
    } else if (key.rightArrow) {
      setSelected('no');
    } else if (key.return) {
      if (selected === 'yes') {
        onConfirm();
      } else {
        onCancel();
      }
    } else if (input.toLowerCase() === 'j' && jsonConfig) {
      setShowJson(!showJson);
    }
  });

  return (
    <Box flexDirection="column" alignItems="center">
      <Text color={colors.hotPink} bold>{prompt}</Text>

      <Box flexDirection="row" gap={2} marginTop={1}>
        {/* Yes Box - Square style */}
        <Box
          flexDirection="column"
          alignItems="center"
          paddingX={3}
          paddingY={1}
          borderStyle="single"
          borderColor={selected === 'yes' ? colors.hotPink : colors.dimGray}
        >
          {selected === 'yes' ? (
            <Text color={colors.white} backgroundColor={colors.hotPink} bold>
              Yes
            </Text>
          ) : (
            <Text color={colors.dimGray}>Yes</Text>
          )}
        </Box>

        {/* No Box - Square style */}
        <Box
          flexDirection="column"
          alignItems="center"
          paddingX={3}
          paddingY={1}
          borderStyle="single"
          borderColor={selected === 'no' ? colors.hotPink : colors.dimGray}
        >
          {selected === 'no' ? (
            <Text color={colors.white} backgroundColor={colors.hotPink} bold>
              No
            </Text>
          ) : (
            <Text color={colors.dimGray}>No</Text>
          )}
        </Box>
      </Box>

      {/* JSON Config Toggle */}
      {jsonConfig && (
        <Box flexDirection="column" marginY={1} alignItems="center">
          <Text color={colors.dimGray} dimColor>
            Press 'J' to {showJson ? 'hide' : 'show'} JSON config
          </Text>

          {showJson && (
            <Box
              flexDirection="column"
              marginTop={1}
              padding={1}
              borderStyle="round"
              borderColor={colors.lightPink}
            >
              <Text color={colors.lightPink}>{emojis.info} JSON Config:</Text>
              {jsonConfig.split('\n').map((line, i) => (
                <Text key={i} color={colors.white}>{line}</Text>
              ))}
            </Box>
          )}
        </Box>
      )}

      <Box marginTop={1}>
        <Text color={colors.dimGray} dimColor>
          ← → to select • Enter to confirm
        </Text>
      </Box>
    </Box>
  );
}
