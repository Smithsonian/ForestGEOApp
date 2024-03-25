/**
 * macros for sql table props:
 */
import {DataGrid, GridColDef, GridEditCellProps} from '@mui/x-data-grid';
import {styled} from '@mui/material/styles';

export const StyledDataGrid = styled(DataGrid)(({theme}) => ({
  border: 0,
  color:
    theme.palette.mode === 'light' ? 'rgba(0,0,0,.85)' : 'rgba(255,255,255,0.85)',
  fontFamily: [
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    'Roboto',
    '"Helvetica Neue"',
    'Arial',
    'sans-serif',
    '"Apple Color Emoji"',
    '"Segoe UI Emoji"',
    '"Segoe UI Symbol"',
  ].join(','),
  WebkitFontSmoothing: 'auto',
  letterSpacing: 'normal',
  '& .MuiDataGrid-columnsContainer': {
    backgroundColor: theme.palette.mode === 'light' ? '#fafafa' : '#1d1d1d',
  },
  '& .MuiDataGrid-iconSeparator': {
    display: 'none',
  },
  '& .MuiDataGrid-columnHeader, .MuiDataGrid-cell': {
    borderRight: `1px solid ${
      theme.palette.mode === 'light' ? '#f0f0f0' : '#303030'
    }`,
  },
  '& .MuiDataGrid-columnsContainer, .MuiDataGrid-cell': {
    borderBottom: `1px solid ${
      theme.palette.mode === 'light' ? '#f0f0f0' : '#303030'
    }`,
  },
  '& .MuiDataGrid-cell': {
    color:
      theme.palette.mode === 'light' ? 'rgba(0,0,0,.85)' : 'rgba(255,255,255,0.65)',
  },
  '& .MuiPaginationItem-root': {
    borderRadius: 0,
  },
}));

export type SitesRDS = {
  siteID: number;
  siteName: string;
  schemaName: string;
}


export type MeasurementsSummaryRDS = {
  id: number;
  coreMeasurementID: number;
  plotID: number | null;
  plotName: string | null;
  plotCensusNumber: number | null;
  censusStartDate: any;
  censusEndDate: any;
  quadratName: string | null;
  treeTag: string | null;
  stemTag: string | null;
  stemQuadX: number | null;
  stemQuadY: number | null;
  stemQuadZ: number | null;
  speciesName: string | null;
  subSpeciesName: string | null;
  genus: string | null;
  family: string | null;
  personnelName: string | null;
  measurementDate: any;
  measuredDBH: number | null;
  measuredHOM: number | null;
  description: string | null;
  attributes: string | null;
  validationErrors: string[] | null;
}

export const MeasurementsSummaryGridColumns: GridColDef[] = [
  {field: 'coreMeasurementID', headerName: '#', headerClassName: 'header', flex: 1, align: 'left'},
  // {field: 'plotName', headerName: 'Plot Name', headerClassName: 'header', flex: 1, align: 'left',},
  // {field: 'plotCensusNumber', headerName: 'Plot Census', headerClassName: 'header', flex: 1, align: 'left',},
  // {
  //   field: 'censusStartDate',
  //   headerName: 'Census Start',
  //   type: "string",
  //   headerClassName: 'header',
  //   flex: 1,
  //   valueGetter: (params) => {
  //     if (!params.value) return null;
  //     return new Date(params.value).toDateString();
  //   }
  // },
  // {
  //   field: 'censusEndDate',
  //   headerName: 'Census End',
  //   type: "string",
  //   headerClassName: 'header',
  //   flex: 1,
  //   valueGetter: (params) => {
  //     if (!params.value) return null;
  //     return new Date(params.value).toDateString();
  //   }
  // },
  {field: 'quadratName', headerName: 'Quadrat', headerClassName: 'header', flex: 1, align: 'left',},
  {field: 'treeTag', headerName: 'Tag', headerClassName: 'header', flex: 1, align: 'left',},
  {field: 'stemTag', headerName: 'Stem', headerClassName: 'header', flex: 1, align: 'left',},
  // {field: 'stemQuadX', headerName: 'Stem X', headerClassName: 'header', flex: 1, align: 'left',},
  // {field: 'stemQuadY', headerName: 'Stem Y', headerClassName: 'header', flex: 1, align: 'left',},
  // {field: 'stemQuadZ', headerName: 'Stem Z', headerClassName: 'header', flex: 1, align: 'left',},
  {field: 'speciesName', headerName: 'Species', headerClassName: 'header', flex: 1, align: 'left',},
  // {field: 'subSpeciesName', headerName: 'SubSpecies', headerClassName: 'header', flex: 1, align: 'left',},
  // {field: 'genus', headerName: 'Genus', headerClassName: 'header', flex: 1, align: 'left',},
  // {field: 'family', headerName: 'Family', headerClassName: 'header', flex: 1, align: 'left',},
  {field: 'personnelName', headerName: 'Recording', headerClassName: 'header', flex: 1, align: 'left',},
  {
    field: 'measurementDate',
    headerName: 'Date',
    type: "string",
    headerClassName: 'header',
    flex: 1,
    valueGetter: (params: any) => {
      if (!params.value) return null;
      return new Date(params.value).toDateString();
    }
  },
  {field: 'measuredDBH', headerName: 'DBH', headerClassName: 'header', flex: 1, align: 'left',},
  {field: 'measuredHOM', headerName: 'HOM', headerClassName: 'header', flex: 1, align: 'left',},
  // {field: 'description', headerName: 'Description', headerClassName: 'header', flex: 1, align: 'left',},
  {field: 'attributes', headerName: 'Attributes', headerClassName: 'header', flex: 1, align: 'left',},
]

export type AttributesRDS = {
  id: number;
  code: string;
  description: string | null;
  status: string | null;
}

export const AttributeStatusOptions = ['alive', 'alive-not measured', 'dead', 'missing', 'broken below', 'stem dead']

export const AttributeGridColumns: GridColDef[] = [
  {field: 'code', headerName: 'Code', headerClassName: 'header', minWidth: 150, flex: 1, editable: true}, // all unique ID columns need to be tagged 'id'
  {
    field: 'description',
    headerName: 'Description',
    headerClassName: 'header',
    minWidth: 250,
    flex: 1,
    align: 'left',
    editable: true
  },
  {
    field: 'status',
    headerName: 'Status',
    headerClassName: 'header',
    minWidth: 150,
    flex: 1,
    align: 'left',
    editable: true,
    type: 'singleSelect',
    valueOptions: AttributeStatusOptions,
  },
];

export type CensusRaw = {
  id: number;
  censusID: number;
  plotID: number | null;
  plotCensusNumber: number | null;
  startDate: Date | null;
  endDate: Date | null;
  description: string | null;
}

export type CensusRDS = CensusRaw | null;

export const CensusGridColumns: GridColDef[] = [
  {
    field: 'censusID',
    headerName: 'CensusID',
    type: 'number',
    headerClassName: 'header',
    flex: 1,
    align: 'left',
    editable: true
  },
  // {
  //   field: 'plotID',
  //   headerName: 'PlotID',
  //   headerClassName: 'header',
  //   flex: 1,
  //   align: 'left',
  //   editable: true
  // },
  {
    field: 'plotCensusNumber',
    headerName: 'PlotCensusNumber',
    type: 'number',
    headerClassName: 'header',
    flex: 1,
    align: 'left',
    editable: true
  },
  {
    field: 'startDate',
    headerName: 'StartDate',
    type: 'date',
    headerClassName: 'header',
    flex: 1,
    align: 'left',
    editable: true,
    valueGetter: (params: any) => {
      return params.value ? new Date(params.value) : null;
    },
    valueFormatter: (params: any) => {
      return params.value ? new Date(params.value).toLocaleDateString() : "Ongoing";
    }
  },
  {
    field: 'endDate',
    headerName: 'EndDate',
    type: 'date',
    headerClassName: 'header',
    flex: 1,
    align: 'left',
    editable: true,
    valueGetter: (params: any) => params.value === null ? null : new Date(params.value),
    valueFormatter: (params: any) => {
      // Display "Open" when endDate is specifically null
      return params.value === null ? "Ongoing" : new Date(params.value).toLocaleDateString();
    }
  },
  {field: 'description', headerName: 'Description', headerClassName: 'header', flex: 1, editable: true},
]

export type CMAttributesRDS = {
  id: number;
  cmaID: number;
  coreMeasurementID: number | null;
  code: string | null;
}

export const CMAttributeGridColumns: GridColDef[] = [
  {field: 'cmaID', headerName: 'CMAID', headerClassName: 'header', flex: 1, align: 'left'},
  {field: 'coreMeasurementID', headerName: 'CoreMeasurementID', headerClassName: 'header', flex: 1, align: 'left'},
  {field: 'code', headerName: 'Code', headerClassName: 'header', flex: 1, align: 'left'},
]

export type CMVErrorRDS = {
  id: number;
  cmvErrorID: number;
  coreMeasurementID: number | null;
  validationErrorID: number | null;
}

export const CMVErrorGridColumns: GridColDef[] = [
  {field: 'cmvErrorID', headerName: 'CMVErrorID', headerClassName: 'header', flex: 1, align: 'left'},
  {field: 'coreMeasurementID', headerName: 'CoreMeasurementID', headerClassName: 'header', flex: 1, align: 'left'},
  {field: 'validationErrorID', headerName: 'ValidationErrorID', headerClassName: 'header', flex: 1, align: 'left'},
]

export type CoreMeasurementsRDS = {
  id: number;
  coreMeasurementID: number;
  censusID: number | null;
  plotID: number | null;
  quadratID: number | null;
  treeID: number | null;
  stemID: number | null;
  personnelID: number | null;
  isValidated: boolean | null;
  measurementDate: Date | null;
  measuredDBH: number | null;
  measuredHOM: number | null;
  description: string | null;
  userDefinedFields: string | null;
}


export const CoreMeasurementsGridColumns: GridColDef[] = [
  {field: 'coreMeasurementID', headerName: 'CMID', headerClassName: 'header', flex: 1, align: 'left'},
  {field: 'censusID', headerName: 'CensusID', headerClassName: 'header', flex: 1, align: 'left'},
  {field: 'plotID', headerName: 'PlotID', headerClassName: 'header', flex: 1, align: 'left'},
  {field: 'quadratID', headerName: 'QuadratID', headerClassName: 'header', flex: 1, align: 'left'},
  {field: 'treeID', headerName: 'TreeID', headerClassName: 'header', flex: 1, align: 'left'},
  {field: 'stemID', headerName: 'StemID', headerClassName: 'header', flex: 1, align: 'left'},
  {field: 'personnelID', headerName: 'PersonnelID', headerClassName: 'header', flex: 1, align: 'left'},
  {field: 'isValidated', headerName: 'IsValidated', headerClassName: 'header', flex: 1, align: 'left'},
  {
    field: 'measurementDate',
    headerName: 'MeasurementDate',
    type: "date",
    headerClassName: 'header',
    flex: 1,
    valueGetter: (params: any) => {
      if (!params.value) return null;
      return new Date(params.value);
    }
  },
  {field: 'measuredDBH', headerName: 'DBH', headerClassName: 'header', flex: 1, align: 'left'},
  {field: 'measuredHOM', headerName: 'HOM', headerClassName: 'header', flex: 1, align: 'left'},
  {field: 'description', headerName: 'Description', headerClassName: 'header', flex: 1, align: 'left'},
]

export type CurrentObsoleteRDS = {
  id: number;
  speciesID: number;
  obsoleteSpeciesID: number;
  changeDate: Date | null;
  changeCodeID: number | null;
  changeNote: string | null;
}


export const CurrentObsoleteGridColumns: GridColDef[] = [
  {field: 'speciesID', headerName: 'SpeciesID', headerClassName: 'header', flex: 1, align: 'left'},
  {field: 'obsoleteSpeciesID', headerName: 'ObsoleteSpeciesID', headerClassName: 'header', flex: 1, align: 'left',},
  {
    field: 'changeDate',
    headerName: 'ChangeDate',
    type: "date",
    headerClassName: 'header',
    flex: 1,
    align: 'left',
    valueGetter: (params: any) => {
      if (!params.value) return null;
      return new Date(params.value);
    }
  },
  {field: 'changeCodeID', headerName: 'ChangeCodeID', headerClassName: 'header', flex: 1, align: 'left',},
  {field: 'changeNote', headerName: 'ChangeNote', headerClassName: 'header', flex: 1, align: 'left',},
]

export type FamilyRDS = {
  id: number;
  familyID: number;
  family: string | null;
  referenceID: number | null;
}

export const FamilyGridColumns: GridColDef[] = [
  {field: 'familyID', headerName: 'FamilyID', headerClassName: 'header', flex: 1, align: 'left',},
  {field: 'family', headerName: 'Family', headerClassName: 'header', flex: 1, align: 'left',},
  {field: 'referenceID', headerName: 'ReferenceID', headerClassName: 'header', flex: 1, align: 'left',},
]

export type GenusRDS = {
  id: number;
  genusID: number;
  familyID: number | null;
  genus: string | null;
  referenceID: number | null;
  authority: string | null;
}

export const GenusGridColumns: GridColDef[] = [
  {field: 'genusID', headerName: 'GenusID', headerClassName: 'header', flex: 1, align: 'left',},
  {field: 'familyID', headerName: 'FamilyID', headerClassName: 'header', flex: 1, align: 'left',},
  {field: 'genus', headerName: 'GenusName', headerClassName: 'header', flex: 1, align: 'left',},
  {field: 'referenceID', headerName: 'ReferenceID', headerClassName: 'header', flex: 1, align: 'left',},
  {field: 'authority', headerName: 'Authority', headerClassName: 'header', flex: 1, align: 'left',},
]

export type MeasurementTypeRDS = {
  id: number;
  measurementTypeID: number;
  measurementTypeDescription: string | null;
}

export const MeasurementTypeGridColumns: GridColDef[] = [
  {field: 'measurementTypeID', headerName: 'MeasurementTypeID', headerClassName: 'header', flex: 1, align: 'left',},
  {
    field: 'measurementTypeDescription',
    headerName: 'MeasurementTypeDescription',
    headerClassName: 'header',
    flex: 1,
    align: 'left',
  },
]

export interface PersonnelRDS {
  id: number;
  personnelID: number;
  firstName: string | null;
  lastName: string | null;
  role: string | null;
}

export const PersonnelGridColumns: GridColDef[] = [
  {field: 'personnelID', headerName: 'PersonnelID', headerClassName: 'header', flex: 1, align: 'left',},
  {field: 'firstName', headerName: 'FirstName', headerClassName: 'header', flex: 1, align: 'left', editable: true},
  {field: 'lastName', headerName: 'LastName', headerClassName: 'header', flex: 1, align: 'left', editable: true},
  {field: 'role', headerName: 'Role', headerClassName: 'header', flex: 1, align: 'left', editable: true},
]

export type PlotRDS = {
  id: number;
  plotID: number;
  plotName: string | null;
  locationName: string | null;
  countryName: string | null;
  dimensionX: number | null;
  dimensionY: number | null;
  area: number | null;
  globalX: number | null;
  globalY: number | null;
  globalZ: number | null;
  plotX: number | null;
  plotY: number | null;
  plotZ: number | null;
  plotShape: string | null;
  plotDescription: string | null;
}

export const PlotGridColumns: GridColDef[] = [
  {field: 'plotID', headerName: 'PlotID', headerClassName: 'header', flex: 1, align: 'left',},
  {field: 'plotName', headerName: 'PlotName', headerClassName: 'header', flex: 1, align: 'left',},
  {field: 'locationName', headerName: 'LocationName', headerClassName: 'header', flex: 1, align: 'left',},
  {field: 'countryName', headerName: 'CountryName', headerClassName: 'header', flex: 1, align: 'left',},
  {field: 'area', headerName: 'Area', headerClassName: 'header', flex: 1, align: 'left',},
  {field: 'globalX', headerName: 'GlobalX', headerClassName: 'header', flex: 1, align: 'left',},
  {field: 'globalY', headerName: 'GlobalY', headerClassName: 'header', flex: 1, align: 'left',},
  {field: 'globalZ', headerName: 'GlobalZ', headerClassName: 'header', flex: 1, align: 'left',},
  {field: 'plotX', headerName: 'PlotX', headerClassName: 'header', flex: 1, align: 'left',},
  {field: 'plotY', headerName: 'PlotY', headerClassName: 'header', flex: 1, align: 'left',},
  {field: 'plotZ', headerName: 'PlotZ', headerClassName: 'header', flex: 1, align: 'left',},
  {field: 'plotShape', headerName: 'PlotShape', headerClassName: 'header', flex: 1, align: 'left',},
  {field: 'plotDescription', headerName: 'PlotDescription', headerClassName: 'header', flex: 1, align: 'left',},
]

export type QuadratsRDS = {
  id: number;
  quadratID: number;
  plotID: number | null;
  censusID: number | null;
  quadratName: string | null;
  dimensionX: number | null;
  dimensionY: number | null;
  area: number | null;
  quadratShape: string | null;
  personnel?: PersonnelRDS[];
}


export const QuadratsGridColumns: GridColDef[] = [
  {field: 'quadratID', headerName: 'ID', headerClassName: 'header', maxWidth: 75, align: 'left',},
  // {field: 'plotID', headerName: 'PlotID', headerClassName: 'header', flex: 1, align: 'left',},
  // {field: 'censusID', headerName: 'CensusID', headerClassName: 'header', flex: 1, align: 'left',},
  {field: 'quadratName', headerName: 'Name', headerClassName: 'header', flex: 1, maxWidth: 140, align: 'left', editable: true},
  {field: 'dimensionX', headerName: 'X', headerClassName: 'header', flex: 1, maxWidth: 125, align: 'left', editable: true},
  {field: 'dimensionY', headerName: 'Y', headerClassName: 'header', flex: 1, maxWidth: 125, align: 'left', editable: true},
  {field: 'area', headerName: 'Area', headerClassName: 'header', flex: 1, maxWidth: 125, align: 'left', editable: true},
  {field: 'quadratShape', headerName: 'Shape', headerClassName: 'header', flex: 1, maxWidth: 125, align: 'left', editable: true},
];

export type ReferenceRDS = {
  id: number;
  referenceID: number;
  publicationTitle: string | null;
  fullReference: string | null;
  dateOfPublication: Date | null;
}


export const ReferenceGridColumns: GridColDef[] = [
  {field: 'referenceID', headerName: 'ReferenceID', headerClassName: 'header', flex: 1, align: 'left',},
  {field: 'publicationTitle', headerName: 'PublicationTitle', headerClassName: 'header', flex: 1, align: 'left',},
  {field: 'fullReference', headerName: 'FullReference', headerClassName: 'header', flex: 1, align: 'left',},
  {
    field: 'dateOfPublication',
    headerName: 'DateOfPublication',
    type: "date",
    headerClassName: 'header',
    flex: 1,
    align: 'left',
    valueGetter: (params: any) => {
      if (!params.value) return null;
      return new Date(params.value);
    }
  },
]

export type SpeciesRDS = {
  id: number;
  speciesID: number;
  genusID: number | null;
  currentTaxonFlag: boolean | null;
  obsoleteTaxonFlag: boolean | null;
  speciesName: string | null;
  speciesCode: string | null;
  idLevel: string | null;
  authority: string | null;
  fieldFamily: string | null;
  description: string | null;
  referenceID: number | null;
}


export const SpeciesGridColumns: GridColDef[] = [
  {field: 'speciesID', headerName: 'SpeciesID', headerClassName: 'header', flex: 1, align: 'left',},
  {field: 'genusID', headerName: 'GenusID', headerClassName: 'header', flex: 1, align: 'left',},
  {field: 'currentTaxonFlag', headerName: 'CurrentTaxonFlag', headerClassName: 'header', flex: 1, align: 'left',},
  {field: 'obsoleteTaxonFlag', headerName: 'ObsoleteTaxonFlag', headerClassName: 'header', flex: 1, align: 'left',},
  {field: 'speciesName', headerName: 'SpeciesName', headerClassName: 'header', flex: 1, align: 'left',},
  {field: 'speciesCode', headerName: 'SpeciesCode', headerClassName: 'header', flex: 1, align: 'left',},
  {field: 'idLevel', headerName: 'IDLevel', headerClassName: 'header', flex: 1, align: 'left',},
  {field: 'authority', headerName: 'Authority', headerClassName: 'header', flex: 1, align: 'left',},
  {field: 'fieldFamily', headerName: 'FieldFamily', headerClassName: 'header', flex: 1, align: 'left',},
  {field: 'description', headerName: 'Description', headerClassName: 'header', flex: 1, align: 'left',},
  {field: 'referenceID', headerName: 'ReferenceID', headerClassName: 'header', flex: 1, align: 'left',},
]

export type SpeciesInventoryRDS = {
  id: number;
  speciesInventoryID: number;
  censusID: number | null;
  plotID: number | null;
  speciesID: number | null;
  subSpeciesID: number | null;
}

export const SpeciesInventoryGridColumns: GridColDef[] = [
  {field: 'speciesInventoryID', headerName: 'SpeciesInventoryID', headerClassName: 'header', flex: 1, align: 'left',},
  {field: 'censusID', headerName: 'CensusID', headerClassName: 'header', flex: 1, align: 'left',},
  {field: 'plotID', headerName: 'PlotID', headerClassName: 'header', flex: 1, align: 'left',},
  {field: 'speciesID', headerName: 'SpeciesID', headerClassName: 'header', flex: 1, align: 'left',},
  {field: 'subSpeciesID', headerName: 'SubSpeciesID', headerClassName: 'header', flex: 1, align: 'left',},
]

export type StemRDS = {
  id: number;
  stemID: number;
  treeID: number | null;
  quadratID: number | null;
  stemNumber: number | null;
  stemTag: string | null;
  stemPlotX: number | null;
  stemPlotY: number | null;
  stemPlotZ: number | null;
  stemQuadX: number | null;
  stemQuadY: number | null;
  stemQuadZ: number | null;
  moved: boolean | null;
  stemDescription: string | null;
}

export const StemGridColumns: GridColDef[] = [
  // {field: 'stemID', headerName: 'StemID', headerClassName: 'header', flex: 1, align: 'left',},
  // {field: 'treeID', headerName: 'TreeID', headerClassName: 'header', flex: 1, align: 'left',},
  // {field: 'quadratID', headerName: 'QuadratID', headerClassName: 'header', flex: 1, align: 'left',},
  // {field: 'stemNumber', headerName: 'StemNumber', headerClassName: 'header', flex: 1, align: 'left',},
  {field: 'stemTag', headerName: 'Stem Tag', headerClassName: 'header', flex: 1, align: 'left',},
  {field: 'treeTag', headerName: 'Tree Tag', headerClassName: 'header', flex: 1, align: 'left',},
  {field: 'stemPlotX', headerName: 'Plot X', headerClassName: 'header', flex: 1, align: 'left',},
  {field: 'stemPlotY', headerName: 'Plot Y', headerClassName: 'header', flex: 1, align: 'left',},
  // {field: 'stemPlotZ', headerName: 'StemPlotZ', headerClassName: 'header', flex: 1, align: 'left',},
  {field: 'stemQuadX', headerName: 'Quadrat X', headerClassName: 'header', flex: 1, align: 'left',},
  {field: 'stemQuadY', headerName: 'Quadrat Y', headerClassName: 'header', flex: 1, align: 'left',},
  // {field: 'stemQuadZ', headerName: 'StemQuadZ', headerClassName: 'header', flex: 1, align: 'left',},
  {field: 'moved', headerName: 'Moved', headerClassName: 'header', flex: 1, align: 'left',},
  {field: 'stemDescription', headerName: 'StemDescription', headerClassName: 'header', flex: 1, align: 'left',},
]

export type SubSpeciesRDS = {
  id: number;
  subSpeciesID: number;
  speciesID: number | null;
  subSpeciesName: string | null;
  subSpeciesCode: string | null;
  currentTaxonFlag: boolean | null;
  obsoleteTaxonFlag: boolean | null;
  authority: string | null;
  infraSpecificLevel: string | null;
}


export const SubSpeciesGridColumns: GridColDef[] = [
  {field: 'subSpeciesID', headerName: 'SubSpeciesID', headerClassName: 'header', flex: 1, align: 'left',},
  {field: 'speciesID', headerName: 'SpeciesID', headerClassName: 'header', flex: 1, align: 'left',},
  {field: 'subSpeciesName', headerName: 'SubSpeciesName', headerClassName: 'header', flex: 1, align: 'left',},
  {field: 'subSpeciesCode', headerName: 'SubSpeciesCode', headerClassName: 'header', flex: 1, align: 'left',},
  {field: 'currentTaxonFlag', headerName: 'CurrentTaxonFlag', headerClassName: 'header', flex: 1, align: 'left',},
  {field: 'obsoleteTaxonFlag', headerName: 'ObsoleteTaxonFlag', headerClassName: 'header', flex: 1, align: 'left',},
  {field: 'authority', headerName: 'authority', headerClassName: 'header', flex: 1, align: 'left',},
  {field: 'infraSpecificLevel', headerName: 'InfraSpecificLevel', headerClassName: 'header', flex: 1, align: 'left',},
]

export type TreeRDS = {
  id: number;
  treeID: number;
  treeTag: string | null;
  speciesID: number | null;
  subSpeciesID: number | null;
}

export const TreeGridColumns: GridColDef[] = [
  // {field: 'treeID', headerName: 'TreeID', headerClassName: 'header', flex: 1, align: 'left',},
  {field: 'treeTag', headerName: 'Tree Tag', headerClassName: 'header', flex: 1, align: 'left',},
  {field: 'speciesID', headerName: 'SpeciesID', headerClassName: 'header', flex: 1, align: 'left',},
  {field: 'subSpeciesID', headerName: 'SubSpeciesID', headerClassName: 'header', flex: 1, align: 'left',},
]

export type ValidationErrorRDS = {
  id: number;
  validationErrorID: number;
  validationErrorDescription: string | null;
}

export const ValidationErrorGridColumns: GridColDef[] = [
  {field: 'validationErrorID', headerName: 'ValidationErrorID', headerClassName: 'header', flex: 1, align: 'left',},
  {
    field: 'validationErrorDescription',
    headerName: 'ValidationErrorDescription',
    headerClassName: 'header',
    flex: 1,
    align: 'left',
  },
]