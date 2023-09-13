"use client";
import React, {Dispatch, SetStateAction, useCallback, useEffect, useState} from 'react';
import {
  Card,
  CardBody,
  CircularProgress,
  Divider,
  getKeyValue,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@nextui-org/react';
import {fileColumns, Plot, UploadedFileData} from "@/config/site";
import {useSession} from "next-auth/react";
import {title} from "@/components/primitives";
import {CardHeader} from "@nextui-org/card";
import {BrowseError} from "@/app/error"

// @todo: look into using an ID other than plot name.
// @todo: react router URL params to pass in the ID for Browse.
//        https://reactrouter.com/en/main/start/tutorial#url-params-in-loaders
interface BrowsePureProps {
  plot: Plot;
  setPlot: Dispatch<SetStateAction<Plot>>;
  error?: Error;
  /** True when plot data has finished loading. */
  isLoaded: boolean;
  /** All the rows of data for the plot. */
  fileRows?: UploadedFileData[];
}

export default function Page({params}: { params: { plotKey: string, plotNum: string } }) {
  useSession({
    required: true,
    onUnauthenticated() {
      return (
        <>
          <h3 className={title()}>You must log in to view this page.</h3>
        </>
      );
    },
  });
  let localPlot: Plot = {
    key: (params.plotKey === 'none') ? '' : params.plotKey,
    num: parseInt(params!.plotNum)
  };
  const [currentPlot, setCurrentPlot] = useState(localPlot);
  // @TODO - implement remove and download files
  
  const [error, setError] = useState<Error>();
  const [isLoaded, setIsLoaded] = useState(false);
  const [fileRows, setFileRows] = useState<UploadedFileData[]>();
  const getListOfFiles = useCallback(async () => {
    if (currentPlot && currentPlot.key !== undefined) {
      let response = null;
      try {
        response = await fetch('/api/download?plot=' + currentPlot.key, {
          method: 'GET',
        });
        
        if (!response.ok) {
          console.error('response.statusText', response.statusText);
          setError(new Error('API response not ok'));
        }
      } catch (e) {
        console.error(e);
        setError(new Error('API response not ok'));
      }
      
      if (response) {
        let data = await response.json();
        setFileRows(data.blobData);
        setIsLoaded(true);
      }
    } else {
      console.log('Plot is undefined');
      setError(new Error('No plot'));
    }
  }, [currentPlot]);
  
  useEffect(() => {
    getListOfFiles();
  }, [getListOfFiles]);
  
  useEffect(() => {
    setCurrentPlot(currentPlot);
    setIsLoaded(true);
    setError(undefined);
  }, [currentPlot, setCurrentPlot, error, isLoaded]);
  
  if ((!currentPlot || !currentPlot.key) || (currentPlot.key === 'none' || currentPlot.num === 0)) {
    return (
      <>
        <h1 className={title()}>Please select a plot to continue.</h1>
      </>
    );
  } else {
    return (
      <BrowsePure
        plot={currentPlot}
        setPlot={setCurrentPlot}
        error={error}
        fileRows={fileRows}
        isLoaded={isLoaded}
      />
    );
  }
}

/**
 * Plot selection is already done in navbar, show data for plot
 */
function BrowsePure({error, isLoaded, fileRows}: BrowsePureProps) {
  if (error) {
    return (
      <>
        {BrowseError()}
      </>
    );
  } else if (!isLoaded || !fileRows) {
    return (
      <>
        <Card className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
          <CardHeader>
            <div className="flex flex-col">
              <h5 className="text-md">Loading Files...</h5>
            </div>
          </CardHeader>
          <Divider/>
          <CardBody>
            <div className="flex flex-col">
              <CircularProgress value={60} size={"lg"} label={"Uploading..."}/>
            </div>
          </CardBody>
        </Card>
      </>
    );
  } else {
    return (
      <>
        <Card className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
          <CardHeader>
            <div className="flex flex-col">
              <h5 className="text-md">Uploaded Files</h5>
            </div>
          </CardHeader>
          <Divider/>
          <CardBody>
            <div className="flex flex-col">
              <Table aria-label={"Uploaded files"}>
                <TableHeader columns={fileColumns}>
                  {(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
                </TableHeader>
                <TableBody items={fileRows}>
                  {(fileItem) => ( // fileRows = fileItem[]; fileItem: {key, name, user, date}
                    <TableRow key={fileItem.key}>
                      {(columnKey) => <TableCell>{getKeyValue(fileItem, columnKey)}</TableCell>}
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardBody>
        </Card>
      </>
    );
  }
}