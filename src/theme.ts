// Pinkish-white theme for BYOK-CLI

export const colors = {
  // Primary pinks
  pastelPink: '#F8C8DC',
  hotPink: '#FF69B4',
  deepPink: '#FF1493',
  lightPink: '#FFB6C1',
  mistyRose: '#FFE4E1',
  
  // Neutrals
  white: '#FFFFFF',
  offWhite: '#FFF0F5',
  lightGray: '#E8E8E8',
  dimGray: '#A0A0A0',
  
  // Status colors
  success: '#00FA9A',
  error: '#FF6B6B',
  warning: '#FFD93D',
  info: '#6BCBFF',
  
  // Ink-compatible color names
  primary: 'magenta',
  secondary: 'cyan',
  accent: 'yellow',
  muted: 'gray',
};

export const emojis = {
  // Navigation
  back: '⬅️',
  next: '➡️',
  check: '✅',
  cross: '❌',

  // Input types
  url: '🔗',
  title: '📝',
  key: '🔑',
  provider: '🏢',
  model: '🤖',
  settings: '⚙️',
  summary: '📋',

  // Status
  loading: '🔄',
  success: '✨',
  error: '💥',
  warning: '⚠️',
  info: 'ℹ️',

  // UI elements
  sparkle: '✨',
  star: '⭐',
  heart: '💖',
  arrow: '➜',
  bullet: '•',
  checkboxEmpty: '☐',
  checkboxChecked: '☑️',
  radioEmpty: '○',
  radioSelected: '◉',
  search: '🔍',

  // Steps
  step1: '1️⃣',
  step2: '2️⃣',
  step3: '3️⃣',
  step4: '4️⃣',
  step5: '5️⃣',
  step6: '6️⃣',
  step7: '7️⃣',
};

export const borders = {
  rounded: {
    topLeft: '╭',
    topRight: '╮',
    bottomLeft: '╰',
    bottomRight: '╯',
    horizontal: '─',
    vertical: '│',
  },
  square: {
    topLeft: '┌',
    topRight: '┐',
    bottomLeft: '└',
    bottomRight: '┘',
    horizontal: '─',
    vertical: '│',
  },
  double: {
    topLeft: '╔',
    topRight: '╗',
    bottomLeft: '╚',
    bottomRight: '╝',
    horizontal: '═',
    vertical: '║',
  },
};

export const styles = {
  title: {
    color: colors.hotPink,
    bold: true,
  },
  subtitle: {
    color: colors.lightPink,
    dimColor: true,
  },
  prompt: {
    color: colors.white,
    bold: true,
  },
  hint: {
    color: colors.dimGray,
    dimColor: true,
  },
  success: {
    color: colors.success,
    bold: true,
  },
  error: {
    color: colors.error,
    bold: true,
  },
  active: {
    color: colors.white,
    backgroundColor: colors.hotPink,
    bold: true,
  },
  inactive: {
    color: colors.lightGray,
  },
};

// Step configuration
export const steps = [
  { id: 'provider', label: 'Provider', emoji: emojis.provider },
  { id: 'url', label: 'Base URL', emoji: emojis.url },
  { id: 'title', label: 'Title', emoji: emojis.title },
  { id: 'key', label: 'API Key', emoji: emojis.key },
  { id: 'models', label: 'Models', emoji: emojis.model },
  { id: 'settings', label: 'Settings', emoji: emojis.settings },
  { id: 'confirm', label: 'Confirm', emoji: emojis.check },
];
