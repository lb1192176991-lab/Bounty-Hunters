export interface DeepLink {
  action: string;
  params: Record<string, string>;
  original: string;
}

const PROTOCOL = 't3code://';

export class DeepLinkHandler {
  private handlers: Map<string, (params: Record<string, string>) => void> = new Map();
  private registered = false;

  register(action: string, handler: (params: Record<string, string>) => void): void {
    this.handlers.set(action, handler);
  }

  parse(url: string): DeepLink | null {
    if (!url.startsWith(PROTOCOL)) return null;
    const withoutProtocol = url.slice(PROTOCOL.length);
    const [action, queryString] = withoutProtocol.split('?');
    const params: Record<string, string> = {};

    if (queryString) {
      queryString.split('&').forEach(pair => {
        const [key, value] = pair.split('=');
        params[decodeURIComponent(key)] = decodeURIComponent(value || '');
      });
    }

    return { action, params, original: url };
  }

  handle(url: string): boolean {
    const link = this.parse(url);
    if (!link) return false;
    const handler = this.handlers.get(link.action);
    if (handler) {
      handler(link.params);
      return true;
    }
    return false;
  }

  getSupportedActions(): string[] {
    return Array.from(this.handlers.keys());
  }

  registerProtocol(): void {
    if (this.registered || typeof window === 'undefined') return;
    try {
      navigator.registerProtocolHandler?.('t3code', window.location.origin + '/handle?url=%s', 'T3 Code');
      this.registered = true;
    } catch {}
  }

  generateLink(action: string, params: Record<string, string>): string {
    const query = Object.entries(params)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&');
    return `${PROTOCOL}${action}${query ? '?' + query : ''}`;
  }
}
