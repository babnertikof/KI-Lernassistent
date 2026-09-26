import { DbResult, ModelResponse, ModelResponseSchema } from "../db_types.ts";
import { getDBConnection } from "../index.ts";
import {
  deleteRecord,
  getRecordById,
  insertRecord,
} from "../repositoryHelpers.ts";

export class ModelResponseRepo {
  db = getDBConnection();
  tableName = "Model_Responses";
  idName = "response_id";
  addModelResponse(
    modelResponse: Omit<ModelResponse, "response_id">,
  ): DbResult<number> {
    return insertRecord(this.db, this.tableName, modelResponse);
  }
  getModelResponse(response_id: number): DbResult<ModelResponse> {
    return getRecordById(
      this.db,
      this.tableName,
      this.idName,
      response_id,
      ModelResponseSchema,
    );
  }
  deleteModelResponse(response_id: number): DbResult<number> {
    return deleteRecord(this.db, this.tableName, this.idName, response_id);
  }
}
