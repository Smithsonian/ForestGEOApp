'use client';

import { UploadCompleteProps } from '@/config/macros/uploadsystemmacros';
import Typography from '@mui/joy/Typography';
import { Box, Button, DialogActions, DialogTitle, LinearProgress, Modal, ModalDialog } from '@mui/joy';
import React, { useEffect, useState } from 'react';
import { useDataValidityContext } from '@/app/contexts/datavalidityprovider';
import { useOrgCensusListDispatch, usePlotListDispatch, useQuadratListDispatch } from '@/app/contexts/listselectionprovider';
import { useOrgCensusContext, usePlotContext, useSiteContext } from '@/app/contexts/userselectionprovider';
import { createAndUpdateCensusList } from '@/config/sqlrdsdefinitions/timekeeping';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { FailedMeasurementsRDS } from '@/config/sqlrdsdefinitions/core';
import moment from 'moment';

const ROWS_PER_BATCH = 100; // Number of rows to load per batch

export default function UploadComplete(props: Readonly<UploadCompleteProps>) {
  const { handleCloseUploadModal, errorRows } = props;
  const [progress, setProgress] = useState({ census: 0, plots: 0, quadrats: 0 });
  const [progressText, setProgressText] = useState({ census: '', plots: '', quadrats: '' });
  const [allLoadsCompleted, setAllLoadsCompleted] = useState(false);
  const [openUploadConfirmModal, setOpenUploadConfirmModal] = useState(false);

  const { triggerRefresh } = useDataValidityContext();

  const currentPlot = usePlotContext();
  const currentSite = useSiteContext();
  const currentCensus = useOrgCensusContext();

  const censusListDispatch = useOrgCensusListDispatch();
  const plotListDispatch = usePlotListDispatch();
  const quadratListDispatch = useQuadratListDispatch();

  const loadCensusData = async () => {
    if (!currentPlot) return;

    setProgressText(prev => ({ ...prev, census: 'Loading raw census data...' }));
    const response = await fetch(`/api/fetchall/census/${currentPlot.plotID}?schema=${currentSite?.schemaName || ''}`);
    const censusRDSLoad = await response.json();

    setProgressText(prev => ({ ...prev, census: 'Converting raw census data...' }));
    const censusList = await createAndUpdateCensusList(censusRDSLoad);
    if (censusListDispatch) {
      await censusListDispatch({ censusList });
    }
    setProgress(prev => ({ ...prev, census: 100 }));
    setProgressText(prev => ({ ...prev, census: 'Census data loaded.' }));
  };

  const loadPlotsData = async () => {
    if (!currentSite) return;

    setProgressText(prev => ({ ...prev, plots: 'Loading plot list information...' }));
    const plotsResponse = await fetch(`/api/fetchall/plots?schema=${currentSite?.schemaName || ''}`);
    const plotsData = await plotsResponse.json();
    if (!plotsData) return;

    setProgressText(prev => ({ ...prev, plots: 'Dispatching plot list information...' }));
    if (plotListDispatch) {
      await plotListDispatch({ plotList: plotsData });
    }
    setProgress(prev => ({ ...prev, plots: 100 }));
    setProgressText(prev => ({ ...prev, plots: 'Plot list information loaded.' }));
  };

  const loadQuadratsData = async () => {
    if (!currentPlot || !currentCensus) return;

    setProgressText(prev => ({ ...prev, quadrats: 'Loading quadrat list information...' }));
    const quadratsResponse = await fetch(
      `/api/fetchall/quadrats/${currentPlot.plotID}/${currentCensus.plotCensusNumber}?schema=${currentSite?.schemaName || ''}`
    );
    const quadratsData = await quadratsResponse.json();
    if (!quadratsData) return;

    setProgressText(prev => ({ ...prev, quadrats: 'Dispatching quadrat list information...' }));
    if (quadratListDispatch) {
      await quadratListDispatch({ quadratList: quadratsData });
    }
    setProgress(prev => ({ ...prev, quadrats: 100 }));
    setProgressText(prev => ({ ...prev, quadrats: 'Quadrat list information loaded.' }));
  };

  const [visibleRows, setVisibleRows] = useState<{ [filename: string]: number }>({});

  const loadMoreRows = (filename: string, totalRows: number) => {
    setVisibleRows(prev => ({
      ...prev,
      [filename]: Math.min((prev[filename] || 0) + ROWS_PER_BATCH, totalRows)
    }));
  };

  const downloadCSV = () => {
    const csvRows: string[] = [];
    Object.entries(errorRows).forEach(([filename, rowSet]) => {
      const headers = rowSet ? Object.keys(Object.values(rowSet)[0] || {}) : [];
      csvRows.push(`Filename,Row,${headers.join(',')}`); // Add headers
      Object.entries(rowSet).forEach(([rowKey, row]) => {
        const rowValues = headers.map(header => row[header] ?? 'NULL');
        csvRows.push(`${filename},${rowKey},${rowValues.join(',')}`);
      });
    });

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'error_rows.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  async function uploadFailedMeasurements() {
    const result: FailedMeasurementsRDS[] = [];

    // Iterate over each file in errorRows
    Object.values(errorRows).forEach(fileRowSet => {
      // Iterate over each row in the file
      Object.values(fileRowSet).forEach(fileRow => {
        const failedMeasurement: FailedMeasurementsRDS = {
          tag: fileRow['tag'] || undefined,
          stemTag: fileRow['stemtag'] || undefined,
          spCode: fileRow['spcode'] || undefined,
          x: fileRow['lx'] ? parseFloat(fileRow['lx']) : undefined,
          y: fileRow['ly'] ? parseFloat(fileRow['ly']) : undefined,
          dbh: fileRow['dbh'] ? parseFloat(fileRow['dbh']) : undefined,
          hom: fileRow['hom'] ? parseFloat(fileRow['hom']) : undefined,
          date: fileRow['date'] ? new Date(fileRow['date']) : undefined,
          codes: fileRow['codes'] || undefined
        };

        // Add the mapped object to the result array
        result.push(failedMeasurement);
      });
    });
    await fetch(`/api/batchedupload/${currentSite?.schemaName}/${currentPlot?.plotID}/${currentCensus?.dateRanges[0].censusID}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result)
    });
  }

  useEffect(() => {
    const runAsyncTasks = async () => {
      try {
        triggerRefresh();
        await Promise.all([loadCensusData(), loadPlotsData(), loadQuadratsData()]);
      } catch (error) {
        console.error(error);
      } finally {
        // handleCloseUploadModal();
        setAllLoadsCompleted(true);
      }
    };
    runAsyncTasks().catch(console.error);
  }, []);

  return (
    <Box
      sx={{
        display: 'flex',
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center'
      }}
    >
      {!allLoadsCompleted ? (
        <>
          <Typography variant={'solid'} level={'h1'} color={'success'}>
            Upload Complete!
          </Typography>
          <LinearProgress determinate value={progress.census} sx={{ width: '80%', margin: '1rem 0' }} />
          <Typography>{progressText.census}</Typography>
          <LinearProgress determinate value={progress.plots} sx={{ width: '80%', margin: '1rem 0' }} />
          <Typography>{progressText.plots}</Typography>
          <LinearProgress determinate value={progress.quadrats} sx={{ width: '80%', margin: '1rem 0' }} />
          <Typography>{progressText.quadrats}</Typography>
        </>
      ) : (
        <>
          <Typography fontWeight={'bold'} variant={'solid'} level={'h1'} color={'warning'}>
            The following rows were not uploaded due to errors:
          </Typography>
          <Box sx={{ marginBottom: 2, display: 'flex', flex: 1, flexDirection: 'row' }}>
            <Button variant="plain" onClick={downloadCSV}>
              Download All Errors as CSV
            </Button>
          </Box>
          <Box>
            {Object.entries(errorRows).map(([filename, rowSet]) => {
              const headers = rowSet ? Object.keys(Object.values(rowSet)[0] || {}) : [];
              const totalRows = Object.keys(rowSet).length;
              const rowsToShow = visibleRows[filename] || ROWS_PER_BATCH;

              return (
                <Box key={filename} mb={4}>
                  <Typography level="h3" gutterBottom>
                    File: {filename} (Showing {Math.min(rowsToShow, totalRows)} of {totalRows} rows)
                  </Typography>
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Row</TableCell>
                          {headers.map(header => (
                            <TableCell key={header}>{header}</TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {Object.entries(rowSet)
                          .slice(0, rowsToShow)
                          .map(([rowKey, row]) => (
                            <TableRow key={rowKey}>
                              <TableCell>{rowKey}</TableCell>
                              {headers.map(header => (
                                <TableCell key={header}>
                                  {moment.isDate(row[header]) ? moment(row[header]).format('YYYY-MM-DD HH:mm:ss') : row[header] !== null ? row[header] : 'NULL'}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  {rowsToShow < totalRows && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 2 }}>
                      <Button variant="outlined" onClick={() => loadMoreRows(filename, totalRows)}>
                        Load More Rows
                      </Button>
                    </Box>
                  )}
                </Box>
              );
            })}
          </Box>
          <Box sx={{ marginTop: 4 }}>
            <Button variant="soft" color="primary" onClick={() => setOpenUploadConfirmModal(true)}>
              Complete Upload
            </Button>
          </Box>
        </>
      )}
      <Modal open={openUploadConfirmModal} onClose={() => setOpenUploadConfirmModal(false)}>
        <ModalDialog role={'alertdialog'}>
          <DialogTitle>
            Error rows will be uploaded to the <strong>failedmeasurements</strong> table!
          </DialogTitle>
          <DialogActions>
            <Button variant={'soft'} onClick={() => setOpenUploadConfirmModal(false)}>
              Go Back
            </Button>
            <Button
              variant={'solid'}
              onClick={async () => {
                await uploadFailedMeasurements();
                setOpenUploadConfirmModal(false);
                handleCloseUploadModal();
              }}
            >
              I understand
            </Button>
          </DialogActions>
        </ModalDialog>
      </Modal>
    </Box>
  );
}
