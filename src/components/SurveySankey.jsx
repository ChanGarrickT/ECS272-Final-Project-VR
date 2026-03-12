import { Paper, Divider, Button, Grid, Stack, Box } from '@mui/material';
import { useState, useEffect, useRef, forwardRef } from 'react';
import * as d3 from 'd3';
import SankeyDiagram from './SankeyDiagram';

import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";  
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(useGSAP, ScrollTrigger);

const SurveySankey = forwardRef((props, ref) => {
    useGSAP(() => {
        gsap.from('.question-box', {
            opacity: 0,
            transform: 'rotateX(45deg)',
            stagger: 0.25,           
            scrollTrigger: {
                trigger: '#qbox-container',
                start: 'top 80%',
                end: 'top 40%',
                scrub: true
            }
        });

        gsap.from('#sankey-page-chart', {
            opacity: 0,
            transform: 'rotateY(22deg)',
            stagger: 0.1,
            scrollTrigger: {
                trigger: '#sankey-page-chart',
                start: 'top 60%',
                end: 'top 40%',
                scrub: true
            }
        })
    });
    
    return (
        <Box id='sankey-page' ref={ref} sx={{position: 'relative', width: '100vw', minHeight: '100vh', paddingBottom: '50px'}}>
            <Box className='header-box' sx={{marginBottom: '30px'}}>
                <h1>Can AI-generated VR scenes relieve stress?</h1>
                <p>
                    We surveyed 20 participants on their history of VR use, and their relative levels of stress before, during, and after the VR session.
                </p>
                <p>
                    <b>Click on the dark rectangle</b> associated with a response to compare how participants who gave that response answered other questions.
                </p>
                <h2 style={{textAlign: 'center', marginTop: '50px'}}>Survey Responses Sankey Diagram</h2>
            </Box>
            <Box id='qbox-container' sx={{position: 'relative', width: '70%', height: '100px', margin: '30px auto 10px'}}>
                {props.surveyQuestions.map((q, index) => {
                    return (
                        <Box key={index} className='question-box' sx={{left: `calc(${index * 100 / 3}% - ${110 + (10 * index)}px)`}}>
                            <p>{q}</p>
                        </Box>
                    )
                })
                }
            </Box> 
            <Box id='sankey-page-chart' sx={{width: '70%', aspectRatio: 2.5, minWidth: '900px', minHeight: '300px', margin: "auto"}}>
                <SankeyDiagram />
            </Box>
        </Box>
    )
});

export default SurveySankey;
