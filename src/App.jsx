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
import studyResults from '../data/study_data.json';

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
		const sections = [
			{ref: titleRef, color: '#EEE'},
			{ref: sankeyRef, color: '#ffdda6'},
			{ref: heatmapRef, color: '#fdf2ab'},
			{ref: barChartRef, color: '#c0edd1'},
			{ref: summaryRef, color: '#bfe9f6'}
		];

		// Set up scrollTrigger for each section
		sections.forEach(({ ref, color }) => {
			gsap.to('html', {
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

		const headers = d3.selectAll('.header-box').nodes();
		headers.forEach((header) => {
			gsap.from(header, {
				opacity: 0,
				scrollTrigger: {
					trigger: header,
					start: 'top 90%',
					end: 'top 40%',
					scrub: true
				}
			});
		});

	});

	const sankeyProps = {
		surveyQuestions: surveyQuestions
	}

	const summaryProps = {
		surveyQuestions: surveyQuestions,
		studyResults: studyResults,
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
