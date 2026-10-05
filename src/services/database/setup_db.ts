import { DatabaseSync } from "node:sqlite";

const db = new DatabaseSync("database.db");
db.exec("PRAGMA foreign_keys = ON;");

// 3. Execute the DDL script to create all tables
db.exec(`
  -- Table: Session
  CREATE TABLE IF NOT EXISTS Session (
    session_id INTEGER PRIMARY KEY AUTOINCREMENT,
    start_datetime TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    user_id INTEGER
  );

  -- Table: Files
  CREATE TABLE IF NOT EXISTS Files (
    file_id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER,
    filename TEXT NOT NULL,
    mimetype TEXT,
    file_path TEXT NOT NULL,
    upload_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES Session(session_id) ON DELETE CASCADE
  );

  -- Table: Quiz_Events
  CREATE TABLE IF NOT EXISTS Quiz_Events (
    event_id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER,
    prompt_text TEXT NOT NULL,
    executed_model TEXT,
    extra_instruction TEXT,
    run_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES Session(session_id) ON DELETE CASCADE
  );

  -- Table: Quiz_Questions
  CREATE TABLE IF NOT EXISTS Quiz_Questions (
    question_id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER,
    question_text TEXT NOT NULL,
    FOREIGN KEY (event_id) REFERENCES Quiz_Events(event_id) ON DELETE CASCADE
  );

  -- Table: Model_Responses
  CREATE TABLE IF NOT EXISTS Model_Responses (
    response_id INTEGER PRIMARY KEY AUTOINCREMENT,
    question_id INTEGER,
    expected_answer TEXT,
    is_ground_truth INTEGER, -- SQLite uses 0/1 for BOOLEAN
    FOREIGN KEY (question_id) REFERENCES Quiz_Questions(question_id) ON DELETE CASCADE
  );

  -- Table: User_Submissions
  CREATE TABLE IF NOT EXISTS User_Submissions (
    submission_id INTEGER PRIMARY KEY AUTOINCREMENT,
    question_id INTEGER,
    user_answer TEXT NOT NULL,
    submission_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (question_id) REFERENCES Quiz_Questions(question_id) ON DELETE CASCADE
  );

  -- Table: Assessment_Scores
  CREATE TABLE IF NOT EXISTS Assessment_Scores (
    score_id INTEGER PRIMARY KEY AUTOINCREMENT,
    submission_id INTEGER,
    correctness_score REAL,
    completeness_score REAL,
    feedback_text TEXT,
    graded_by INTEGER,
    grading_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (submission_id) REFERENCES User_Submissions(submission_id) ON DELETE CASCADE
  );
`);

console.log(
  "Database 'quiz_app.db' has been successfully created with your schema!",
);

// 4. Safely close the database connection
db.close();
