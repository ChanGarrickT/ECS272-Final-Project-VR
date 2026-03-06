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
import HeatMapPage from './components/HeatMapPage';
import SurveyBar from './components/SurveyBar';
import TitleScreen from './components/TitleScreen';
import SummaryPage from './components/SummaryPage';

import surveyQuestions from '../data/survey_questions.json';
import studyResults from '../data/placeholder_combined_data.json';

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
	const [titleRef, sankeyRef, heatmapRef, barChartRef, summaryRef] = [useRef(null), useRef(null), useRef(null), useRef(null), useRef(null)];

	useGSAP(() => {
		const body = containerRef.current;

		const sections = [
			{ref: titleRef, color: '#EEE'},
			{ref: sankeyRef, color: '#ffdda6'},
			{ref: heatmapRef, color: '#fdf2ab'},
			{ref: barChartRef, color: '#AAD9BB'},
			{ref: summaryRef, color: '#bfe9f6'}
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

	const sankeyProps = {
		surveyQuestions: surveyQuestions
	}

	const summaryProps = {
		surveyQuestions: surveyQuestions,
		studyResults: studyResults
	}

    return (
        <Box ref={containerRef} id="main-container">
			<TitleScreen ref={titleRef} />
			<SurveySankey {...sankeyProps} ref={sankeyRef}/>
			<HeatMapPage ref={heatmapRef}/>
			<SurveyBar ref={barChartRef}/>
			<SummaryPage {...summaryProps} ref={summaryRef} />
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
