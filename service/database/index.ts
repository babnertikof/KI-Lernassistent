import { DatabaseSync } from "node:sqlite";
import { applySchema } from "./schema.ts";

let db: DatabaseSync | null = null;

export function getDBConnection(optDbPath?: string): DatabaseSync {
  if (optDbPath) {
    return createConnection(optDbPath);
  }

  if (db === null) {
    db = new DatabaseSync("database.db");
    db.exec("PRAGMA foreign_keys = ON;");
    applySchema(db);
  }

  db.exec("PRAGMA foreign_keys = ON;");
  return db;
}

function createConnection(path: string): DatabaseSync {
  const newDb = new DatabaseSync(path);
  newDb.exec("PRAGMA foreign_keys = ON;");
  applySchema(newDb);
  return newDb;
}