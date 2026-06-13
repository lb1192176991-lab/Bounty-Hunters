export interface KeyBinding {
  keys: string;
  action: string;
  description: string;
}

export const COPY_BINDINGS: KeyBinding[] = [
  { keys: 'Ctrl+C / Cmd+C', action: 'copy', description: 'Copy selected text' },
  { keys: 'Ctrl+Shift+C', action: 'copy', description: 'Copy (alternate)' },
];

export const PASTE_BINDINGS: KeyBinding[] = [
  { keys: 'Ctrl+V / Cmd+V', action: 'paste', description: 'Paste from clipboard' },
  { keys: 'Ctrl+Shift+V', action: 'paste', description: 'Paste (alternate)' },
];

export const SELECTION_BINDINGS: KeyBinding[] = [
  { keys: 'Ctrl+A', action: 'selectAll', description: 'Select all' },
  { keys: 'Shift+Home', action: 'selectSLineStart', description: 'Select to line start' },
  { keys: 'Shift+End', action: 'selectToLineEnd', description: 'Select to line end' },
];

export function getPlatformBindings(platform: NodeJS.Platform): KeyBinding[] {
  const isMac = platform === 'darwin';
  const all = [...COPY_BINDINGS, ...PASTE_BINDINGS, ...SELECTION_BINDINGS];
  return all.map(b => ({
    ...b,
    keys: isMac ? b.keys.replace(/Ctrl/g, 'Cmd') : b.keys.replace(/Cmd/g, 'Ctrl'),
  }));
}
