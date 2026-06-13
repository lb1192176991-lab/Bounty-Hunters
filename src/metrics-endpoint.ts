export interface Metric {
  name: string;
  value: number;
  labels: Record<string, string>;
  type: 'counter' | 'gauge' | 'histogram';
}

export class MetricsCollector {
  private counters: Map<string, number> = new Map();
  private gauges: Map<string, number> = new Map();
  private histograms: Map<string, number[]> = new Map();

  increment(name: string, labels: Record<string, string> = {}): void {
    const key = this.makeKey(name, labels);
    this.counters.set(key, (this.counters.get(key) || 0) + 1);
  }

  gauge(name: string, value: number, labels: Record<string, string> = {}): void {
    const key = this.makeKey(name, labels);
    this.gauges.set(key, value);
  }

  observe(name: string, value: number, labels: Record<string, string> = {}): void {
    const key = this.makeKey(name, labels);
    if (!this.histograms.has(key)) this.histograms.set(key, []);
    this.histograms.get(key)!.push(value);
    if (this.histograms.get(key)!.length > 1000) this.histograms.get(key)!.shift();
  }

  generatePrometheusOutput(): string {
    let output = '# HELP t3code_metrics Custom T3 Code metrics\n';
    output += '# TYPE t3code_metrics gauge\n\n';

    for (const [key, value] of this.counters) {
      output += `t3code_${key}_total ${value}\n`;
    }

    for (const [key, value] of this.gauges) {
      output += `t3code_${key} ${value}\n`;
    }

    for (const [key, values] of this.histograms) {
      if (values.length > 0) {
        const sum = values.reduce((a, b) => a + b, 0);
        output += `t3code_${key}_count ${values.length}\n`;
        output += `t3code_${key}_sum ${sum}\n`;
      }
    }

    return output;
  }

  private makeKey(name: string, labels: Record<string, string>): string {
    const labelStr = Object.entries(labels)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}="${v}"`)
      .join(',');
    return labelStr ? `${name}{${labelStr}}` : name;
  }

  reset(): void {
    this.counters.clear();
    this.gauges.clear();
    this.histograms.clear();
  }
}
