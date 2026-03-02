import { Box } from '@mui/material';
import * as d3 from 'd3';
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { grey } from "@mui/material/colors";
import { useState, useEffect, useRef } from 'react';

import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";  
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(useGSAP, ScrollTrigger);

import SurveySankey from './components/SurveySankey';
import HeatMap from './components/HeatMap';
import SurveyBubble from './components/SurveyBubble';

// Adjust the color theme for material ui
const theme = createTheme({
    palette: {
        primary: {
            main: grey[700],
        },
        secondary: {
            main: grey[700],
        },
    },
});

function Layout() {
	const containerRef = useRef(null);
	const [titleRef, sankeyRef, heatmapRef, bubbleRef] = [useRef(null), useRef(null), useRef(null), useRef(null)];

	useGSAP(() => {
		const body = containerRef.current;

		const sections = [
			{ref: sankeyRef, color: '#FFCF81'},
			{ref: heatmapRef, color: '#FDFAAB'},
			{ref: bubbleRef, color: '#AAD9BB'}
		];

		// Set up scrollTrigger for each section
		sections.forEach(({ ref, color }) => {
			gsap.to(body, {
				backgroundColor: color,
				immediateRender: false,
				scrollTrigger: {
					trigger: ref.current,
					start: '20% 80%',
					end: '20% 20%',
					scrub: true,
					// markers: true
				}
			});
		});

	});

    return (
        <Box ref={containerRef} id="main-container">
			<Box ref={titleRef} sx={{width: '100vw', height: '100vh'}}>Title section here, scroll down</Box>
			<SurveySankey ref={sankeyRef}/>
			<HeatMap ref={heatmapRef}/>
			<SurveyBubble ref={bubbleRef}/>
        </Box>
    );
}

function App() {

    return (
        <ThemeProvider theme={theme}>
            <Layout />
        </ThemeProvider>
    );
}

export default App;
