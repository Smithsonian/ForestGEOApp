'use client';

import { Box, Paper, Typography } from '@mui/material';
import React, { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';
import '@/styles/validationtable.css';
import moment from 'moment';
import { GridCellParams, GridColDef, GridRowModel, GridRowsProp } from '@mui/x-data-grid';
import { StyledDataGrid } from '@/config/styleddatagrid';
import { FileCollectionRowSet, FileErrors, FileRow, FormType, getTableHeaders, RowValidationErrors, ValidationFunction } from '@/config/macros/formdetails';
import { usePlotContext } from '@/app/contexts/userselectionprovider';
import { Checkbox, Divider } from '@mui/joy';
import { validateSpeciesFormRow } from '@/config/sqlrdsdefinitions/taxonomies';
import { validateQuadratsRow, validateSubquadratsRow } from '@/config/sqlrdsdefinitions/zones';
import { validateMeasurementsRow } from '@/config/sqlrdsdefinitions/views';
import { validatePersonnelRow } from '@/config/sqlrdsdefinitions/personnel';

import { validateAttributesRow } from '@/config/sqlrdsdefinitions/core';

const validationFunctions: Record<string, ValidationFunction> = {
  attributes: validateAttributesRow,
  personnel: validatePersonnelRow,
  species: validateSpeciesFormRow,
  quadrats: validateQuadratsRow,
  subquadrats: validateSubquadratsRow,
  measurements: validateMeasurementsRow
};

export const validateRowByFormType = (formType: string, row: FileRow): RowValidationErrors | null => {
  const validationFunction = validationFunctions[formType];
  if (validationFunction) {
    return validationFunction(row);
  }
  return null;
};

export interface DisplayParsedDataProps {
  parsedData: FileCollectionRowSet;
  setParsedData: Dispatch<SetStateAction<FileCollectionRowSet>>;
  errors: FileCollectionRowSet;
  setErrors: Dispatch<SetStateAction<FileCollectionRowSet>>;
  errorRows: FileCollectionRowSet;
  setErrorRows: Dispatch<SetStateAction<FileCollectionRowSet>>;
  fileName: string;
  formType: FormType;
}

export const DisplayParsedDataGridInline: React.FC<DisplayParsedDataProps> = (props: Readonly<DisplayParsedDataProps>) => {
  const { parsedData, setParsedData, errors, setErrors, errorRows, setErrorRows, fileName, formType } = props;
  const [autoCorrectedParsedData, setAutoCorrectedParsedData] = useState<FileCollectionRowSet>(() => ({ ...parsedData }));
  const [tempParsedData, setTempParsedData] = useState<FileCollectionRowSet>(() => ({ ...parsedData }));
  const singleFileData = tempParsedData[fileName] || {};

  const currentPlot = usePlotContext();

  const tableHeaders = getTableHeaders(formType, currentPlot?.usesSubquadrats ?? false) || [];
  const [validRows, setValidRows] = useState<GridRowsProp>([]);
  const [correctedValidRows, setCorrectedValidRows] = useState<GridRowsProp>([]);
  const [invalidRows, setInvalidRows] = useState<GridRowsProp>([]);
  const [saveCorrections, setSaveCorrections] = useState<boolean>(false);

  const columns: GridColDef[] = useMemo(
    () =>
      tableHeaders.map(header => ({
        field: header.label,
        headerName: header.label,
        flex: 1,
        getCellClassName: (params: GridCellParams) => {
          if (saveCorrections) return '';
          const rowIndex = params.id.toString().split('-')[1];
          const errorKey = `row-${rowIndex}`;
          const cellError = errors[fileName]?.[errorKey]?.[header.label];
          return cellError ? 'error-cell' : '';
        },
        renderCell: (params: GridCellParams) => {
          if (header.label === 'date') {
            const formattedDate = params.value ? moment(params.value).format('YYYY-MM-DD') : '';
            return <Typography sx={{ whiteSpace: 'normal', lineHeight: 'normal' }}>{formattedDate}</Typography>;
          }

          const rowIndex = params.id.toString().split('-')[1];
          const errorKey = `row-${rowIndex}`;
          const cellError = errors[fileName]?.[errorKey]?.[header.label];

          // Extract the display value
          const displayValue = params.value;
          if (saveCorrections) {
            return (
              <Typography sx={{ whiteSpace: 'normal', lineHeight: 'normal' }}>
                {displayValue !== undefined && displayValue !== null ? displayValue.toString() : ''}
              </Typography>
            );
          }
          const isAutoFillCorrection =
            cellError &&
            (cellError.includes('were auto-filled based on table defaults') ||
              cellError.includes('was auto-calculated based on dimension submission') ||
              cellError === 'Genus was auto-filled based on species field.' ||
              cellError === 'Species field was split into genus and species.');

          return (
            <Box
              sx={{
                display: 'flex',
                flex: 1,
                flexDirection: 'column',
                marginY: 1.5
              }}
            >
              {cellError ? (
                <>
                  {isAutoFillCorrection ? (
                    <>
                      <Typography className="auto-fill-correction">
                        {displayValue !== undefined && displayValue !== null ? displayValue.toString() : ''}
                      </Typography>
                      <Divider orientation="horizontal" sx={{ marginY: 0.5 }} />
                      <Typography variant={'caption'} className="auto-fill-correction">
                        {cellError}
                      </Typography>
                    </>
                  ) : (
                    <>
                      <Typography className="error-cell">{displayValue !== undefined && displayValue !== null ? displayValue.toString() : ''}</Typography>
                      <Typography className="null-cell">NULL</Typography>
                    </>
                  )}
                </>
              ) : (
                <Typography sx={{ whiteSpace: 'normal', lineHeight: 'normal' }}>
                  {displayValue !== undefined && displayValue !== null ? displayValue.toString() : ''}
                </Typography>
              )}
            </Box>
          );
        },
        editable: false
      })),
    [tableHeaders, errors, fileName]
  );

  useEffect(() => {
    const tempValidRows: GridRowModel[] = [];
    const tempCorrectedValidRows: GridRowModel[] = [];
    const tempInvalidRows: GridRowModel[] = [];
    const tempErrors: FileErrors = {};
    const correctedDataCopy = { ...tempParsedData };

    Object.entries(singleFileData).forEach(([_rowKey, rowData], index) => {
      if (typeof rowData === 'object' && rowData !== null) {
        const row = { id: `${fileName}-${index}`, ...rowData } as FileRow;
        let rowErrors = validateRowByFormType(formType, row);

        // Check species/genus condition independently
        if (formType === 'species') {
          const [speciesField, genusField] = [row['species'], row['genus']];
          if (speciesField && !genusField) {
            const speciesWords = speciesField.trim().split(/\s+/);
            if (speciesWords.length === 2) {
              const [genus, species] = speciesWords;
              row['genus'] = genus;
              row['species'] = species;
              rowErrors = rowErrors || {};
              rowErrors['genus'] = 'Genus was auto-filled based on species field.';
              rowErrors['species'] = 'Species field was split into genus and species.';
            }
          }
        } else if (formType === 'quadrats') {
          rowErrors = rowErrors || {};
          const [coordinateUnits, dimensionUnits, areaUnits] = [row['coordinateunit'], row['dimensionunit'], row['areaunit']];
          if (!coordinateUnits) {
            row['coordinateunit'] = 'm';
            rowErrors['coordinateunit'] = 'Coordinate units were auto-filled based on table defaults.';
          }
          if (!dimensionUnits) {
            row['dimensionunit'] = 'm';
            rowErrors['dimensionunit'] = 'Dimension units were auto-filled based on table defaults.';
          }
          if (!areaUnits) {
            row['areaunit'] = 'm2';
            rowErrors['areaunit'] = 'Area units were auto-filled based on table defaults.';
          }

          const [area, dimx, dimy] = [row['area'], row['dimx'], row['dimy']];
          if (!area && dimx && dimy) {
            row['area'] = String(Number(dimx) * Number(dimy));
            rowErrors['area'] = 'Area was auto-calculated based on dimension submission. A square shape for the quadrat was assumed.';
          }
        } else if (formType === 'measurements') {
          rowErrors = rowErrors || {};
          const [coordinateUnits, dbhUnits, homUnits] = [row['coordinateunit'], row['dbhunit'], row['homunit']];
          if (!coordinateUnits) {
            row['coordinateunit'] = 'm';
            rowErrors['coordinateunit'] = 'Coordinate units were auto-filled based on table defaults.';
          }
          if (!dbhUnits) {
            row['dbhunit'] = 'mm';
            rowErrors['dbhunit'] = 'DBH units were auto-filled based on table defaults.';
          }
          if (!homUnits) {
            row['homunit'] = 'm';
            rowErrors['homunit'] = 'HOM units were auto-filled based on table defaults.';
          }
        }

        if (rowErrors) {
          tempInvalidRows.push(row);
          const errorKey = `row-${index}`;
          tempErrors[errorKey] = rowErrors;
        } else {
          tempValidRows.push(row);
        }
        tempCorrectedValidRows.push(row); // either way, send in row
        correctedDataCopy[fileName] = {
          ...correctedDataCopy[fileName],
          [`row-${index}`]: row
        };
      }
    });

    setValidRows(tempValidRows as GridRowsProp);
    setCorrectedValidRows(tempCorrectedValidRows as GridRowsProp);
    setInvalidRows(tempInvalidRows as GridRowsProp);

    // Set errors in the state
    setErrors((prevErrors: FileCollectionRowSet) => ({
      ...prevErrors,
      [fileName]: tempErrors
    }));
    setAutoCorrectedParsedData(correctedDataCopy);
  }, [singleFileData, fileName, formType, setErrors]);

  useEffect(() => {
    if (saveCorrections) setParsedData(autoCorrectedParsedData);
    else setParsedData(tempParsedData);
  }, [saveCorrections]);

  const processRowUpdate = React.useCallback(
    async (newRow: GridRowModel, oldRow: GridRowModel): Promise<GridRowModel> => {
      const updatedRow = { ...newRow };
      const rowId = `row-${newRow.id}`;
      if (!errorRows[fileName]?.[rowId]) {
        return oldRow;
      }

      const rowErrors = validateRowByFormType(formType, updatedRow);
      if (rowErrors) {
        setErrorRows(prevErrors => ({
          ...prevErrors,
          [fileName]: { ...prevErrors[fileName], [updatedRow.id]: rowErrors }
        }));
        Object.keys(rowErrors).forEach(key => {
          updatedRow[key] = null; // Set invalid values to null
        });
      } else {
        setErrorRows(prevErrors => {
          const newErrors = { ...prevErrors };
          if (newErrors[fileName]?.[updatedRow.id]) {
            delete newErrors[fileName][updatedRow.id];
          }
          return newErrors;
        });
      }

      setTempParsedData(prevData => ({
        ...prevData,
        [fileName]: { ...prevData[fileName], [updatedRow.id]: updatedRow }
      }));

      return updatedRow;
    },
    [setErrorRows, setTempParsedData, fileName, formType, validateRowByFormType]
  );

  return (
    <Paper style={{ height: '100%', width: '100%' }}>
      {!saveCorrections ? (
        <>
          {validRows.length > 0 && (
            <StyledDataGrid
              sx={{ display: 'flex', flex: 1, width: '100%' }}
              rows={validRows}
              columns={columns}
              processRowUpdate={processRowUpdate}
              pageSizeOptions={[5]}
              initialState={{
                pagination: {
                  paginationModel: {
                    pageSize: 5
                  }
                }
              }}
              autoHeight
              getRowHeight={() => 'auto'}
            />
          )}
          {invalidRows.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography color="gold">
                The following rows have been autocorrected to fit the schema. Please review the corrected rows and make sure they are correct.
                <br />
                <span style={{ color: 'red' }}>Red-highlighted text indicates invalid values that were detected and will be replaced with NULL.</span>
                <br />
                <span style={{ color: 'lightblue' }}>Light blue text indicates values that were auto-filled or auto-corrected based on other fields.</span>
              </Typography>
              <StyledDataGrid
                sx={{ display: 'flex', flex: 1, width: '100%' }}
                rows={invalidRows}
                columns={columns}
                pageSizeOptions={[5]}
                initialState={{
                  pagination: {
                    paginationModel: {
                      pageSize: 5
                    }
                  }
                }}
                autoHeight
                getRowHeight={() => 'auto'}
              />
            </Box>
          )}
        </>
      ) : (
        <>
          {correctedValidRows.length > 0 && (
            <StyledDataGrid
              sx={{ display: 'flex', flex: 1, width: '100%' }}
              rows={correctedValidRows}
              columns={columns}
              processRowUpdate={processRowUpdate}
              pageSizeOptions={[5]}
              initialState={{
                pagination: {
                  paginationModel: {
                    pageSize: 5
                  }
                }
              }}
              autoHeight
              getRowHeight={() => 'auto'}
            />
          )}
        </>
      )}
      <Checkbox
        sx={{ mt: 1 }}
        color={'primary'}
        variant={'soft'}
        onChange={event => setSaveCorrections(event.target.checked)}
        label={!saveCorrections ? 'Save Autocorrected Values to Data' : 'Autocorrected Data Saved!'}
      />
    </Paper>
  );
};
