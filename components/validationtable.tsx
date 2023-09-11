import {
  TableContainer,
  Typography,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '@mui/material';
import { parse } from 'papaparse';
import { useState } from 'react';
import { FileWithPath } from 'react-dropzone';
import '@/styles/validationtable.css';

export interface ValidationTableProps {
  /** An array of uploaded data. */
  uploadedData: FileWithPath[];
  /** If there are errors, these errors are indexed into the uploadedData field. */
  errorMessage: { [fileName: string]: { [currentRow: string]: string } };
  /** The headers for the table. */
  headers: { label: string }[];
  children?: React.ReactNode | React.ReactNode[];
}

export interface dataStructure {
  [key: string]: string;
}

/**
 * Shows a data table with the possibility of showing errors.
 */
export default function ValidationTable({
                                          uploadedData,
                                          errorMessage,
                                          headers,
                                        }: ValidationTableProps) {
  let tempData: {
    fileName: string;
    data: dataStructure[]
  }[] = [];
  const initState: {
    fileName: string;
    data: dataStructure[]
  }[] = [];
  const [data, setData] = useState(initState);
  uploadedData.forEach((file: FileWithPath) => {
    parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: function (results: any) {
        try {
          // eslint-disable-next-line array-callback-return
          tempData.push({fileName: file.name, data: results.data});
          setData(tempData);
        } catch (e) {
          console.log(e);
        }
      },
    });
  });
  let fileData: {
    fileName: string;
    data: dataStructure[]
  };
  
  return (
    <>
      {Object.keys(errorMessage).map((fileName) => {
        fileData = data.find((file) => file.fileName === fileName) || {
          fileName: '',
          data: [],
        };
        return (
          <><h3>file: {fileName}</h3><Table>
            {errorMessage[fileName]['headers'] ? (
              <></>
            ) : (
              <>
                <TableHead>
                  <TableRow>
                    {headers.map((row, index) => {
                      return <TableCell colSpan={headers.length} key={index}>{row.label}</TableCell>;
                    })}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {fileData!.data.map((data: dataStructure, rowIdx) => {
                    return (
                      <>
                        <TableRow>
                          {headers.map((header, i) => (
                            <TableCell colSpan={headers.length} key={i}>
                              {data[header.label]}
                            </TableCell>
                          ))}
                        </TableRow>
                        
                        {errorMessage[fileName][rowIdx] && (
                          <TableRow className="errorMessage">
                            <TableCell colSpan={headers.length}>
                              <Typography
                                className="errorMessage"
                                component={'span'}
                              >
                                ^ {errorMessage[fileName][rowIdx]}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    );
                  })}
                </TableBody>
              </>
            )}
          </Table></>
        );
      })}
    </>
  );
}