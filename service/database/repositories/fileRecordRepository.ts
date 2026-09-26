import { DbResult, FileRecord, FileRecordSchema } from "../db_types.ts";
import { getDBConnection } from "../index.ts";
import {
  deleteRecord,
  getRecordById,
  insertRecord,
} from "../repositoryHelpers.ts";

export class FileRecordRepo {
  db = getDBConnection();
  table_name = "Files";
  addFileRecord(fileRecord: FileRecord): DbResult<number> {
    return insertRecord(this.db, this.table_name, fileRecord);
  }
  deleteFileRecord(FileRecord_id: number): DbResult<number> {
    return deleteRecord(this.db, this.table_name, "file_id", FileRecord_id);
  }
  getFileRecord(FileRecord_id: number): DbResult<FileRecord> {
    return getRecordById(
      this.db,
      this.table_name,
      "session_id",
      FileRecord_id,
      FileRecordSchema,
    );
  }
  updateFilePath(fileId: number, newPath: string): DbResult<number> {
    try {
      const query = "UPDATE Files SET file_path = ? WHERE file_id = ?";
      const result = this.db.prepare(query).run(newPath, fileId);

      return { ok: true, data: Number(result.changes) };
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
