import {GridColDef} from '@mui/x-data-grid';

export type TreeRDS = {
  id: number;
  treeID: number;
  treeTag: string | null;
  speciesID: number | null;
};

export interface TreeResult {
  TreeID: any;
  TreeTag: any;
  SpeciesID: any;
}

export const TreeGridColumns: GridColDef[] = [
  // {field: 'treeID', headerName: 'TreeID', headerClassName: 'header', flex: 1, align: 'left',},
  {field: 'treeTag', headerName: 'Tree Tag', headerClassName: 'header', flex: 1, align: 'left', type: 'string', editable: true},
  {field: 'speciesID', headerName: 'SpeciesID', headerClassName: 'header', flex: 1, align: 'left', editable: false},
  {field: 'subSpeciesID', headerName: 'SubSpeciesID', headerClassName: 'header', flex: 1, align: 'left', editable: false},
];