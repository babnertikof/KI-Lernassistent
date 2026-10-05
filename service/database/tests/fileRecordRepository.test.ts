import { assertEquals, assertExists } from "@std/assert";
import { FileRecordRepo } from "../repositories/fileRecordRepository.ts";
import { createTestDb } from "./testDb.ts";

Deno.test("FileRecordRepo adds file records without explicit file_id", () => {
  const db = createTestDb();
  const repo = new FileRecordRepo(db);

  const sessionInsert = db.prepare(
    "INSERT INTO Session (user_id) VALUES (?)",
  ).run(7);
  const sessionId = Number(sessionInsert.lastInsertRowid);

  const addResult = repo.addFileRecord({
    session_id: sessionId,
    filename: "report.pdf",
    mimetype: "application/pdf",
    file_path: "/tmp/report.pdf",
  });

  assertEquals(addResult.ok, true);
  if (!addResult.ok) return;

  const fileId = addResult.data;
  const getResult = repo.getFileRecord(fileId);
  assertEquals(getResult.ok, true);
  if (!getResult.ok) return;

  assertExists(getResult.data.file_id);
  assertEquals(getResult.data.filename, "report.pdf");
  assertEquals(getResult.data.session_id, sessionId);
  assertExists(getResult.data.upload_timestamp);

  const deleteResult = repo.deleteFileRecord(fileId);
  assertEquals(deleteResult.ok, true);
  if (!deleteResult.ok) return;
  assertEquals(deleteResult.data, 1);
});
