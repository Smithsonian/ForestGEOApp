"use client";

import {useSession} from "next-auth/react";
import {redirect} from "next/navigation";
import {Box, Stack} from "@mui/joy";
import CircularProgress from "@mui/joy/CircularProgress";
import Typography from "@mui/joy/Typography";

export default function HomePage() {
  const {data: _session, status} = useSession();

  if (status === "authenticated") redirect('/dashboard');
  else if (status === "unauthenticated") redirect('/login');
  else return <Box sx={{ display: 'flex', width: '100vw', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
      <Stack
        direction="column"
        sx={{
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <CircularProgress size="lg" variant="soft" color='primary' />
        <Typography color="warning" level="title-md">Loading...</Typography>
      </Stack>
    </Box>;
}