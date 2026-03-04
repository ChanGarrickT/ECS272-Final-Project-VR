import { Paper, Divider, Slider, Grid, Stack, Box } from '@mui/material';
import { useState, useEffect, useRef, forwardRef } from 'react';
import * as d3 from 'd3';

import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";  
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(useGSAP, ScrollTrigger);

const TitleScreen = forwardRef((props, ref) => {
    useGSAP(() => {
        gsap.to('.chevron', {
            y: '+=10',
            duration: 1,
            ease: 'sine.inOut',
            stagger: {
                each: 0.1,
                repeat: -1,
                yoyo: true
            }
        });

        gsap.to('.chevron', {
            opacity: 0,
            scrollTrigger: {
                trigger: '#chevron1',
                start: 'bottom 80%',
                end: 'bottom 50%',
                scrub: true
            }           
        });
    })

    return (
        <Grid container sx={{position: 'relative', minHeight: '100vh', paddingTop: '15vh'}}>
            <Grid size={4}>
                <img id='title-img' src='head_right.svg' />
            </Grid>
            <Grid size={8}>
                <Box ref={ref} className='title-box'>
                    <h1>Visualizing Emotional State through <br /> Immersive Generated Environments</h1>
                    <p>
                        Medication is the standard means of relieving pain during and after surgery.
                        However, medication is not suitable for all patients.
                        Physicians have investigated distraction as an alternative for pain relief.
                        Many methods involve a deterministic set of images or videos.
                        We propose using AI-generated VR video to cater to individual patients' preferences.
                        In this project, we take the first steps towards this goal and conducted a pilot study.
                    </p>
                    <p>
                        We show results from our pilot study.
                        Participants completed a user survey and were shown three 1-minute AI-generated videos in sequence.
                    </p>
                </Box>
            </Grid>
            <img id='chevron1' className='chevron' src='chevron.svg' />
            <img id='chevron2' className='chevron' src='chevron.svg' />
        </Grid>
    )
})

export default TitleScreen;