import { assertEquals } from "@std/assert";
import { ModelResponseRepo } from "../repositories/modelResponseRepository.ts";
import { createTestDb } from "./testDb.ts";

Deno.test("ModelResponseRepo accepts 0, 1, and null for is_ground_truth", () => {
  const db = createTestDb();
  const repo = new ModelResponseRepo(db);

  const sessionId = Number(db.prepare("INSERT INTO Session (user_id) VALUES (?)").run(1).lastInsertRowid);
  const eventId = Number(db.prepare("INSERT INTO Quiz_Events (session_id, prompt_text) VALUES (?, ?)").run(sessionId, "prompt").lastInsertRowid);
  const questionId = Number(db.prepare("INSERT INTO Quiz_Questions (event_id, question_text) VALUES (?, ?)").run(eventId, "Q?").lastInsertRowid);

  for (const value of [0, 1, null] as const) {
    const result = repo.addModelResponse({
      question_id: questionId,
      expected_answer: "answer",
      is_ground_truth: value,
    });

    assertEquals(result.ok, true);
    if (!result.ok) continue;

    const readBack = repo.getModelResponse(result.data);
    assertEquals(readBack.ok, true);
    if (!readBack.ok) continue;
    assertEquals(readBack.data.is_ground_truth, value);
  }
});
