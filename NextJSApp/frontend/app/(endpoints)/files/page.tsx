"use client";
import * as React from "react";
import ViewUploadedFiles from "@/components/viewuploadedfiles";
import {UploadAndReviewProcess} from "@/components/uploadreviewcycle";
import {Tab, TabList, TabPanel, Tabs} from "@mui/joy";
import {usePlotContext} from "@/app/plotcontext";
import Box from "@mui/joy/Box";

// File Hub
export default function Files() {
  const currentPlot = usePlotContext();
  if (!currentPlot?.key) {
    return (
      <>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <p>You must select a plot to continue!</p>
        </Box>
      </>
    );
  } else {
    // Tab system -- Browse page, Upload page
    return (
      <>
        <p>Drag and drop files into the box to upload them to storage</p>
        <div className={"mt-5"}>
          <Tabs aria-label={"File Hub Options"} size={"sm"} className={""}>
            <TabList>
              <Tab>Browse Uploaded Files</Tab>
              <Tab>Upload New Files</Tab>
            </TabList>
            <TabPanel value={0}>
              <ViewUploadedFiles />
            </TabPanel>
            <TabPanel value={1}>
              <UploadAndReviewProcess />
            </TabPanel>
          </Tabs>
        </div>
      </>
    );
  }
}
