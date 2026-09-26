import type { DatabaseSync, SQLInputValue } from "node:sqlite";
import { DbResult } from "./db_types.ts";
import { z } from "@zod/zod";

export function insertRecord(
  db: DatabaseSync,
  tableName: string,
  record: object,
): DbResult<number> {
  try {
    const columns = Object.keys(record);
    const values = Object.values(record) as SQLInputValue[];
    const query = columns.length === 0
      ? `INSERT INTO ${tableName} DEFAULT VALUES`
      : `INSERT INTO ${tableName} (${columns.join(", ")}) VALUES (${
        columns.map(() => "?").join(", ")
      })`;
    const result = db.prepare(query).run(...values);

    return {
      ok: true,
      data: Number(result.lastInsertRowid), //Is id because it gets inserted last for some reason.
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unknown database error",
    };
  }
}

export function deleteRecord(
  db: DatabaseSync,
  tableName: string,
  idColumn: string,
  id: SQLInputValue,
): DbResult<number> {
  try {
    const query = `DELETE FROM ${tableName} WHERE ${idColumn} = ?`;
    const result = db.prepare(query).run(id);

    return {
      ok: true,
      data: Number(result.changes),
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unknown database error",
    };
  }
}

export function getRecordById<T extends z.ZodType>(
  db: DatabaseSync,
  tableName: string,
  idColumn: string,
  id: SQLInputValue,
  schema: T,
): DbResult<z.infer<T>> {
  try {
    const query = `SELECT * FROM ${tableName} WHERE ${idColumn} = ?`;
    const record = db.prepare(query).get(id);

    if (record === undefined) {
      return {
        ok: false,
        error: "Record not found",
      };
    }

    return validateTypes(schema, record);
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unknown database error",
    };
  }
}

export function validateTypes<T extends z.ZodType>(
  schema: T,
  data: unknown,
): DbResult<z.infer<T>> {
  const parseResult = schema.safeParse(data);
  if (!parseResult.success) {
    const errorMessage = parseResult.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join(", ");
    return {
      ok: false,
      error: errorMessage,
    };
  }

  return {
    ok: true,
    data: parseResult.data,
  };
}
