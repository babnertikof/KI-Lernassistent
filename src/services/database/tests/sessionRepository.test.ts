import { assertEquals, assertExists } from "@std/assert";
import { SessionRepo } from "../repositories/sessionRepository.ts";
import { createTestDb } from "./testDb.ts";

Deno.test("SessionRepo add/get/delete works on a fresh in-memory DB", () => {
  const db = createTestDb();
  const repo = new SessionRepo(db);

  const addResult = repo.addSession({
    user_id: 42,
  });

  assertEquals(addResult.ok, true);
  if (!addResult.ok) return;

  const sessionId = addResult.data;
  const getResult = repo.getSession(sessionId);

  assertEquals(getResult.ok, true);
  if (!getResult.ok) return;

  assertExists(getResult.data.session_id);
  assertEquals(getResult.data.user_id, 42);

  const deleteResult = repo.deleteSession(sessionId);
  assertEquals(deleteResult.ok, true);
  if (!deleteResult.ok) return;
  assertEquals(deleteResult.data, 1);
});

Deno.test("SessionRepo returns not found for missing rows", () => {
  const db = createTestDb();
  const repo = new SessionRepo(db);

  const result = repo.getSession(999999);
  assertEquals(result.ok, false);
});
