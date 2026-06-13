export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration: number;
  createdAt: number;
}

export class ToastManager {
  private toasts: Toast[] = [];
  private maxToasts = 5;
  private listeners: Set<(toasts: Toast[]) => void> = new Set();

  show(type: ToastType, title: string, message?: string, duration = 5000): string {
    const toast: Toast = {
      id: crypto.randomUUID(),
      type,
      title,
      message,
      duration,
      createdAt: Date.now(),
    };
    this.toasts.push(toast);
    if (this.toasts.length > this.maxToasts) this.toasts.shift();
    this.notify();
    if (duration > 0) {
      setTimeout(() => this.dismiss(toast.id), duration);
    }
    return toast.id;
  }

  success(title: string, msg?: string): string { return this.show('success', title, msg); }
  error(title: string, msg?: string): string { return this.show('error', title, msg); }
  warning(title: string, msg?: string): string { return this.show('warning', title, msg); }
  info(title: string, msg?: string): string { return this.show('info', title, msg); }

  dismiss(id: string): void {
    this.toasts = this.toasts.filter(t => t.id !== id);
    this.notify();
  }

  dismissAll(): void {
    this.toasts = [];
    this.notify();
  }

  subscribe(fn: (toasts: Toast[]) => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private notify(): void {
    this.listeners.forEach(fn => fn([...this.toasts]));
  }
}
