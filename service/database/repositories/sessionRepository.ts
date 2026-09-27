import { DatabaseSync } from "node:sqlite";
import { DbResult, Session, SessionSchema } from "../db_types.ts";
import { getDBConnection } from "../index.ts";
import {
  deleteRecord,
  getRecordById,
  insertRecord,
} from "../repositoryHelpers.ts";

export class SessionRepo {
  db;
  constructor(optDB?: DatabaseSync) {
    if(optDB){
      this.db=optDB
    } else{
      this.db=getDBConnection()
    }
  }

  addSession(
    session: Omit<Session, "session_id" | "start_datetime" | "user_id"> & {
      user_id?: Session["user_id"];
    },
  ): DbResult<number> {
    return insertRecord(this.db, "Session", session);
  }

  getSession(session_id: number): DbResult<Session> {
    return getRecordById(
      this.db,
      "Session",
      "session_id",
      session_id,
      SessionSchema,
    );
  }

  deleteSession(session_id: number): DbResult<number> {
    return deleteRecord(this.db, "Session", "session_id", session_id);
  }
}
