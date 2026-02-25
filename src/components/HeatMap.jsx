import { Paper, Divider, Button, Grid, Stack, Box } from '@mui/material';
import { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { isEmpty } from 'lodash';
import { useResizeObserver, useDebounceCallback } from 'usehooks-ts';

export default function HeatMap(props){
    return (
        <Box sx={{ width: '100vw', height: '100vh', backgroundColor: '#ffe262'}}>
            <h1>Does stress correlate to increased variance in viewing direction?</h1>
            <Box></Box>
            <svg></svg>
        </Box>
    )
}