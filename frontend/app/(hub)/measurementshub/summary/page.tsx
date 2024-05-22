'use client';
import React, {useEffect, useState} from "react";
import {GridRowModes, GridRowModesModel, GridRowsProp} from "@mui/x-data-grid";
import {Alert, AlertProps, LinearProgress, Tooltip, TooltipProps, styled, tooltipClasses} from "@mui/material";
import DataGridCommons from "@/components/datagrids/datagridcommons";
import {MeasurementsSummaryGridColumns} from '@/config/sqlrdsdefinitions/views/measurementssummaryviewrds';
import {
  Box,
  IconButton,
  ListItemContent,
  ListItem,
  List,
  Modal,
  ModalDialog,
  Typography,
  Button,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Stack,
} from "@mui/joy";
import Select, {SelectOption} from "@mui/joy/Select";
import {useSession} from "next-auth/react";
import {
  useCensusContext,
  usePlotContext,
  useQuadratContext,
  useQuadratDispatch,
  useSiteContext
} from "@/app/contexts/userselectionprovider";
import {randomId} from "@mui/x-data-grid-generator";
import UploadParentModal from "@/components/uploadsystemhelpers/uploadparentmodal";
import {useQuadratListContext} from "@/app/contexts/listselectionprovider";
import {Quadrat} from "@/config/sqlrdsdefinitions/tables/quadratrds";
import Option from '@mui/joy/Option';
import MeasurementSummaryGrid from "@/components/datagrids/msvdatagrid";
import {useDataValidityContext} from "@/app/contexts/datavalidityprovider";
import {UnifiedValidityFlags} from "@/config/macros";

const LargeTooltip = styled(({className, ...props}: TooltipProps) => (
  <Tooltip {...props} classes={{popper: className}}/>
))(({theme}) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    fontSize: 16,
    maxWidth: 600, // Increase maxWidth to give more space for text
  },
}));

interface ChecklistProgress {
  progress: number;
  message: string;
  error?: string;
}

export default function SummaryPage() {
  const {data: session} = useSession();
  const [quadrat, setQuadrat] = useState<Quadrat>();
  const [quadratList, setQuadratList] = useState<Quadrat[] | undefined>([]);
  let currentPlot = usePlotContext();
  let currentCensus = useCensusContext();
  let currentSite = useSiteContext();
  let quadratListContext = useQuadratListContext();
  let currentQuadrat = useQuadratContext();
  const quadratDispatch = useQuadratDispatch();
  const {validity, recheckValidityIfNeeded} = useDataValidityContext();
  const [progressDialogOpen, setProgressDialogOpen] = useState(false);
  const [isUploadAllowed, setIsUploadAllowed] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [triggerGlobalError, setTriggerGlobalError] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  useEffect(() => {
    if (currentPlot) {
      // ensure that selectable list is restricted by selected plot
      setQuadratList(quadratListContext?.filter(quadrat => quadrat?.plotID === currentPlot.plotID) || undefined);
    }
  }, [currentPlot, quadratListContext]);

  const initialRows: GridRowsProp = [
    {
      id: 0,
      coreMeasurementID: 0,
      plotID: currentPlot?.plotID,
      plotName: currentPlot?.plotName,
      censusID: currentCensus?.censusID,
      censusStartDate: currentCensus?.startDate,
      censusEndDate: currentCensus?.endDate,
      quadratID: currentQuadrat?.quadratID,
      quadratName: currentQuadrat?.quadratName,
      subquadratID: 0,
      subquadratName: '',
      speciesID: 0,
      speciesCode: '',
      treeID: 0,
      treeTag: '',
      stemID: 0,
      stemTag: '',
      stemLocalX: 0,
      stemLocalY: 0,
      stemUnits: '',
      personnelID: 0,
      personnelName: '',
      measurementDate: undefined,
      measuredDBH: 0,
      dbhUnits: '',
      measuredHOM: 0,
      homUnits: '',
      description: '',
      attributes: [],
    }
  ];

  const [rows, setRows] = React.useState(initialRows);
  const [rowCount, setRowCount] = useState(0); // total number of rows
  const [rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>({});
  const [snackbar, setSnackbar] = React.useState<Pick<AlertProps, 'children' | 'severity'> | null>(null);
  const [refresh, setRefresh] = useState(false);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [isNewRowAdded, setIsNewRowAdded] = useState<boolean>(false);
  const [shouldAddRowAfterFetch, setShouldAddRowAfterFetch] = useState(false);

  useEffect(() => {
    const verifyPreconditions = async () => {
      setIsUploadAllowed(!Object.values(validity).includes(false));
    };

    if (progressDialogOpen) {
      verifyPreconditions().catch(console.error);
    }
  }, [progressDialogOpen, validity]);

  const addNewRowToGrid = () => {
    const id = randomId();
    // Define new row structure based on MeasurementsSummaryRDS type
    const newRow = {
      id: id,
      coreMeasurementID: 0,
      plotID: currentPlot?.plotID,
      plotName: currentPlot?.plotName,
      censusID: currentCensus?.censusID,
      censusStartDate: currentCensus?.startDate,
      censusEndDate: currentCensus?.endDate,
      quadratID: currentQuadrat?.quadratID,
      quadratName: currentQuadrat?.quadratName,
      subquadratID: 0,
      subquadratName: '',
      speciesID: 0,
      speciesCode: '',
      treeID: 0,
      treeTag: '',
      stemID: 0,
      stemTag: '',
      stemLocalX: 0,
      stemLocalY: 0,
      stemUnits: '',
      personnelID: 0,
      personnelName: '',
      measurementDate: undefined,
      measuredDBH: 0,
      dbhUnits: '',
      measuredHOM: 0,
      homUnits: '',
      description: '',
      attributes: [],
      isNew: true,
    };
    setRows(oldRows => [...oldRows, newRow]);
    setRowModesModel(oldModel => ({...oldModel, [id]: {mode: GridRowModes.Edit}}));
  };

  const handleCloseGlobalError = () => {
    setGlobalError(null);
    setTriggerGlobalError(false);
  };

  const handleCloseProgressDialog = () => {
    setProgressDialogOpen(false);
    if (isUploadAllowed) {
      setTimeout(() => {
        setIsUploadModalOpen(true);
      }, 300);
    } else {
      setGlobalError('Missing prerequisites! Please upload supporting data before submitting measurements!');
      setTriggerGlobalError(true);
    }
  };

  const checklistItems: (keyof UnifiedValidityFlags)[] = ['attributes', 'species', 'personnel', 'quadrats', 'subquadrats'];

  const ProgressDialog = () => (
    <Modal
      open={progressDialogOpen}
      onClose={() => {
      }}
      sx={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}
    >
      <ModalDialog
        size="lg"
        sx={{width: '100%', maxHeight: '100vh', overflow: 'auto'}}
        role="alertdialog"
      >
        <DialogTitle>Pre-Validation Systems Check</DialogTitle>
        <DialogContent>
          <Typography level={'title-lg'}>Measurements Upload Warning:</Typography>
          <Typography level={'body-lg'}>
            In order to upload measurements, all of the following tables must be populated!
          </Typography>
          <List>
            {checklistItems.map((item) => {
              const isValid = validity[item];
              const progressData = isValid
                ? {
                  progress: 100,
                  message: `Passed: ${item.charAt(0).toUpperCase() + item.substring(1)}`,
                  error: undefined
                }
                : {
                  progress: 0,
                  message: `Failure: ${item.charAt(0).toUpperCase() + item.substring(1)}`,
                  error: `${item.charAt(0).toUpperCase() + item.substring(1)} is invalid or missing.`
                };
              const tooltipMessage = progressData.error
                ? `${progressData.error}`
                : progressData.message;

              return (
                <ListItem sx={{alignItems: 'center', display: 'flex', flexDirection: 'row'}} key={item}>
                  <ListItemContent sx={{minWidth: '160px', mr: 2, my: 'auto'}}>
                    <Typography level={'body-md'}>{progressData.message}</Typography>
                  </ListItemContent>
                  <LargeTooltip title={tooltipMessage} placement="top" arrow>
                    <Box sx={{width: '100%', maxWidth: 'calc(100% - 180px)', my: 'auto'}}>
                      <LinearProgress
                        variant="determinate"
                        value={progressData.progress}
                        color={isValid ? 'primary' : 'error'}
                        sx={{width: '100%', height: 8}}
                      />
                    </Box>
                  </LargeTooltip>
                </ListItem>
              );
            })}
          </List>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setProgressDialogOpen(false);
            }}
            color="primary"
          >
            Cancel
          </Button>
          <Button
            disabled={!isUploadAllowed}
            onClick={handleCloseProgressDialog}
            color={!isUploadAllowed ? 'danger' : 'success'}
          >
            {isUploadAllowed ? 'Continue to Upload' : 'Key Data Missing!'}
          </Button>
        </DialogActions>
      </ModalDialog>
    </Modal>
  );

  const renderQuadratValue = (option: SelectOption<string> | null) => {
    if (!option) {
      return <Typography>Select a Quadrat</Typography>; // or some placeholder JSX
    }

    // Find the corresponding Quadrat object
    const selectedValue = option.value; // assuming option has a 'value' property
    const selectedQuadrat = quadratListContext?.find(c => c?.quadratName === selectedValue);

    // Return JSX
    return selectedQuadrat ? <Typography>{`Quadrat: ${selectedQuadrat?.quadratName}`}</Typography> :
      <Typography>No Quadrat</Typography>;
  };

  const handleQuadratSelection = async (selectedQuadrat: Quadrat | undefined) => {
    setQuadrat(selectedQuadrat);
    if (quadratDispatch) {
      await quadratDispatch({quadrat: selectedQuadrat});
    }
  };

  const handleConfirmQuadrat = async () => {
    await handleQuadratSelection(quadrat);
  };

  const QuadratSelectionMenu = () => (
    <Stack direction="column" spacing={2} marginBottom={2}>
      <Typography level="title-sm">Select Quadrat:</Typography>
      <Select
        disabled={!validity['quadrats']}
        placeholder="Select a Quadrat"
        name="None"
        required
        autoFocus
        size="md"
        renderValue={renderQuadratValue}
        onChange={async (_event: React.SyntheticEvent | null, newValue: string | null) => {
          const selectedQuadrat = quadratList?.find(quadrat => quadrat?.quadratName === newValue) || undefined;
          setQuadrat(selectedQuadrat);
        }}
      >
        <Option value="">None</Option>
        {quadratList?.map((item) => (
          <Option value={item?.quadratName} key={item?.quadratName}>
            <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}>
              <Typography level="body-lg">{item?.quadratName}</Typography>
            </Box>
          </Option>
        ))}
      </Select>
      <Button onClick={handleConfirmQuadrat} size="sm" color="primary">Confirm</Button>
      {!validity['quadrats'] && (
        <Alert severity="warning" sx={{mt: 2}}>
          <Typography level="body-lg" color="warning">No quadrats exist to be selected.</Typography>
        </Alert>
      )}
    </Stack>
  );

  return (
    <>
      {globalError && (
        <Snackbar open={triggerGlobalError} autoHideDuration={6000} onClose={handleCloseGlobalError}>
          <Alert onClose={handleCloseGlobalError} severity="error">{globalError}</Alert>
        </Snackbar>
      )}
      <Box sx={{display: 'flex', alignItems: 'center', mb: 3, width: '100%'}}>
        <ProgressDialog/>
        <Box sx={{
          width: '100%', display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', backgroundColor: 'warning.main', borderRadius: '4px', p: 2
        }}>
          <Stack direction="column">
            <Box sx={{display: 'flex', flexDirection: 'column', flexGrow: 1}}>
              {session?.user.isAdmin && (
                <Typography level={"title-lg"} sx={{color: "#ffa726"}}>Note: ADMINISTRATOR VIEW</Typography>
              )}
              <Typography level={"title-md"} sx={{color: "#ffa726"}}>Note: This is a locked view and will not allow
                modification.</Typography>
              <Typography level={"body-md"} sx={{color: "#ffa726"}}>Please use this view as a way to confirm changes
                made to measurements.</Typography>
            </Box>
          </Stack>
          <Box sx={{flexGrow: 1, display: 'flex', justifyContent: 'left', marginLeft: '5%'}}>
            <QuadratSelectionMenu/>
          </Box>
          <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
            <Button onClick={() => setProgressDialogOpen(true)} variant="solid" color="primary">Upload</Button>
          </Box>
        </Box>
      </Box>
      <UploadParentModal
        isUploadModalOpen={isUploadModalOpen}
        handleCloseUploadModal={() => {
          setIsUploadModalOpen(false);
          setRefresh(true);
        }}
        formType={"measurements"}
      />
      <MeasurementSummaryGrid
        locked={!validity['quadrats'] && !currentQuadrat}
        gridColumns={MeasurementsSummaryGridColumns}
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
        addNewRowToGrid={addNewRowToGrid}
      />
    </>
  );
}
