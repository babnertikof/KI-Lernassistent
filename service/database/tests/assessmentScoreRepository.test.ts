import { assertEquals } from "@std/assert";
import { AssessmentScoreRepo } from "../repositories/assessmentScoreRepository.ts";
import { createTestDb } from "./testDb.ts";

Deno.test("AssessmentScoreRepo updates only provided fields and rejects empty updates", () => {
  const db = createTestDb();
  const repo = new AssessmentScoreRepo(db);

  const sessionId = Number(db.prepare("INSERT INTO Session (user_id) VALUES (?)").run(1).lastInsertRowid);
  const eventId = Number(db.prepare("INSERT INTO Quiz_Events (session_id, prompt_text) VALUES (?, ?)").run(sessionId, "prompt").lastInsertRowid);
  const questionId = Number(db.prepare("INSERT INTO Quiz_Questions (event_id, question_text) VALUES (?, ?)").run(eventId, "Q?").lastInsertRowid);
  const submissionId = Number(db.prepare("INSERT INTO User_Submissions (question_id, user_answer) VALUES (?, ?)").run(questionId, "answer").lastInsertRowid);

  const insertResult = repo.addAssessment({
    submission_id: submissionId,
    correctness_score: 0.2,
    completeness_score: 0.4,
    feedback_text: "draft",
    graded_by: 9,
  });

  assertEquals(insertResult.ok, true);
  if (!insertResult.ok) return;

  const scoreId = insertResult.data;
  const updateResult = repo.updateAssessmentScore(scoreId, {
    correctness_score: 0.9,
    feedback_text: "final",
  });

  assertEquals(updateResult.ok, true);
  if (!updateResult.ok) return;

  const readBack = repo.getAssessment(scoreId);
  assertEquals(readBack.ok, true);
  if (!readBack.ok) return;
  assertEquals(readBack.data.correctness_score, 0.9);
  assertEquals(readBack.data.feedback_text, "final");
  assertEquals(readBack.data.completeness_score, 0.4);

  const emptyUpdate = repo.updateAssessmentScore(scoreId, {});
  assertEquals(emptyUpdate.ok, false);
  if (emptyUpdate.ok) return;
  assertEquals(emptyUpdate.error, "No assessment score fields provided");
});
