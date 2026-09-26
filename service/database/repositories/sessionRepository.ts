import { DbResult, Session, SessionSchema } from "../db_types.ts";
import { getDBConnection } from "../index.ts";
import {
  deleteRecord,
  getRecordById,
  insertRecord,
  validateTypes,
} from "../repositoryHelpers.ts";

export class SessionRepo {
  db = getDBConnection();

  addSession(session: Omit<Session, "session_id" | "start_datetime" | "user_id"> & {
    user_id?: Session["user_id"]}): DbResult<number> {
    return insertRecord(this.db, "Session", session);
  }

  getSession(session_id: number): DbResult<Session> {
    const result = getRecordById(this.db, "Session", "session_id", session_id);

    if (!result.ok) {
      return result;
    }

    return validateTypes(SessionSchema, result.data);
  }

  deleteSession(session_id: number): DbResult<number> {
    return deleteRecord(this.db, "Session", "session_id", session_id);
  }
}

Deno.test({
  name: "SQL Test",
  fn() {
    const repo = new SessionRepo();
    console.log(repo.deleteSession(4))
  },
});
