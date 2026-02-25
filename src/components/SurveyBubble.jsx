import { Paper, Divider, Button, Grid, Stack, Box } from '@mui/material';
import { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { isEmpty } from 'lodash';
import { useResizeObserver, useDebounceCallback } from 'usehooks-ts';

export default function SurveyBubble(props){
    return (
        <Box sx={{ width: '100vw', height: '100vh', backgroundColor: '#429485'}}>
            <h1>What factors should AI-generated scenes consider?</h1>
            <Box></Box>
            <svg></svg>
        </Box>
    )
}