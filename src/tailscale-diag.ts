export interface TailscalePeer {
  id: string;
  name: string;
  address: string;
  latency: number;
  isOnline: boolean;
  lastSeen: string;
}

export interface LatencySample {
  timestamp: number;
  latency: number;
}

export class TailscaleDiagnostics {
  private history: Map<string, LatencySample[]> = new Map();

  async getPeers(): Promise<TailscalePeer[]> {
    try {
      const resp = await fetch('http://localhost:9090/api/v1/peers');
      if (!resp.ok) return [];
      return await resp.json();
    } catch { return []; }
  }

  recordLatency(peerId: string, latency: number) {
    if (!this.history.has(peerId)) this.history.set(peerId, []);
    const samples = this.history.get(peerId)!;
    samples.push({ timestamp: Date.now(), latency });
    if (samples.length > 100) samples.shift();
  }

  getLatencyHistory(peerId: string): LatencySample[] {
    return this.history.get(peerId) || [];
  }

  getAverageLatency(peerId: string): number {
    const samples = this.history.get(peerId);
    if (!samples || samples.length === 0) return 0;
    return samples.reduce((sum, s) => sum + s.latency, 0) / samples.length;
  }
}
