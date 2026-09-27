import { z } from "@zod/zod";

export type DbResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export const SessionSchema = z.object({
  session_id: z.number(),
  start_datetime: z.string(),
  user_id: z.number().nullable(),
});
export type Session = z.infer<typeof SessionSchema>;

export const FileRecordSchema = z.object({
  file_id: z.number(),
  session_id: z.number().nullable(),
  filename: z.string(),
  mimetype: z.string().nullable(),
  file_path: z.string(),
  upload_timestamp: z.string(),
});
export type FileRecord = z.infer<typeof FileRecordSchema>;

export const QuizEventSchema = z.object({
  event_id: z.number(),
  session_id: z.number().nullable(),
  prompt_text: z.string(),
  executed_model: z.string().nullable(),
  extra_instruction: z.string().nullable(),
  run_timestamp: z.string(),
});
export type QuizEvent = z.infer<typeof QuizEventSchema>;

export const QuizQuestionSchema = z.object({
  question_id: z.number(),
  event_id: z.number().nullable(),
  question_text: z.string(),
});
export type QuizQuestion = z.infer<typeof QuizQuestionSchema>;

export const ModelResponseSchema = z.object({
  response_id: z.number(),
  question_id: z.number().nullable(),
  expected_answer: z.string().nullable(),
  is_ground_truth: z.union([z.literal(0), z.literal(1)]).nullable(),
});
export type ModelResponse = z.infer<typeof ModelResponseSchema>;

export const UserSubmissionSchema = z.object({
  submission_id: z.number(),
  question_id: z.number().nullable(),
  user_answer: z.string(),
  submission_timestamp: z.string(),
});
export type UserSubmission = z.infer<typeof UserSubmissionSchema>;

export const AssessmentScoreSchema = z.object({
  score_id: z.number(),
  submission_id: z.number().nullable(),
  correctness_score: z.number().nullable(),
  completeness_score: z.number().nullable(),
  feedback_text: z.string().nullable(),
  graded_by: z.number().nullable(),
  grading_timestamp: z.string(),
});
export type AssessmentScore = z.infer<typeof AssessmentScoreSchema>;
