export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'down';
  uptime: number;
  lastCheck: number;
  checks: HealthCheck[];
}

export interface HealthCheck {
  name: string;
  status: 'pass' | 'fail';
  latency: number;
  error?: string;
}

export class HealthMonitor {
  private checks: Map<string, () => Promise<boolean>> = new Map();
  private interval: ReturnType<typeof setInterval> | null = null;
  private startTime = Date.now();
  private restartCallback: (() => void) | null = null;
  private consecutiveFailures = 0;

  register(name: string, check: () => Promise<boolean>): void {
    this.checks.set(name, check);
  }

  onRestart(callback: () => void): void {
    this.restartCallback = callback;
  }

  start(intervalMs = 30000): void {
    this.interval = setInterval(async () => {
      const results = await this.runAllChecks();
      const failures = results.filter(r => r.status === 'fail');

      if (failures.length > 0) {
        this.consecutiveFailures++;
        if (this.consecutiveFailures >= 3 && this.restartCallback) {
          this.restartCallback();
          this.consecutiveFailures = 0;
        }
      } else {
        this.consecutiveFailures = 0;
      }
    }, intervalMs);
  }

  private async runAllChecks(): Promise<HealthCheck[]> {
    const results: HealthCheck[] = [];
    for (const [name, check] of this.checks) {
      const start = performance.now();
      try {
        const pass = await check();
        results.push({ name, status: pass ? 'pass' : 'fail', latency: performance.now() - start });
      } catch (e) {
        results.push({ name, status: 'fail', latency: performance.now() - start, error: String(e) });
      }
    }
    return results;
  }

  getStatus(): HealthStatus {
    return {
      status: this.consecutiveFailures >= 3 ? 'down' : this.consecutiveFailures > 0 ? 'degraded' : 'healthy',
      uptime: Date.now() - this.startTime,
      lastCheck: Date.now(),
      checks: [],
    };
  }

  stop(): void {
    if (this.interval) clearInterval(this.interval);
    this.interval = null;
  }
}
