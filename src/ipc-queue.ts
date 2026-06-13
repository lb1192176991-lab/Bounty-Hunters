export interface IPCMessage {
  id: string;
  type: string;
  payload: unknown;
  timestamp: number;
  retries: number;
}

export type QueueStatus = 'connected' | 'disconnected' | 'reconnecting';

export class IPCMessageQueue {
  private queue: IPCMessage[] = [];
  private consumers: Map<string, (msg: IPCMessage) => Promise<void>> = new Map();
  private processing = false;
  private status: QueueStatus = 'disconnected';
  private maxRetries = 3;

  connect(): void {
    this.status = 'connected';
    this.processQueue();
  }

  disconnect(): void {
    this.status = 'disconnected';
    this.processing = false;
  }

  send(type: string, payload: unknown): string {
    const msg: IPCMessage = {
      id: crypto.randomUUID(),
      type,
      payload,
      timestamp: Date.now(),
      retries: 0,
    };
    this.queue.push(msg);
    if (this.status === 'connected' && !this.processing) {
      this.processQueue();
    }
    return msg.id;
  }

  on(type: string, handler: (msg: IPCMessage) => Promise<void>): void {
    this.consumers.set(type, handler);
  }

  private async processQueue(): Promise<void> {
    if (this.processing || this.queue.length === 0) return;
    this.processing = true;

    while (this.queue.length > 0 && this.status === 'connected') {
      const msg = this.queue.shift()!;
      const handler = this.consumers.get(msg.type);
      if (handler) {
        try {
          await handler(msg);
        } catch {
          if (msg.retries < this.maxRetries) {
            msg.retries++;
            this.queue.push(msg);
          }
        }
      }
    }
    this.processing = false;
  }

  getQueueLength(): number { return this.queue.length; }
  getStatus(): QueueStatus { return this.status; }
}
