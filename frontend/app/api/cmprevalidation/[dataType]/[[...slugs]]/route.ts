import {getConn, runQuery} from "@/components/processors/processormacros";
import {PoolConnection} from "mysql2/promise";
import {NextRequest, NextResponse} from "next/server";
import {HTTPResponses} from "@/config/macros";

// datatype: table name
// expecting 1) schema 2) plotID 3) plotCensusNumber
export async function GET(_request: NextRequest, {params}: { params: { dataType: string, slugs?: string[] } }) {
  if (!params.slugs || !params.dataType) throw new Error("missing slugs");
  const [schema, plotID, plotCensusNumber] = params.slugs;
  if ((!schema || schema === 'undefined') || (!plotID || plotID === 'undefined') || (!plotCensusNumber || plotCensusNumber === 'undefined') || (params.slugs.length > 3 || params.slugs.length < 3)) throw new Error("incorrect slugs provided");

  let connection: PoolConnection | null = null;
  try {
    connection = await getConn();

    switch (params.dataType) {
      case 'attributes':
      case 'personnel':
      case 'species':
        let baseQuery = `SELECT 1 FROM ${schema}.${params.dataType} LIMIT 1`; // Check if the table has any row
        const baseResults = await runQuery(connection, baseQuery);
        if (connection) connection.release();
        if (baseResults.length === 0) return new NextResponse(null, {status: HTTPResponses.PRECONDITION_VALIDATION_FAILURE});
        break;
      case 'quadrats':
        let query = `SELECT 1 FROM ${schema}.${params.dataType} WHERE PlotID = ${plotID} AND CensusID IN (SELECT CensusID from ${schema}.census WHERE PlotCensusNumber = ${plotCensusNumber})`; // Check if the table has any row
        const results = await runQuery(connection, query);
        if (connection) connection.release();
        if (results.length === 0) return new NextResponse(null, {status: HTTPResponses.PRECONDITION_VALIDATION_FAILURE});
        break;
      case 'subquadrats':
        let subquadratsQuery = `SELECT 1
                                FROM ${schema}.${params.dataType} s
                                JOIN ${schema}.quadrats q ON s.QuadratID = q.QuadratID
                                WHERE q.PlotID = ${plotID}
                                  AND q.CensusID IN (SELECT CensusID from ${schema}.census WHERE PlotCensusNumber = ${plotCensusNumber}) LIMIT 1`;
        const subquadratsResults = await runQuery(connection, subquadratsQuery);
        if (connection) connection.release();
        if (subquadratsResults.length === 0) return new NextResponse(null, {status: HTTPResponses.PRECONDITION_VALIDATION_FAILURE});
        break;
      case 'quadratpersonnel':
        // Validation for quadrats table
        let quadratsQuery = `SELECT 1
                             FROM ${schema}.quadrats
                             WHERE PlotID = ${plotID}
                               AND CensusID IN (SELECT CensusID from ${schema}.census WHERE PlotCensusNumber = ${plotCensusNumber}) LIMIT 1`;
        const quadratsResults = await runQuery(connection, quadratsQuery);
        if (connection) connection.release();
        if (quadratsResults.length === 0) return new NextResponse(null, {status: HTTPResponses.PRECONDITION_VALIDATION_FAILURE});

        // Validation for personnel table
        let personnelQuery = `SELECT 1 FROM ${schema}.personnel LIMIT 1`;
        const personnelResults = await runQuery(connection, personnelQuery);
        if (connection) connection.release();
        if (personnelResults.length === 0) return new NextResponse(null, {status: HTTPResponses.PRECONDITION_VALIDATION_FAILURE});

        break;
      default:
        return new NextResponse(null, {status: HTTPResponses.PRECONDITION_VALIDATION_FAILURE});
    }
    // If all conditions are satisfied
    connection.release();
    return new NextResponse(null, {status: 200});
  } catch (e: any) {
    console.error(e);
    return new NextResponse(null, {status: HTTPResponses.PRECONDITION_VALIDATION_FAILURE});
  } finally {
    if (connection) connection.release();
  }
}
