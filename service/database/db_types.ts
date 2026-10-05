import * as v from "@valibot/valibot";

export type DbResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export const SessionSchema = v.object({
  session_id: v.number(),
  start_datetime: v.string(),
  user_id: v.nullable(v.number()),
});

export type Session = v.InferOutput<typeof SessionSchema>;

export const FileRecordSchema = v.object({
  file_id: v.number(),
  session_id: v.nullable(v.number()),
  filename: v.string(),
  mimetype: v.nullable(v.string()),
  file_path: v.string(),
  upload_timestamp: v.string(),
});
export type FileRecord = v.InferOutput<typeof FileRecordSchema>;

export const QuizEventSchema = v.object({
  event_id: v.number(),
  session_id: v.nullable(v.number()),
  prompt_text: v.string(),
  executed_model: v.nullable(v.string()),
  extra_instruction: v.nullable(v.string()),
  run_timestamp: v.string(),
});
export type QuizEvent = v.InferOutput<typeof QuizEventSchema>;

export const QuizQuestionSchema = v.object({
  question_id: v.number(),
  event_id: v.nullable(v.number()),
  question_text: v.string(),
});
export type QuizQuestion = v.InferOutput<typeof QuizQuestionSchema>;

export const ModelResponseSchema = v.object({
  response_id: v.number(),
  question_id: v.nullable(v.number()),
  expected_answer: v.nullable(v.string()),
  is_ground_truth: v.nullable(v.union([v.literal(0), v.literal(1)])),
});
export type ModelResponse = v.InferOutput<typeof ModelResponseSchema>;

export const UserSubmissionSchema = v.object({
  submission_id: v.number(),
  question_id: v.nullable(v.number()),
  user_answer: v.string(),
  submission_timestamp: v.string(),
});
export type UserSubmission = v.InferOutput<typeof UserSubmissionSchema>;

export const AssessmentScoreSchema = v.object({
  score_id: v.number(),
  submission_id: v.nullable(v.number()),
  correctness_score: v.nullable(v.number()),
  completeness_score: v.nullable(v.number()),
  feedback_text: v.nullable(v.string()),
  graded_by: v.nullable(v.number()),
  grading_timestamp: v.string(),
});
export type AssessmentScore = v.InferOutput<typeof AssessmentScoreSchema>;
