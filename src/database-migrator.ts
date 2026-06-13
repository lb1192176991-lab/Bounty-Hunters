import Database from 'better-sqlite3';

export interface Migration {
  version: number;
  name: string;
  up: (db: Database.Database) => void;
}

export class Migrator {
  private migrations: Migration[] = [];

  add(migration: Migration): void {
    this.migrations.push(migration);
  }

  run(db: Database.Database): void {
    db.exec(`CREATE TABLE IF NOT EXISTS _migrations (version INTEGER PRIMARY KEY, applied_at TEXT)`);

    const applied = new Set(
      db.prepare(`SELECT version FROM _migrations`).all()
        .map((r: any) => r.version)
    );

    for (const m of this.migrations.sort((a, b) => a.version - b.version)) {
      if (!applied.has(m.version)) {
        db.transaction(() => {
          m.up(db);
          db.prepare(`INSERT INTO _migrations (version, applied_at) VALUES (?, ?)`).run(m.version, new Date().toISOString());
        })();
      }
    }
  }
}
