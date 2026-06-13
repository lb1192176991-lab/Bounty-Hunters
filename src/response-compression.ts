import { createGzip, createBrotliCompress, createDeflate } from 'zlib';
import { promisify } from 'util';

const gzipAsync = promisify(createGzip);
const brotliAsync = promisify(createBrotliCompress);

export type CompressionType = 'gzip' | 'brotli' | 'deflate' | 'identity';

export interface CompressionConfig {
  types: CompressionType[];
  level: number;
  threshold: number;
}

const MIME_COMPRESSIBLE = [
  'text/', 'application/json', 'application/javascript', 'application/xml',
  'application/xhtml+xml', 'image/svg+xml',
];

export class ResponseCompressor {
  private config: CompressionConfig = {
    types: ['brotli', 'gzip', 'deflate'],
    level: 6,
    threshold: 1024,
  };

  configure(config: Partial<CompressionConfig>): void {
    Object.assign(this.config, config);
  }

  selectType(acceptEncoding: string): CompressionType | null {
    for (const type of this.config.types) {
      if (acceptEncoding.includes(type)) return type;
    }
    return null;
  }

  shouldCompress(contentType: string, size: number): boolean {
    if (size < this.config.threshold) return false;
    return MIME_COMPRESSIBLE.some(mime => contentType.startsWith(mime));
  }

  getContentEncoding(type: CompressionType): string {
    const map: Record<CompressionType, string> = {
      gzip: 'gzip',
      brotli: 'br',
      deflate: 'deflate',
      identity: 'identity',
    };
    return map[type];
  }
}
