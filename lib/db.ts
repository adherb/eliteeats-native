import {
  RDSDataClient,
  ExecuteStatementCommand,
  BeginTransactionCommand,
  CommitTransactionCommand,
  RollbackTransactionCommand,
  Field,
  ColumnMetadata,
} from "@aws-sdk/client-rds-data";

const client = new RDSDataClient({
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

const dbParams = {
  secretArn: process.env.RDS_SECRET_ARN,
  resourceArn: process.env.RDS_ARN,
  database: "strong_curves",
};

export async function query<T>(sql: string, params: any[] = []): Promise<T[]> {
  // console.log("Executing SQL:", sql);
  // console.log("With parameters:", JSON.stringify(params, null, 2));

  try {
    // Convert parameters to the format expected by ExecuteStatementCommand
    const parameters = params.map((param) => ({
      name: param.name,
      value:
        param.value === null || param.value === undefined
          ? { isNull: true }
          : typeof param.value === "number"
          ? { longValue: param.value }
          : { stringValue: param.value.toString() },
    }));

    const result = await client.send(
      new ExecuteStatementCommand({
        resourceArn: process.env.RDS_ARN,
        secretArn: process.env.RDS_SECRET_ARN,
        database: process.env.RDS_DATABASE_NAME,
        sql,
        parameters,
        includeResultMetadata: true,
      })
    );

    // console.log("Raw result:", JSON.stringify(result, null, 2));

    if (!result.records || result.records.length === 0) {
      console.log("No records in result");
      return [];
    }

    // Extract column names from the first record
    if (!result.columnMetadata) {
      console.error("No column metadata in result");
      throw new Error("No column metadata in result");
    }

    const columnNames = result.columnMetadata.map((col) => col.name || "");
    // console.log("Column names:", columnNames);

    return result.records.map((record, recordIndex) => {
      const item: any = {};
      record.forEach((field, index) => {
        const columnName = columnNames[index] || `column${index}`;
        let value: any = null;

        if (field.stringValue !== undefined) {
          value = field.stringValue;
        } else if (field.longValue !== undefined) {
          value = field.longValue;
        } else if (field.doubleValue !== undefined) {
          value = field.doubleValue;
        } else if (field.booleanValue !== undefined) {
          value = field.booleanValue;
        } else if (field.isNull) {
          value = null;
        } else {
          console.error(
            `Unexpected field type in record ${recordIndex}, field ${index}:`,
            field
          );
        }

        item[columnName] = value;
      });
      return item as T;
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Database query error:", error.message);
      console.error("Error name:", error.name);
      console.error("Error stack:", error.stack);
    } else {
      console.error("Unknown error:", error);
    }
    throw new Error(
      `Database query failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

function parseRdsData<T extends Record<string, unknown>>(
  records: Field[][],
  columnMetadata: ColumnMetadata[]
): T[] {
  return records.map((record) => {
    const item: Partial<T> = {};
    record.forEach((field, index) => {
      // Strip the table alias from the column name
      const columnName = columnMetadata[index].name?.split(".").pop() ?? "";
      let value: string | number | boolean | null = null;

      if (field.stringValue !== undefined) value = field.stringValue;
      else if (field.longValue !== undefined) value = field.longValue;
      else if (field.doubleValue !== undefined) value = field.doubleValue;
      else if (field.booleanValue !== undefined) value = field.booleanValue;
      else if (field.isNull === true) value = null;
      // Add other field types as needed (e.g., blobValue, arrayValue)

      // console.log(`Setting ${columnName} to ${value}`);
      (item as Record<string, unknown>)[columnName] = value;
    });
    return item as T;
  });
}

// Helper function to execute multiple queries in a transaction
const transaction = async <T extends Record<string, unknown>>(
  queries: { sql: string; parameters: { name: string; value: any }[] }[]
): Promise<T[][]> => {
  let transactionId;
  try {
    // Begin transaction
    const beginCommand = new BeginTransactionCommand(dbParams);
    const beginResult = await client.send(beginCommand);
    transactionId = beginResult.transactionId;

    const results: T[][] = [];
    for (const q of queries) {
      const command = new ExecuteStatementCommand({
        ...dbParams,
        transactionId,
        sql: q.sql,
        parameters: q.parameters.map((param) => ({
          name: param.name,
          value:
            param.value === null
              ? { isNull: true }
              : typeof param.value === "number"
              ? { longValue: param.value }
              : { stringValue: param.value.toString() },
        })),
      });
      const result = await client.send(command);
      if (result.records && result.columnMetadata) {
        results.push(parseRdsData<T>(result.records, result.columnMetadata));
      } else {
        results.push([]);
      }
    }

    // Commit transaction
    const commitCommand = new CommitTransactionCommand({
      ...dbParams,
      transactionId,
    });
    await client.send(commitCommand);

    return results;
  } catch (error) {
    console.error("Transaction error:", error);
    if (transactionId) {
      // Rollback transaction
      const rollbackCommand = new RollbackTransactionCommand({
        ...dbParams,
        transactionId,
      });
      await client.send(rollbackCommand);
    }
    throw error;
  }
};

export { transaction, client, parseRdsData };
