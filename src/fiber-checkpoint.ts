export interface FiberState {
  id: string;
  status: FiberStatus;
  progress: number;
  checkpoint: unknown | null;
  interrupted: boolean;
}

type FiberStatus = 'running' | 'paused' | 'interrupted' | 'completed';

export interface Checkpoint {
  timestamp: number;
  data: unknown;
  description: string;
}

const CHECKPOINT_PREFIX = 't3code-fiber-cp-';

export class FiberCheckpointManager {
  private fibers: Map<string, FiberState> = new Map();

  createFiber(id: string): FiberState {
    const fiber: FiberState = {
      id,
      status: 'running',
      progress: 0,
      checkpoint: null,
      interrupted: false,
    };
    this.fibers.set(id, fiber);
    return fiber;
  }

  saveCheckpoint(fiberId: string, data: unknown, description: string): void {
    const checkpoint: Checkpoint = {
      timestamp: Date.now(),
      data,
      description,
    };
    const fiber = this.fibers.get(fiberId);
    if (fiber) {
      fiber.checkpoint = checkpoint;
      try {
        localStorage.setItem(CHECKPOINT_PREFIX + fiberId, JSON.stringify(checkpoint));
      } catch {}
    }
  }

  restoreCheckpoint(fiberId: string): Checkpoint | null {
    const fiber = this.fibers.get(fiberId);
    if (fiber?.checkpoint) return fiber.checkpoint as Checkpoint;
    try {
      const stored = localStorage.getItem(CHECKPOINT_PREFIX + fiberId);
      if (stored) return JSON.parse(stored);
    } catch {}
    return null;
  }

  interrupt(fiberId: string): void {
    const fiber = this.fibers.get(fiberId);
    if (fiber) {
      fiber.interrupted = true;
      fiber.status = 'interrupted';
      this.saveCheckpoint(fiberId, { progress: fiber.progress, state: 'interrupted' }, 'Automatic checkpoint on interrupt');
    }
  }

  resume(fiberId: string): FiberState | null {
    const fiber = this.fibers.get(fiberId);
    if (!fiber) return null;
    fiber.interrupted = false;
    fiber.status = 'running';
    return fiber;
  }

  cleanup(fiberId: string): void {
    this.fibers.delete(fiberId);
    try { localStorage.removeItem(CHECKPOINT_PREFIX + fiberId); } catch {}
  }
}
