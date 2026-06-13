export interface SnapshotMetadata {
  id: string;
  timestamp: number;
  size: number;
  tags: string[];
}

export interface RetentionPolicy {
  maxSnapshots: number;
  maxAgeDays: number;
  minIntervalMinutes: number;
}

export class SnapshotPruner {
  constructor(private policy: RetentionPolicy) {}

  prune(snapshots: SnapshotMetadata[]): SnapshotMetadata[] {
    let result = [...snapshots];

    // Remove by age
    const cutOff = Date.now() - this.policy.maxAgeDays * 24 * 60 * 60 * 1000;
    result = result.filter(s => s.timestamp >= cutOff);

    // Remove by count (keep newest)
    result.sort((a, b) => b.timestamp - a.timestamp);
    result = result.slice(0, this.policy.maxSnapshots);

    // Enforce minimum interval
    const kept: SnapshotMetadata[] = [];
    let lastTime = 0;
    const minInterval = this.policy.minIntervalMinutes * 60 * 1000;
    for (const snap of result) {
      if (snap.timestamp - lastTime >= minInterval) {
        kept.push(snap);
        lastTime = snap.timestamp;
      }
    }

    return kept;
  }

  estimateSavings(snapshots: SnapshotMetadata[]): { before: number; after: number; savings: number } {
    const before = snapshots.length;
    const after = this.prune(snapshots).length;
    return { before, after, savings: before - after };
  }
}
