export interface CacheEntry<T> {
  data: T;
  expiresAt: number;
  etag?: string;
  staleAt?: number;
}

export class ApiResponseCache<T = unknown> {
  private store: Map<string, CacheEntry<T>> = new Map();
  private defaultTTL: number;

  constructor(ttlMs = 60000) {
    this.defaultTTL = ttlMs;
  }

  get(key: string): { data: T; stale: boolean } | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    const now = Date.now();
    if (now > entry.expiresAt && entry.staleAt && now > entry.staleAt) {
      this.store.delete(key);
      return null;
    }
    return { data: entry.data, stale: now > entry.expiresAt };
  }

  set(key: string, data: T, ttl?: number, etag?: string): void {
    const ttlMs = ttl || this.defaultTTL;
    this.store.set(key, {
      data,
      expiresAt: Date.now() + ttlMs,
      staleAt: Date.now() + ttlMs * 2,
      etag,
    });
  }

  getOrSet(key: string, fetch: () => Promise<T>, ttl?: number): Promise<T> {
    const cached = this.get(key);
    if (cached && !cached.stale) return Promise.resolve(cached.data);
    return fetch().then(data => {
      this.set(key, data, ttl);
      return data;
    });
  }

  invalidate(key: string): void {
    this.store.delete(key);
  }

  invalidatePattern(pattern: string): void {
    for (const key of this.store.keys()) {
      if (key.includes(pattern)) this.store.delete(key);
    }
  }

  clear(): void {
    this.store.clear();
  }

  get size(): number { return this.store.size; }
}
