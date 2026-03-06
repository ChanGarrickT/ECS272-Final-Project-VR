import { Paper, Divider, Button, Grid, Stack, Box } from '@mui/material';
import { useState, useEffect, useRef, forwardRef } from 'react';
import * as d3 from 'd3';
import * as d3Sankey from 'd3-sankey';
import { isEmpty } from 'lodash';
import { useResizeObserver, useDebounceCallback } from 'usehooks-ts';
import SankeyDiagram from './SankeyDiagram';

const SurveySankey = forwardRef((props, ref) => {
    return (
        <Box id='sankey-page' ref={ref} sx={{position: 'relative', width: '100vw', minHeight: '100vh', paddingBottom: '50px'}}>
            <Box className='header-box' sx={{marginBottom: '30px'}}>
                <h1>Can AI-generated VR scenes relieve stress?</h1>
                <p>
                    We surveyed participants on their history of VR use, and their relative levels of stress before, during, and after the VR session.
                </p>
                <p>
                    Click on the rectangle for a response to compare how participants who gave that response answered other questions.
                </p>
                <h2 style={{textAlign: 'center', marginTop: '50px'}}>Survey Responses Sankey Diagram</h2>
            </Box>
            <Box sx={{position: 'relative', width: '70%', height: '100px', margin: '30px auto 10px'}}>
                {props.surveyQuestions.map((q, index) => {
                    return (
                        <Box key={index} className='question-box' sx={{left: `calc(${index * 100 / 3}% - ${110 + (10 * index)}px)`}}>
                            <p>{q}</p>
                        </Box>
                    )
                })
                }
            </Box> 
            <Box sx={{width: '70%', aspectRatio: 2.25, minWidth: '900px', minHeight: '300px', margin: "auto"}}>
                <SankeyDiagram />
            </Box>
        </Box>
    )
});

export default SurveySankey;
