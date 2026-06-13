export interface TimeWindow {
  start: number;
  end: number;
}

export class SlidingWindowMetrics {
  private buckets: Map<string, number[]> = new Map();
  private windowSize: number;
  private bucketCount: number;

  constructor(windowMs = 60000, bucketCount = 6) {
    this.windowSize = windowMs;
    this.bucketCount = bucketCount;
  }

  record(key: string, value: number): void {
    if (!this.buckets.has(key)) this.buckets.set(key, []);
    this.buckets.get(key)!.push(value);
  }

  getAggregates(key: string): { count: number; sum: number; avg: number; min: number; max: number } | null {
    const values = this.buckets.get(key);
    if (!values || values.length === 0) return null;

    const sum = values.reduce((a, b) => a + b, 0);
    return {
      count: values.length,
      sum,
      avg: sum / values.length,
      min: Math.min(...values),
      max: Math.max(...values),
    };
  }

  prune(): void {
    const cutoff = Date.now() - this.windowSize;
    for (const [key, values] of this.buckets) {
      this.buckets.set(key, values.filter(v => v > cutoff));
      if (this.buckets.get(key)!.length === 0) this.buckets.delete(key);
    }
  }

  getActiveKeys(): string[] {
    return Array.from(this.buckets.keys());
  }

  getWindows(): TimeWindow {
    return {
      start: Date.now() - this.windowSize,
      end: Date.now(),
    };
  }
}
