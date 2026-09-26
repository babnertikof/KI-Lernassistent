import { DbResult, FileRecord, FileRecordSchema } from "../db_types.ts";
import { getDBConnection } from "../index.ts";
import {
  deleteRecord,
  getRecordById,
  insertRecord,
  validateTypes,
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
    const result = getRecordById(
      this.db,
      this.table_name,
      "session_id",
      FileRecord_id,
    );
    if (!result.ok) {
      return result;
    }

    return validateTypes(FileRecordSchema, result.data);
  }
}
