import { DbResult, QuizEvent, QuizEventSchema } from "../db_types.ts";
import { getDBConnection } from "../index.ts";
import {
  deleteRecord,
  getRecordById,
  insertRecord,
  validateTypes,
} from "../repositoryHelpers.ts";

export class QuizEventRepo {
  db = getDBConnection();
  tableName = "Quiz_Events";
  idName = "event_id";

  addQuizEvent(
    event:
      & Omit<QuizEvent, "event_id" | "run_timestamp">
      & { extra_instruction?: QuizEvent["extra_instruction"] },
  ): DbResult<number> {
    return insertRecord(this.db, this.tableName, event);
  }

  getQuizEvent(event_id: number): DbResult<QuizEvent> {
    const result = getRecordById(
      this.db,
      this.tableName,
      this.idName,
      event_id,
    );
    if (!result.ok) {
      return result;
    }
    return validateTypes(QuizEventSchema, result.data);
  }

  deleteQuizEvent(event_id: number): DbResult<number> {
    return deleteRecord(this.db, this.tableName, this.idName, event_id);
  }
}

Deno.test({
  name: "QuizEventRepo Test",
  fn() {
    const repo = new QuizEventRepo();
    const addData = repo.addQuizEvent({
      session_id: null,
      prompt_text: "Hello",
      executed_model: null,
      extra_instruction: null,
    });
    console.log(addData);
    if (!addData.ok) {
      return;
    }
    const getData = repo.getQuizEvent(addData.data);
    console.log(getData);
    const removeData = repo.deleteQuizEvent(addData.data);
    console.log(removeData);
  },
});
