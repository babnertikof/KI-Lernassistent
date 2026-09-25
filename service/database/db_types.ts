export type DbResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export interface Session {
  session_id: number;
  start_datetime: string;
  user_id: number | null;
}

export interface FileRecord {
  file_id: number;
  session_id: number | null;
  filename: string;
  mimetype: string | null;
  file_path: string;
  upload_timestamp: string;
}

export interface QuizEvent {
  event_id: number;
  session_id: number | null;
  prompt_text: string;
  executed_model: string | null;
  extra_instruction: string | null;
  run_timestamp: string;
}

export interface QuizQuestion {
  question_id: number;
  event_id: number | null;
  question_text: string;
}

export interface ModelResponse {
  response_id: number;
  question_id: number | null;
  expected_answer: string | null;
  is_ground_truth: number; // 0 or 1
}

export interface UserSubmission {
  submission_id: number;
  question_id: number | null;
  user_answer: string;
  submission_timestamp: string;
}

export interface AssessmentScore {
  score_id: number;
  submission_id: number | null;
  correctness_score: number | null;
  completeness_score: number | null;
  feedback_text: string | null;
  graded_by: number | null;
  grading_timestamp: string;
}
