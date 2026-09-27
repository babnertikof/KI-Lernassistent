import { assertEquals } from "@std/assert";
import { SessionRepo } from "../repositories/sessionRepository.ts";
import { createTestDb } from "./testDb.ts";

Deno.test("Session deletion cascades to files and quiz events", () => {
  const db = createTestDb();
  const repo = new SessionRepo(db);

  const sessionId = repo.addSession({ user_id: 1 });
  assertEquals(sessionId.ok, true);
  if (!sessionId.ok) return;

  const fileInsert = db.prepare(
    "INSERT INTO Files (session_id, filename, file_path) VALUES (?, ?, ?)",
  ).run(sessionId.data, "a.txt", "/tmp/a.txt");
  assertEquals(fileInsert.changes, 1);

  const eventInsert = db.prepare(
    "INSERT INTO Quiz_Events (session_id, prompt_text) VALUES (?, ?)",
  ).run(sessionId.data, "Hello");
  assertEquals(eventInsert.changes, 1);

  const deleteResult = repo.deleteSession(sessionId.data);
  assertEquals(deleteResult.ok, true);
  if (!deleteResult.ok) return;
  assertEquals(deleteResult.data, 1);

  const remainingFiles = db.prepare(
    "SELECT COUNT(*) AS count FROM Files WHERE session_id = ?",
  ).get(sessionId.data) as { count: number };
  const remainingEvents = db.prepare(
    "SELECT COUNT(*) AS count FROM Quiz_Events WHERE session_id = ?",
  ).get(sessionId.data) as { count: number };

  assertEquals(remainingFiles.count, 0);
  assertEquals(remainingEvents.count, 0);
});
