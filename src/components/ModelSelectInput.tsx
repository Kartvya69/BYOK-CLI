import React, { useState, useMemo } from 'react';
import { Box, Text, useInput } from 'ink';
import { colors, emojis } from '../theme.js';

interface ModelOption {
  label: string;
  value: string;
}

interface ModelSelectInputProps {
  options: ModelOption[];
  onSubmit: (selectedValues: string[]) => void;
}

export function ModelSelectInput({ options, onSubmit }: ModelSelectInputProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedValues, setSelectedValues] = useState<Set<string>>(new Set());
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [isSearchFocused, setIsSearchFocused] = useState(true);

  // Filter models based on search query
  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;
    const query = searchQuery.toLowerCase();
    return options.filter(opt =>
      opt.value.toLowerCase().includes(query) ||
      opt.label.toLowerCase().includes(query)
    );
  }, [options, searchQuery]);

  // Get visible option values for "select all visible" functionality
  const visibleValues = useMemo(() =>
    new Set(filteredOptions.map(opt => opt.value)),
    [filteredOptions]
  );

  // Handle keyboard input
  useInput((input: string, key: {
    upArrow: boolean;
    downArrow: boolean;
    return: boolean;
    escape: boolean;
    tab: boolean;
    backspace: boolean;
    delete: boolean;
    ctrl: boolean;
    meta: boolean;
  }) => {
    // Ctrl+ shortcuts work in both modes
    if (key.ctrl) {
      if (input === 'a' || input === 'A') {
        // Ctrl+A: Select all visible
        setSelectedValues(prev => {
          const next = new Set(prev);
          visibleValues.forEach(val => next.add(val));
          return next;
        });
        return;
      }
      if (input === 'd' || input === 'D') {
        // Ctrl+D: Deselect all
        setSelectedValues(new Set());
        return;
      }
      if (input === 'k' || input === 'K') {
        // Ctrl+K: Clear search
        setSearchQuery('');
        setIsSearchFocused(true);
        return;
      }
    }

    // Search mode - when focused on search input
    if (isSearchFocused) {
      if (key.return) {
        setIsSearchFocused(false);
        setFocusedIndex(0);
        return;
      }
      if (key.downArrow || key.tab) {
        setIsSearchFocused(false);
        setFocusedIndex(0);
        return;
      }
      if (key.backspace || key.delete) {
        setSearchQuery(prev => prev.slice(0, -1));
        return;
      }
      // Regular typing goes to search (Ctrl shortcuts already handled above)
      if (input && !key.ctrl && !key.meta) {
        setSearchQuery(prev => prev + input);
        return;
      }
      return;
    }

    // List navigation mode
    if (key.upArrow) {
      if (focusedIndex === 0) {
        // At top, go back to search
        setIsSearchFocused(true);
      } else {
        setFocusedIndex(prev => prev - 1);
      }
      return;
    }
    if (key.downArrow) {
      setFocusedIndex(prev => Math.min(filteredOptions.length - 1, prev + 1));
      return;
    }
    if (key.tab) {
      setIsSearchFocused(true);
      return;
    }
    if (input === ' ') {
      // Toggle selection
      const option = filteredOptions[focusedIndex];
      if (option) {
        setSelectedValues(prev => {
          const next = new Set(prev);
          if (next.has(option.value)) {
            next.delete(option.value);
          } else {
            next.add(option.value);
          }
          return next;
        });
      }
      return;
    }
    if (key.return) {
      onSubmit(Array.from(selectedValues));
      return;
    }
    // Any other key goes to search
    if (input && !key.ctrl && !key.meta) {
      setIsSearchFocused(true);
      setSearchQuery(prev => prev + input);
    }
  });

  const isAllVisibleSelected = visibleValues.size > 0 &&
    Array.from(visibleValues).every(v => selectedValues.has(v));

  return (
    <Box flexDirection="column">
      {/* Search Input */}
      <Box
        flexDirection="row"
        borderStyle={isSearchFocused ? "single" : "single"}
        borderColor={isSearchFocused ? colors.hotPink : colors.dimGray}
        paddingX={1}
        marginBottom={1}
      >
        <Text color={colors.lightPink}>{emojis.search} </Text>
        <Text color={isSearchFocused ? colors.white : colors.dimGray}>
          {searchQuery || 'Type to search models...'}
        </Text>
        {isSearchFocused && (
          <Text color={colors.hotPink}>|</Text>
        )}
      </Box>

      {/* Status Bar */}
      <Box flexDirection="row" gap={2} marginBottom={1}>
        <Text color={colors.lightPink}>
          {selectedValues.size} of {options.length} selected
        </Text>
        {searchQuery && (
          <Text color={colors.dimGray}>
            (showing {filteredOptions.length} of {options.length})
          </Text>
        )}
      </Box>

      {/* Model List */}
      <Box flexDirection="column" height={Math.min(10, filteredOptions.length)}>
        {filteredOptions.length === 0 ? (
          <Text color={colors.dimGray}>No models match your search</Text>
        ) : (
          filteredOptions.slice(0, 10).map((option, index) => {
            const isSelected = selectedValues.has(option.value);
            const isFocused = !isSearchFocused && index === focusedIndex;

            return (
              <Box
                key={option.value}
                flexDirection="row"
                gap={1}
                paddingX={1}
                backgroundColor={isFocused ? colors.hotPink : undefined}
              >
                <Text color={isFocused ? colors.white : colors.lightPink}>
                  {isSelected ? emojis.checkboxChecked : emojis.checkboxEmpty}
                </Text>
                <Text
                  color={isFocused ? colors.white : colors.white}
                  dimColor={!isSelected}
                >
                  {option.label}
                </Text>
              </Box>
            );
          })
        )}
      </Box>

      {/* Scroll indicator */}
      {filteredOptions.length > 10 && (
        <Text color={colors.dimGray} dimColor>
          ... and {filteredOptions.length - 10} more (scroll with ↑↓)
        </Text>
      )}

      {/* Controls Help */}
      <Box flexDirection="column" marginTop={1}>
        <Text color={colors.dimGray} dimColor>
          Space: toggle • Ctrl+A: select all • Ctrl+D: deselect • Ctrl+K: clear search
        </Text>
        <Text color={colors.dimGray} dimColor>
          ↑↓: navigate • Tab: switch focus • Enter: confirm
        </Text>
      </Box>
    </Box>
  );
}
