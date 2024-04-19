import {PoolConnection, PoolOptions} from 'mysql2/promise';
import {booleanToBit} from "@/config/macros";
import {FileRow} from "@/config/macros/formdetails";

import {processSpecies} from "@/components/processors/processspecies";
import * as fs from "fs";
import {NextRequest} from "next/server";
import {processQuadrats} from "@/components/processors/processquadrats";
import {processCensus} from "@/components/processors/processcensus";
import {PoolMonitor} from "@/config/poolmonitor";

export async function getConn() {
  let conn: PoolConnection | null = null;
  try {
    let i = 0;
    console.log("Attempting to get SQL connection");
    conn = await getSqlConnection(i);
    console.log("SQL connection obtained");
  } catch (error: any) {
    console.error("Error processing files:", error.message);
    throw new Error(error.message);
  }
  if (!conn) {
    console.error("Container client or SQL connection is undefined.");
    throw new Error('conn empty');
  }
  conn.on('release', () => {
    console.log("Connection released back to pool");
  });
  return conn;
}

export interface SpecialProcessingProps {
  connection: PoolConnection;
  rowData: FileRow;
  schema: string;
  plotID?: number;
  censusID?: number;
  fullName?: string;
  unitOfMeasurement?: string;
}

export interface InsertUpdateProcessingProps extends SpecialProcessingProps {
  formType: string;
}

export type FileMapping = {
  tableName: string;
  columnMappings: { [fileColumn: string]: string };
  specialProcessing?: (props: Readonly<SpecialProcessingProps>) => Promise<number | null>;
};
// Define the mappings for each file type
export const fileMappings: Record<string, FileMapping> = {
  "attributes": {
    tableName: "Attributes",
    columnMappings: {
      "code": "Code",
      "description": "Description",
      "status": "Status"
    }
  },
  "personnel": {
    tableName: "Personnel",
    columnMappings: {
      "firstname": "FirstName",
      "lastname": "LastName",
      "role": "Role"
    }
  },
  "species": {
    tableName: "",
    columnMappings: {
      "spcode": "Species.SpeciesCode",
      "genus": "Genus.GenusName",
      "species": "Species.SpeciesName",
      "IDLevel": "Species.IDLevel",
      "family": "Species.Family",
      "authority": "Species.Authority"
    },
    specialProcessing: processSpecies
  },
  "quadrats": {
    tableName: "",
    columnMappings: {
      "quadrat": "Quadrats.QuadratName",
      "dimx": "Quadrats.DimensionX",
      "dimy": "Quadrats.DimensionY"
    },
    specialProcessing: processQuadrats
  },
  "measurements": {
    tableName: "", // Multiple tables involved
    columnMappings: {
      "tag": "Trees.TreeTag",
      "stemtag": "Stems.StemTag",
      "spcode": "Species.SpeciesCode",
      "quadrat": "Quadrats.QuadratName",
      "lx": "Stems.StemQuadX",
      "ly": "Stems.StemQuadY",
      "dbh": "CoreMeasurements.MeasuredDBH",
      "codes": "Attributes.Code",
      "hom": "CoreMeasurement.MeasuredHOM",
      "date": "CoreMeasurement.MeasurementDate",
    },
    specialProcessing: processCensus
  },
};
const sqlConfig: PoolOptions = {
  user: process.env.AZURE_SQL_USER!, // better stored in an app setting such as process.env.DB_USER
  password: process.env.AZURE_SQL_PASSWORD!, // better stored in an app setting such as process.env.DB_PASSWORD
  host: process.env.AZURE_SQL_SERVER!, // better stored in an app setting such as process.env.DB_SERVER
  port: parseInt(process.env.AZURE_SQL_PORT!), // optional, defaults to 1433, better stored in an app setting such as process.env.DB_PORT
  database: process.env.AZURE_SQL_DATABASE!, // better stored in an app setting such as process.env.DB_NAME
  ssl: {ca: fs.readFileSync("DigiCertGlobalRootCA.crt.pem")}
}
export const poolMonitor = new PoolMonitor(sqlConfig);
// const pool = mysql.createPool(sqlConfig);

// Function to get a connection from the pool
export async function getSqlConnection(tries: number): Promise<PoolConnection> {
  try {
    const connection = await poolMonitor.getConnection();
    await connection.ping(); // Use ping to check the connection
    return connection; // Resolve the connection when successful
  } catch (err) {
    if (tries == 5) {
      console.error("!!! Cannot connect !!! Error:", err);
      throw err;
    } else {
      console.log("Connection attempt failed --> trying again");
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait a bit before retrying
      return getSqlConnection(tries + 1); // Retry and return the promise
    }
  }
}

export async function runQuery(connection: PoolConnection, query: string, params?: any[]): Promise<any> {
  try {
    // Check if the query is for calling a stored procedure
    if (query.trim().startsWith('CALL')) {
      // Use `connection.query` for stored procedures
      const [rows] = await connection.query(query, params);
      return rows;
    } else {
      // Use `connection.execute` for standard SQL queries
      const [rows, _fields] = await connection.execute(query, params);

      // Check if the query is an INSERT, UPDATE, or DELETE
      if (query.trim().startsWith('INSERT') || query.trim().startsWith('UPDATE') || query.trim().startsWith('DELETE')) {
        return rows; // This will include insertId, affectedRows, etc.
      }
      return rows; // This is for SELECT queries and will return RowDataPacket[]
    }
  } catch (error: any) {
    console.error('Error executing query:', error.message);
    throw error;
  }
}

// Helper function to get value or default
function getValueOrDefault(value: any, defaultValue = null) {
  return value ?? defaultValue;
}

// Function to transform request body into data object
function transformRequestBody(requestBody: any) {
  return {
    CoreMeasurementID: getValueOrDefault(requestBody.coreMeasurementID),
    CensusID: getValueOrDefault(requestBody.censusID),
    PlotID: getValueOrDefault(requestBody.plotID),
    QuadratID: getValueOrDefault(requestBody.quadratID),
    TreeID: getValueOrDefault(requestBody.treeID),
    StemID: getValueOrDefault(requestBody.stemID),
    PersonnelID: getValueOrDefault(requestBody.personnelID),
    IsRemeasurement: booleanToBit(getValueOrDefault(requestBody.isRemeasurement)),
    IsCurrent: booleanToBit(getValueOrDefault(requestBody.isCurrent)),
    IsPrimaryStem: booleanToBit(getValueOrDefault(requestBody.IsPrimaryStem)),
    IsValidated: booleanToBit(getValueOrDefault(requestBody.IsValidated)),
    MeasurementDate: requestBody.measurementDate ? new Date(requestBody.measurementDate) : null,
    MeasuredDBH: getValueOrDefault(requestBody.measuredDBH),
    MeasuredHOM: getValueOrDefault(requestBody.measuredHOM),
    Description: getValueOrDefault(requestBody.description),
    UserDefinedFields: getValueOrDefault(requestBody.userDefinedFields),
  };
}

export async function parseCoreMeasurementsRequestBody(request: NextRequest) {
  const requestBody = await request.json();
  return transformRequestBody(requestBody);
}

export async function parseAttributeRequestBody(request: NextRequest, parseType: string) {
  const requestBody = await request.json();
  switch (parseType) {
    case 'POST':
    case 'PATCH': {
      return {
        Code: requestBody.code,
        Description: requestBody.description ?? null,
        Status: requestBody.status ?? null,
      };
    }
    default:
      throw new Error("Invalid parse type -- attributes");
  }
}

export async function parseCensusRequestBody(request: NextRequest) {
  const requestBody = await request.json();
  return {
    CensusID: requestBody.censusID,
    PlotID: requestBody.plotID ?? null,
    PlotCensusNumber: requestBody.plotCensusNumber ?? null,
    StartDate: requestBody.startDate ? new Date(requestBody.startDate) : null,
    EndDate: requestBody.endDate ? new Date(requestBody.endDate) : null,
    Description: requestBody.description ?? null,
  }
}

export async function parseStemRequestBody(request: NextRequest) {
  const requestBody = await request.json();
  return {
    StemID: requestBody.stemID,
    TreeID: requestBody.treeID ?? null,
    QuadratID: requestBody.quadratID ?? null,
    StemNumber: requestBody.stemNumber ?? null,
    StemTag: requestBody.stemTag ?? null,
    StemPlotX: requestBody.stemPlotX ?? null,
    StemPlotY: requestBody.stemPlotY ?? null,
    StemPlotZ: requestBody.stemPlotZ ?? null,
    StemQuadX: requestBody.stemQuadX ?? null,
    StemQuadY: requestBody.stemQuadY ?? null,
    StemQuadZ: requestBody.stemQuadZ ?? null,
    Moved: requestBody.moved ?? null,
    StemDescription: requestBody.stemDescription ?? null,
  }
}

export async function parsePersonnelRequestBody(request: NextRequest) {
  const requestBody = await request.json();
  return {
    PersonnelID: requestBody.personnelID,
    FirstName: requestBody.firstName ?? null,
    LastName: requestBody.lastName ?? null,
    Role: requestBody.role ?? null,
  };
}

export async function parseQuadratsRequestBody(request: NextRequest) {
  const requestBody = await request.json();
  return {
    QuadratID: requestBody.quadratID,
    PlotID: requestBody.plotID,
    CensusID: requestBody.censusID,
    QuadratName: requestBody.quadratName,
    DimensionX: requestBody.dimensionX,
    DimensionY: requestBody.dimensionY,
    Area: requestBody.area,
    QuadratShape: requestBody.quadratShape,
    Personnel: requestBody.personnel
  };
}

export async function parseSpeciesRequestBody(request: NextRequest) {
  const requestBody = await request.json();
  return {
    SpeciesID: requestBody.speciesID,
    GenusID: requestBody.genusID ?? null,
    CurrentTaxonFlag: booleanToBit(requestBody.currentTaxonFlag) ?? null,
    ObsoleteTaxonFlag: booleanToBit(requestBody.obsoleteTaxonFlag) ?? null,
    SpeciesName: requestBody.speciesName ?? null,
    SpeciesCode: requestBody.speciesCode ?? null,
    IDLevel: requestBody.idLevel ?? null,
    Authority: requestBody.authority ?? null,
    FieldFamily: requestBody.fieldFamily ?? null,
    Description: requestBody.description ?? null,
    ReferenceID: requestBody.referenceID ?? null,
  };
}

export async function parseSubSpeciesRequestBody(request: NextRequest) {
  const requestBody = await request.json();
  return {
    SubSpeciesID: requestBody.subSpeciesID,
    SpeciesID: requestBody.speciesID ?? null,
    SubSpeciesName: requestBody.subSpeciesName ?? null,
    SubSpeciesCode: requestBody.subSpeciesCode ?? null,
    CurrentTaxonFlag: booleanToBit(requestBody.currentTaxonFlag) ?? null,
    ObsoleteTaxonFlag: booleanToBit(requestBody.obsoleteTaxonFlag) ?? null,
    Authority: requestBody.authority ?? null,
    InfraSpecificLevel: requestBody.infraSpecificLevel ?? null,
  };
}

// New function to extract environment variables
export function getSchema() {
  const schema = process.env.AZURE_SQL_SCHEMA;
  if (!schema) throw new Error("Environmental variable extraction for schema failed");
  return schema;
}

export function getCatalogSchema() {
  const catalogSchema = process.env.AZURE_SQL_CATALOG_SCHEMA;
  if (!catalogSchema) throw new Error('Environmental variable extraction for catalog schema failed');
  return catalogSchema;
}

export type ValidationResponse = {
  totalRows: number;
  failedRows: number;
  message: string;
  failedCoreMeasurementIDs?: number[];
}
export type UpdateValidationResponse = {
  rowsValidated: any;
}

