import { Box } from '@mui/material';
import * as d3 from 'd3';
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { grey } from "@mui/material/colors";
import { useState, useEffect, useRef } from 'react';
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
    return (
        <Box id="main-container">
			<SurveySankey />
			<HeatMap />
			<SurveyBubble />
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
