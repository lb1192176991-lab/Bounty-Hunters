export interface RouteLimit {
  route: string;
  method: string;
  maxSize: number;
}

export class BodySizeLimiter {
  private defaults: RouteLimit = { route: '*', method: '*', maxSize: 10 * 1024 * 1024 };
  private overrides: RouteLimit[] = [];

  setDefault(maxSize: number): void {
    this.defaults.maxSize = maxSize;
  }

  addOverride(route: string, method: string, maxSize: number): void {
    this.overrides.push({ route, method, maxSize });
  }

  getLimit(route: string, method: string): number {
    const override = this.overrides.find(
      o => route.startsWith(o.route) && (o.method === '*' || o.method === method)
    );
    return override?.maxSize ?? this.defaults.maxSize;
  }

  validate(body: Buffer, route: string, method: string): { valid: boolean; error?: string } {
    const limit = this.getLimit(route, method);
    if (body.length > limit) {
      const limitMB = (limit / (1024 * 1024)).toFixed(1);
      const bodyMB = (body.length / (1024 * 1024)).toFixed(1);
      return {
        valid: false,
        error: `Request body (${bodyMB}MB) exceeds limit (${limitMB}MB) for ${method} ${route}`,
      };
    }
    return { valid: true };
  }

  getLimits(): { defaults: RouteLimit; overrides: RouteLimit[] } {
    return { defaults: this.defaults, overrides: [...this.overrides] };
  }
}
