"use client";
import {
  GridColDef,
  GridRenderCellParams,
  GridRowId,
  GridRowModes,
  GridRowModesModel,
  GridRowsProp
} from "@mui/x-data-grid";
import {AlertProps} from "@mui/material";
import React, {useCallback, useState} from "react";
import {PersonnelRDS, QuadratsGridColumns, QuadratsGridColumns as BaseQuadratsGridColumns} from "@/config/sqlmacros";
import {usePlotContext, useSiteContext} from "@/app/contexts/userselectionprovider";
import {randomId} from "@mui/x-data-grid-generator";
import DataGridCommons from "@/components/datagridcommons";
import {PersonnelAutocompleteMultiSelect} from "@/components/forms/personnelautocompletemultiselect";

export default function QuadratsPage() {
  const initialRows: GridRowsProp = [
    {
      id: 0,
      quadratID: 0,
      plotID: 0,
      quadratName: '',
      dimensionX: 0,
      dimensionY: 0,
      area: 0,
      quadratShape: '',
      personnel: [],
    },
  ]
  const [rows, setRows] = React.useState(initialRows);
  const [rowCount, setRowCount] = useState(0);  // total number of rows
  const [rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>({});
  const [snackbar, setSnackbar] = React.useState<Pick<
    AlertProps,
    'children' | 'severity'
  > | null>(null);
  const [refresh, setRefresh] = useState(false);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [isNewRowAdded, setIsNewRowAdded] = useState<boolean>(false);
  const [shouldAddRowAfterFetch, setShouldAddRowAfterFetch] = useState(false);
  const [personnel, setPersonnel] = useState<PersonnelRDS[]>([]);
  let currentSite = useSiteContext();
  let currentPlot = usePlotContext();

  const addNewRowToGrid = () => {
    const id = randomId();
    const nextQuadratID = (rows.length > 0
      ? rows.reduce((max, row) => Math.max(row.quadratID, max), 0)
      : 0) + 1;
    const newRow = {
      id: id,
      quadratID: nextQuadratID,
      plotID: currentPlot ? currentPlot.id : 0,
      quadratName: '',
      dimensionX: 0,
      dimensionY: 0,
      area: 0,
      quadratShape: '',
      personnel: [],
      isNew: true,
    };
    // Add the new row to the state
    setRows(oldRows => [...oldRows, newRow]);
    // Set editing mode for the new row
    setRowModesModel(oldModel => ({
      ...oldModel,
      [id]: {mode: GridRowModes.Edit, fieldToFocus: 'quadratName'},
    }));
  };

  const updatePersonnelInRows = useCallback((id: GridRowId, newPersonnel: PersonnelRDS[]) => {
    setRows(rows => rows.map(row =>
      row.id === id
        ? { ...row, personnel: newPersonnel.map(person => ({ ...person })) }
        : row
    ));
  }, []);

  const handlePersonnelChange = useCallback(
    async (rowId: GridRowId, selectedPersonnel: PersonnelRDS[]) => {
      const quadratId = rows.find((row) => row.id === rowId)?.quadratID;
      const personnelIds = selectedPersonnel.map(person => person.personnelID);

      try {
        const response = await fetch(`/api/updatepersonnel?quadratID=${quadratId}&schema=${currentSite?.schemaName ?? ''}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(personnelIds)
        });

        if (!response.ok) {
          setSnackbar({children: `Personnel updates failed!`, severity: 'error'});
          throw new Error('Failed to update personnel');
        }

        // Handle successful response
        const responseData = await response.json();
        // Optionally, refresh the data grid or take other UI actions
        updatePersonnelInRows(rowId, selectedPersonnel);
        setRefresh(true);
        setSnackbar({children: `${responseData.message}`, severity: 'success'});
      } catch (error) {
        console.error("Error updating personnel:", error);
      }
    },
    []
  );

  const quadratsGridColumns: GridColDef[] = [...BaseQuadratsGridColumns,
    {
      field: 'personnel',
      headerName: 'Personnel',
      flex: 1,
      renderCell: (params) => (
        <PersonnelAutocompleteMultiSelect
          initialValue={params.row.personnel}
          onChange={(newPersonnel) => handlePersonnelChange(params.id, newPersonnel)}
          locked={!rowModesModel[params.id] || rowModesModel[params.id].mode !== GridRowModes.Edit}
        />
      ),
    }
  ]

  return (
    <DataGridCommons
      gridType="quadrats"
      gridColumns={quadratsGridColumns}
      rows={rows}
      setRows={setRows}
      rowCount={rowCount}
      setRowCount={setRowCount}
      rowModesModel={rowModesModel}
      setRowModesModel={setRowModesModel}
      snackbar={snackbar}
      setSnackbar={setSnackbar}
      refresh={refresh}
      setRefresh={setRefresh}
      paginationModel={paginationModel}
      setPaginationModel={setPaginationModel}
      isNewRowAdded={isNewRowAdded}
      setIsNewRowAdded={setIsNewRowAdded}
      shouldAddRowAfterFetch={shouldAddRowAfterFetch}
      setShouldAddRowAfterFetch={setShouldAddRowAfterFetch}
      currentPlot={currentPlot}
      addNewRowToGrid={addNewRowToGrid}
    />
  );
}