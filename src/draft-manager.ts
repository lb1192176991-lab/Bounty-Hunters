export interface Draft {
  threadId: string;
  content: string;
  cursorPosition: number;
  savedAt: number;
}

const STORAGE_PREFIX = 't3code-draft-';

export class DraftManager {
  private drafts: Map<string, Draft> = new Map();
  private currentThreadId: string | null = null;

  switchThread(newThreadId: string): void {
    // Save current draft
    if (this.currentThreadId) {
      const editor = this.getEditorState();
      if (editor) {
        this.save(this.currentThreadId, editor);
      }
    }
    this.currentThreadId = newThreadId;
    // Restore draft for new thread
    this.restore(newThreadId);
  }

  private save(threadId: string, state: { content: string; cursor: number }): void {
    const draft: Draft = {
      threadId,
      content: state.content,
      cursorPosition: state.cursor,
      savedAt: Date.now(),
    };
    this.drafts.set(threadId, draft);
    try {
      sessionStorage.setItem(STORAGE_PREFIX + threadId, JSON.stringify(draft));
    } catch {}
  }

  private restore(threadId: string): Draft | null {
    // Try memory first
    let draft = this.drafts.get(threadId);
    if (draft) return draft;

    // Try sessionStorage
    try {
      const stored = sessionStorage.getItem(STORAGE_PREFIX + threadId);
      if (stored) {
        draft = JSON.parse(stored);
        this.drafts.set(threadId, draft!);
        return draft;
      }
    } catch {}

    return null;
  }

  private getEditorState(): { content: string; cursor: number } | null {
    const editor = document.querySelector('[data-composer]');
    if (!editor) return null;
    return {
      content: (editor as HTMLTextAreaElement).value || '',
      cursor: (editor as HTMLTextAreaElement).selectionStart || 0,
    };
  }

  hasDraft(threadId: string): boolean {
    return this.drafts.has(threadId);
  }

  clearDraft(threadId: string): void {
    this.drafts.delete(threadId);
    try { sessionStorage.removeItem(STORAGE_PREFIX + threadId); } catch {}
  }
}
