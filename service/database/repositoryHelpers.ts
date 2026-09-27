import type { DatabaseSync, SQLInputValue } from "node:sqlite";
import { DbResult } from "./db_types.ts";
import { v } from "@oak/acorn";

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

export function getRecordById<T extends v.GenericSchema>(
  db: DatabaseSync,
  tableName: string,
  idColumn: string,
  id: SQLInputValue,
  schema: T,
): DbResult<v.InferOutput<T>> {
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

export function validateTypes<T extends v.GenericSchema>(
  schema: T,
  data: unknown,
): DbResult<v.InferOutput<T>> {
  const parseResult = v.safeParse(schema,data);
  if (!parseResult.success) {
    const errorMessage = v.flatten(parseResult.issues).nested
    return {
      ok: false,
      error: JSON.stringify(errorMessage??{},null,2),
    };
  }

  return {
    ok: true,
    data: parseResult.output,
  };
}
