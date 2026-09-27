import { DatabaseSync } from "node:sqlite";
import { DbResult, QuizEvent, QuizEventSchema } from "../db_types.ts";
import { getDBConnection } from "../index.ts";
import {
  deleteRecord,
  getRecordById,
  insertRecord,
} from "../repositoryHelpers.ts";

export class QuizEventRepo {
  db;
  constructor(optDB?: DatabaseSync) {
    if(optDB){
      this.db=optDB
    } else{
      this.db=getDBConnection()
    }
  }
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
    return getRecordById(
      this.db,
      this.tableName,
      this.idName,
      event_id,
      QuizEventSchema,
    );
  }

  deleteQuizEvent(event_id: number): DbResult<number> {
    return deleteRecord(this.db, this.tableName, this.idName, event_id);
  }
}
