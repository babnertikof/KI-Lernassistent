# Database Schema

This is the plan for the database. The real code that creates the tables lives
in `setup_db.ts`. The types that read the tables back out live in `db_types.ts`.

The database is one SQLite file called `database.db`.

## How the tables fit together

```
Session
  |
  +-- Files               (the uploaded study material)
  +-- Quiz_Events         (one quiz run)
        |
        +-- Quiz_Questions
              |
              +-- Model_Responses     (the correct answer from the AI)
              +-- User_Submissions    (the answer from the user)
                    |
                    +-- Assessment_Scores  (the grade)
```

Every child table has an `ON DELETE CASCADE`. Delete a `Session` and everything
under it is deleted too.

## Table: Session

Tracks one visit of one user.

| Column           | Type      | Rules                          |
| ---------------- | --------- | ------------------------------ |
| `session_id`     | INTEGER   | Primary key, auto-filled       |
| `start_datetime` | TIMESTAMP | Required, filled automatically |
| `user_id`        | INTEGER   | Optional                       |

## Table: Files

The documents the user uploaded. They are the material the questions come from.

| Column             | Type      | Rules                                      |
| ------------------ | --------- | ------------------------------------------ |
| `file_id`          | INTEGER   | Primary key, auto-filled                   |
| `session_id`       | INTEGER   | Optional, points to `Session`              |
| `filename`         | TEXT      | Required                                   |
| `mimetype`         | TEXT      | Optional                                   |
| `file_path`        | TEXT      | Required, where the file is stored on disk |
| `upload_timestamp` | TIMESTAMP | Filled automatically                       |

## Table: Quiz_Events

One quiz run. A session can have many of them.

| Column              | Type      | Rules                                       |
| ------------------- | --------- | ------------------------------------------- |
| `event_id`          | INTEGER   | Primary key, auto-filled                    |
| `session_id`        | INTEGER   | Optional, points to `Session`               |
| `prompt_text`       | TEXT      | Required, what the user asked for           |
| `executed_model`    | TEXT      | Optional, which AI model made the questions |
| `extra_instruction` | TEXT      | Optional, extra rules the user gave         |
| `run_timestamp`     | TIMESTAMP | Filled automatically                        |

## Table: Quiz_Questions

The questions from one quiz run.

| Column          | Type    | Rules                             |
| --------------- | ------- | --------------------------------- |
| `question_id`   | INTEGER | Primary key, auto-filled          |
| `event_id`      | INTEGER | Optional, points to `Quiz_Events` |
| `question_text` | TEXT    | Required                          |

Note: we had a `question_type` column here before. It is dropped. We only make
open short answer questions, so there is nothing to store.

## Table: Model_Responses

The correct answer that the AI gave for a question.

| Column            | Type    | Rules                                            |
| ----------------- | ------- | ------------------------------------------------ |
| `response_id`     | INTEGER | Primary key, auto-filled                         |
| `question_id`     | INTEGER | Optional, points to `Quiz_Questions`             |
| `expected_answer` | TEXT    | Optional                                         |
| `is_ground_truth` | INTEGER | Optional, `0` or `1`. SQLite has no real boolean |

## Table: User_Submissions

What the user typed as an answer.

| Column                 | Type      | Rules                                |
| ---------------------- | --------- | ------------------------------------ |
| `submission_id`        | INTEGER   | Primary key, auto-filled             |
| `question_id`          | INTEGER   | Optional, points to `Quiz_Questions` |
| `user_answer`          | TEXT      | Required                             |
| `submission_timestamp` | TIMESTAMP | Filled automatically                 |

## Table: Assessment_Scores

The grade for one answer from the user.

| Column               | Type      | Rules                                  |
| -------------------- | --------- | -------------------------------------- |
| `score_id`           | INTEGER   | Primary key, auto-filled               |
| `submission_id`      | INTEGER   | Optional, points to `User_Submissions` |
| `correctness_score`  | REAL      | Optional, 0 to 10                      |
| `completeness_score` | REAL      | Optional, 0 to 10                      |
| `feedback_text`      | TEXT      | Optional                               |
| `graded_by`          | INTEGER   | Optional                               |
| `grading_timestamp`  | TIMESTAMP | Filled automatically                   |

## Rules we agreed on

- Primary keys and timestamps are filled by SQLite. The `add` functions in the
  repositories do not ask for them.
- Optional columns can be `null`.
- `PRAGMA foreign_keys = ON` must be set on every connection, otherwise the
  cascade delete does nothing.
