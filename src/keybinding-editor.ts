export interface KeyBindingEntry {
  id: string;
  command: string;
  keys: string;
  category: string;
  defaultKeys?: string;
}

export interface KeyConflict {
  entry1: KeyBindingEntry;
  entry2: KeyBindingEntry;
  keys: string;
}

export class KeybindingManager {
  private bindings: Map<string, KeyBindingEntry> = new Map();
  private keyMap: Map<string, string[]> = new Map();

  register(entry: KeyBindingEntry): void {
    this.bindings.set(entry.id, entry);
    const keys = entry.keys.toLowerCase().split('+').sort().join('+');
    if (!this.keyMap.has(keys)) this.keyMap.set(keys, []);
    this.keyMap.get(keys)!.push(entry.id);
  }

  detectConflicts(): KeyConflict[] {
    const conflicts: KeyConflict[] = [];
    for (const [keys, ids] of this.keyMap) {
      if (ids.length > 1) {
        for (let i = 0; i < ids.length; i++) {
          for (let j = i + 1; j < ids.length; j++) {
            const e1 = this.bindings.get(ids[i]);
            const e2 = this.bindings.get(ids[j]);
            if (e1 && e2) {
              conflicts.push({ entry1: e1, entry2: e2, keys });
            }
          }
        }
      }
    }
    return conflicts;
  }

  updateBinding(id: string, newKeys: string): KeyConflict[] {
    const entry = this.bindings.get(id);
    if (!entry) return [];

    const oldKeys = entry.keys.toLowerCase().split('+').sort().join('+');
    const oldIds = this.keyMap.get(oldKeys) || [];
    this.keyMap.set(oldKeys, oldIds.filter(i => i !== id));
    if (this.keyMap.get(oldKeys)?.length === 0) this.keyMap.delete(oldKeys);

    entry.keys = newKeys;
    this.bindings.set(id, entry);

    const newKeyNorm = newKeys.toLowerCase().split('+').sort().join('+');
    if (!this.keyMap.has(newKeyNorm)) this.keyMap.set(newKeyNorm, []);
    this.keyMap.get(newKeyNorm)!.push(id);

    return this.detectConflicts();
  }

  getBindings(): KeyBindingEntry[] {
    return Array.from(this.bindings.values());
  }

  resetToDefault(id: string): void {
    const entry = this.bindings.get(id);
    if (entry && entry.defaultKeys) {
      this.updateBinding(id, entry.defaultKeys);
    }
  }
}
