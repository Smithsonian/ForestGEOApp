// quadrats datagrid
'use client';
import React, { useState } from 'react';
import { Box, Button, Typography } from '@mui/joy';
import { useSession } from 'next-auth/react';
import UploadParentModal from '@/components/uploadsystemhelpers/uploadparentmodal';
import Link from 'next/link';
import { quadratGridColumns } from '@/components/client/datagridcolumns';
import { FormType } from '@/config/macros/formdetails';
import { QuadratRDS } from '@/config/sqlrdsdefinitions/zones';
import IsolatedDataGridCommons from '@/components/datagrids/isolateddatagridcommons';
import { useOrgCensusContext, usePlotContext } from '@/app/contexts/userselectionprovider';
import MultilineModal from '@/components/datagrids/applications/multiline/multilinemodal';
import MultilineQuadratsDataGrid from '@/components/datagrids/applications/multiline/multilinequadratsdatagrid';

export default function IsolatedQuadratsDataGrid() {
  const currentPlot = usePlotContext();
  const currentCensus = useOrgCensusContext();
  const initialQuadratRDSRow: QuadratRDS = {
    id: 0,
    quadratID: 0,
    plotID: currentPlot?.plotID,
    censusID: currentCensus?.dateRanges[0].censusID,
    quadratName: '',
    startX: 0,
    startY: 0,
    coordinateUnits: 'm',
    dimensionX: 0,
    dimensionY: 0,
    dimensionUnits: 'm',
    area: 0,
    areaUnits: 'm2',
    quadratShape: ''
  };
  const [refresh, setRefresh] = useState(false);
  const { data: session } = useSession();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isManualEntryFormOpen, setIsManualEntryFormOpen] = useState(false);

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, width: '100%' }}>
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: 'warning.main',
            borderRadius: '4px',
            p: 2
          }}
        >
          <Box sx={{ flexGrow: 1 }}>
            {session?.user.userStatus !== 'field crew' && (
              <Typography level={'title-lg'} sx={{ color: '#ffa726' }}>
                Note: ADMINISTRATOR VIEW
              </Typography>
            )}
            <Typography level={'title-md'} sx={{ color: '#ffa726' }}>
              Note: This is a locked view and will not allow modification.
            </Typography>
            <Typography level={'body-md'} sx={{ color: '#ffa726' }}>
              Please use this view as a way to confirm changes made to measurements.
            </Typography>
          </Box>

          <Button
            onClick={() => {
              setIsUploadModalOpen(true);
            }}
            color={'primary'}
          >
            Upload Quadrats
          </Button>
          <Button onClick={() => setIsManualEntryFormOpen(true)} variant={'solid'} color={'primary'}>
            Manual Entry Form
          </Button>
          {/* Link to Quadrat Personnel Data Grid */}
          <Link href="/fixeddatainput/quadratpersonnel" passHref>
            <Button variant="solid" color="primary" sx={{ ml: 2 }}>
              View Quadrat Personnel
            </Button>
          </Link>
        </Box>
      </Box>
      <UploadParentModal
        isUploadModalOpen={isUploadModalOpen}
        handleCloseUploadModal={() => {
          setIsUploadModalOpen(false);
          setRefresh(true);
        }}
        formType={FormType.quadrats}
      />
      <MultilineModal
        isManualEntryFormOpen={isManualEntryFormOpen}
        handleCloseManualEntryForm={() => setIsManualEntryFormOpen(false)}
        formComponent={<MultilineQuadratsDataGrid />}
      />
      <IsolatedDataGridCommons
        gridType="quadrats"
        gridColumns={quadratGridColumns}
        refresh={refresh}
        setRefresh={setRefresh}
        initialRow={initialQuadratRDSRow}
        fieldToFocus={'quadratName'}
        clusters={{
          Name: ['quadratName'],
          Coordinates: ['startX', 'startY', 'coordinateUnits'],
          Dimensions: ['dimensionX', 'dimensionY', 'dimensionUnits'],
          Area: ['area', 'areaUnits'],
          Misc: ['quadratShape']
        }}
      />
    </>
  );
}
