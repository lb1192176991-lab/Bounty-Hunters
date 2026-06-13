export type UpdateStatus = 'available' | 'downloading' | 'ready' | 'deferred' | 'skipped' | 'up-to-date';

export interface UpdateInfo {
  version: string;
  status: UpdateStatus;
  progress?: number;
  releaseNotes?: string;
}

const SKIP_KEY = 't3code-skip-version';

export class UpdateManager {
  private state: UpdateInfo;
  private listeners: Set<(info: UpdateInfo) => void> = new Set();

  constructor(initialVersion: string) {
    const skipped = this.getSkippedVersion();
    this.state = {
      version: initialVersion,
      status: skipped === initialVersion ? 'skipped' : 'up-to-date',
    };
  }

  private getSkippedVersion(): string | null {
    try { return localStorage.getItem(SKIP_KEY); } catch { return null; }
  }

  setProgress(version: string, pct: number) {
    this.state = { ...this.state, version, status: 'downloading', progress: pct };
    this.notify();
  }

  setReady(version: string, notes?: string) {
    this.state = { ...this.state, version, status: 'ready', progress: 100, releaseNotes: notes };
    this.notify();
  }

  defer() {
    this.state = { ...this.state, status: 'deferred' };
    this.notify();
  }

  skip(version: string) {
    try { localStorage.setItem(SKIP_KEY, version); } catch {}
    this.state = { ...this.state, version, status: 'skipped' };
    this.notify();
  }

  subscribe(fn: (info: UpdateInfo) => void) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private notify() {
    this.listeners.forEach(fn => fn(this.state));
  }
}
