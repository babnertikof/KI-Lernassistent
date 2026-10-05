import { DatabaseSync } from "node:sqlite";
import { applySchema } from "../schema.ts";

export function createTestDb(): DatabaseSync {
  const db = new DatabaseSync(":memory:");
  db.exec("PRAGMA foreign_keys = ON;");
  applySchema(db);
  return db;
}
