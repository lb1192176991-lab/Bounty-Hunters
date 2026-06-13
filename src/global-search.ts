export interface SearchResult {
  type: 'chat' | 'file' | 'git' | 'command';
  id: string;
  title: string;
  preview: string;
  score: number;
  path?: string;
}

export interface SearchQuery {
  text: string;
  types: ('chat' | 'file' | 'git' | 'command')[];
  maxResults: number;
}

export class GlobalSearch {
  private chatIndex: Map<string, string> = new Map();
  private fileIndex: Map<string, string> = new Map();
  private gitIndex: Map<string, string> = new Map();
  private commandIndex: Map<string, string> = new Map();

  indexChat(id: string, content: string): void { this.chatIndex.set(id, content); }
  indexFile(path: string, content: string): void { this.fileIndex.set(path, content); }
  indexGitCommit(hash: string, message: string): void { this.gitIndex.set(hash, message); }
  indexCommand(name: string, description: string): void { this.commandIndex.set(name, description); }

  search(query: SearchQuery): SearchResult[] {
    const results: SearchResult[] = [];
    const q = query.text.toLowerCase();

    const searchIndex = (index: Map<string, string>, type: SearchResult['type']) => {
      if (!query.types.includes(type)) return;
      for (const [id, content] of index) {
        if (content.toLowerCase().includes(q)) {
          const score = content.toLowerCase().split(q).length - 1;
          const preview = content.length > 120 ? content.slice(0, 120) + '...' : content;
          results.push({ type, id, title: id, preview, score, path: id });
        }
      }
    };

    if (query.types.includes('chat')) searchIndex(this.chatIndex, 'chat');
    if (query.types.includes('file')) searchIndex(this.fileIndex, 'file');
    if (query.types.includes('git')) searchIndex(this.gitIndex, 'git');
    if (query.types.includes('command')) searchIndex(this.commandIndex, 'command');

    results.sort((a, b) => b.score - a.score);
    return results.slice(0, query.maxResults);
  }

  remove(id: string): void {
    this.chatIndex.delete(id);
    this.fileIndex.delete(id);
    this.gitIndex.delete(id);
    this.commandIndex.delete(id);
  }

  clear(): void {
    this.chatIndex.clear();
    this.fileIndex.clear();
    this.gitIndex.clear();
    this.commandIndex.clear();
  }
}
