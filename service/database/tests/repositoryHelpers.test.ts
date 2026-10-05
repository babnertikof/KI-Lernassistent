import { assertEquals } from "@std/assert";
import { DatabaseSync } from "node:sqlite";
import * as v from "@valibot/valibot";
import { insertRecord, validateTypes } from "../repositoryHelpers.ts";

Deno.test("validateTypes returns a helpful error for invalid inputs", () => {
  const schema = v.object({user_id:v.number()});
  const result = validateTypes(schema, { user_id: "nope" });

  assertEquals(result.ok, false);
  if (result.ok) return;
  assertEquals(result.error.includes("user_id"), true);
});

Deno.test("repositoryHelpers handles empty insert data", () => {
  const db = new DatabaseSync(":memory:");
  db.exec(
    "CREATE TABLE IF NOT EXISTS EmptyTable (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT DEFAULT 'x')",
  );

  const result = insertRecord(db, "EmptyTable", {});
  assertEquals(result.ok, true);
  if (!result.ok) return;
  assertEquals(typeof result.data, "number");
});
