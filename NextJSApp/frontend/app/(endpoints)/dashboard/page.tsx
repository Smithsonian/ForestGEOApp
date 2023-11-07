"use client";
import * as React from "react";
import {usePlotContext} from "@/app/plotcontext";
import Box from "@mui/joy/Box";

export default function Page() {
  const currentPlot = usePlotContext();
  if (!currentPlot?.key) {
    return (
      <>
        <Box sx={{display: 'flex', gap: 1, alignItems: 'center'}}>
          <p>You must select a plot to continue!</p>
        </Box>
      </>
    );
  } else {
    return (
      <>
        <Box sx={{display: 'flex', gap: 1, alignItems: 'center'}}>
          <p>You have selected {currentPlot?.key ? currentPlot!.key : "nothing"}</p>
        </Box>
      </>
    );
  }
}
