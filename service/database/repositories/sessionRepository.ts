import { DbResult, Session } from "../db_types.ts";
import { getDBConnection } from "../index.ts";

const db = getDBConnection()

export class SessionRepo {
  addSession(session: Session): DbResult<number> {
    try {
      const columns = Object.keys(session);
      const placeholders = columns.map(() => "?").join(", ");
      const query = `INSERT INTO Session (${columns.join(", ")}) VALUES (${placeholders})`;

      const result = db.prepare(query).run(...Object.values(session));

      return {
        ok: true,
        data: Number(result.lastInsertRowid),
      };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown database error",
      };
    }
  }

  deleteSession(session_id: number): DbResult<number> {
    try {
      const result = db.prepare("DELETE FROM Session WHERE session_id = ?").run(session_id);

      return {
        ok: true,
        data: Number(result.changes),
      };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown database error",
      };
    }
  }
}

Deno.test({name:"SQL Test",fn(){
    const repo = new SessionRepo
    console.log(repo.deleteSession(2))
}})