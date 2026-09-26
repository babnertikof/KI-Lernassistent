import { DbResult, UserSubmission, UserSubmissionSchema } from "../db_types.ts";
import { getDBConnection } from "../index.ts";
import {
  deleteRecord,
  getRecordById,
  insertRecord,
} from "../repositoryHelpers.ts";

export class UserSubmissionRepo {
  db = getDBConnection();
  tableName = "User_Submissions";
  idName = "submission_id";

  addUserSubmission(
    userSubmission: Omit<
      UserSubmission,
      "submission_id" | "submission_timestamp"
    >,
  ): DbResult<number> {
    return insertRecord(this.db, this.tableName, userSubmission);
  }

  getUserSubmission(submission_id: number): DbResult<UserSubmission> {
    return getRecordById(
      this.db,
      this.tableName,
      this.idName,
      submission_id,
      UserSubmissionSchema,
    );
  }

  deleteUserSubmission(submission_id: number): DbResult<number> {
    return deleteRecord(this.db, this.tableName, this.idName, submission_id);
  }
  updateUserAnswer(submission_id: number, newAnswer: string): DbResult<number> {
    try {
      const query =
        "UPDATE User_Submissions SET user_answer = ? WHERE submission_id = ?";
      const result = this.db.prepare(query).run(newAnswer, submission_id);
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
