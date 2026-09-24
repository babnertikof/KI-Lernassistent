import { DatabaseSync } from "node:sqlite";

let db: DatabaseSync | null = null;

export function getDBConnection(): DatabaseSync {
  if (db === null) {
    db = new DatabaseSync("database.db");
  }

  return db;
}
