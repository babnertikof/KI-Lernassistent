import { DatabaseSync } from "node:sqlite";
import { getDBConnection } from "../index.ts";
import { DbResult, QuizQuestion, QuizQuestionSchema } from "../db_types.ts";
import {
  deleteRecord,
  getRecordById,
  insertRecord,
} from "../repositoryHelpers.ts";

export class QuizQuestionRepo {
  db;
  constructor(optDB?: DatabaseSync) {
    if(optDB){
      this.db=optDB
    } else{
      this.db=getDBConnection()
    }
  }
  tableName = "Quiz_Questions";
  idName = "question_id";

  addQuizQuestion(
    quizQuestion: Omit<QuizQuestion, "question_id">,
  ): DbResult<number> {
    return insertRecord(this.db, this.tableName, quizQuestion);
  }
  getQuizQuestion(question_id: number) {
    return getRecordById(
      this.db,
      this.tableName,
      this.idName,
      question_id,
      QuizQuestionSchema,
    );
  }
  deleteQuizQuestion(question_id: number): DbResult<number> {
    return deleteRecord(this.db, this.tableName, this.idName, question_id);
  }
  updateQuizQuestionText(
    question_id: number,
    newText: string,
  ): DbResult<number> {
    const query =
      "UPDATE Quiz_Questions SET question_text = ? WHERE question_id = ?";
    try {
      const result = this.db.prepare(query).run(newText, question_id);
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
