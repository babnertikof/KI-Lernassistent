import { DatabaseSync } from "node:sqlite";
import {
  AssessmentScore,
  AssessmentScoreSchema,
  DbResult,
} from "../db_types.ts";
import { getDBConnection } from "../index.ts";
import {
  deleteRecord,
  getRecordById,
  insertRecord,
} from "../repositoryHelpers.ts";
import type { SQLInputValue } from "node:sqlite";

export class AssessmentScoreRepo {
  db;
  constructor(optDB?: DatabaseSync) {
    if(optDB){
      this.db=optDB
    } else{
      this.db=getDBConnection()
    }
  }
  tableName = "Assessment_Scores";
  idName = "score_id";

  addAssessment(
    assessment: Omit<AssessmentScore, "score_id" | "grading_timestamp">,
  ): DbResult<number> {
    return insertRecord(this.db, this.tableName, assessment);
  }
  getAssessment(assessment_id: number): DbResult<AssessmentScore> {
    return getRecordById(
      this.db,
      this.tableName,
      this.idName,
      assessment_id,
      AssessmentScoreSchema,
    );
  }
  deleteAssessment(assessment_id: number): DbResult<number> {
    return deleteRecord(this.db, this.tableName, this.idName, assessment_id);
  }

  updateAssessmentScore(
    score_id: number,
    changes: Partial<
      Pick<
        AssessmentScore,
        | "correctness_score"
        | "completeness_score"
        | "feedback_text"
        | "graded_by"
      >
    >,
  ): DbResult<number> {
    const assignments: string[] = [];
    const values: SQLInputValue[] = [];

    if (changes.completeness_score !== undefined) {
      assignments.push("completeness_score = ?");
      values.push(changes.completeness_score);
    }
    if (changes.correctness_score !== undefined) {
      assignments.push("correctness_score = ?");
      values.push(changes.correctness_score);
    }
    if (changes.feedback_text !== undefined) {
      assignments.push("feedback_text = ?");
      values.push(changes.feedback_text);
    }
    if (changes.graded_by !== undefined) {
      assignments.push("graded_by = ?");
      values.push(changes.graded_by);
    }
    if (assignments.length === 0) {
      return { ok: false, error: "No assessment score fields provided" };
    }
    assignments.push("grading_timestamp = CURRENT_TIMESTAMP");

    try {
      const result = this.db.prepare(`
            UPDATE Assessment_Scores
            SET ${assignments.join(", ")}
            WHERE score_id = ?
            `).run(...values, score_id);
      return {
        ok: true,
        data: Number(result.changes),
      };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error
          ? error.message
          : "Unknown database error",
      };
    }
  }
}
