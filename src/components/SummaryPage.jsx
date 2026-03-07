import { Paper, Divider, Slider, Grid, Stack, Box } from '@mui/material';
import { useState, useEffect, useRef, forwardRef } from 'react';
import * as d3 from 'd3';
import { isEmpty } from 'lodash';
import { useResizeObserver, useDebounceCallback } from 'usehooks-ts';
import SankeyDiagram from './SankeyDiagram';
import HeatMap from './HeatMap';
import BubbleChart from './BubbleChart';
import { showTooltip, moveTooltip, hideTooltip } from '../utils';

import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";  
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(useGSAP, ScrollTrigger);

const SLICE_COLOR = 'crimson';

const SummaryPage = forwardRef((props, ref) => {
    const legendRef = useRef(null);
    const tooltipRef = useRef(null);
    const [currentInterval, setCurrentInterval] = useState(0);
    const [responseFilter, setResponseFilter] = useState(null);

    const [size, setSize] = useState({ width: 0, height: 0 });
    const onResize = useDebounceCallback((size) => setSize(size), 200);
    useResizeObserver({ ref: legendRef, onResize });

    useEffect(() => {
        if(size.width === 0 || size.height === 0) return;
        drawLegend(legendRef.current, size);
    }, [size]);

    useGSAP(() => {
        gsap.from('.summary-page-chart', {
            opacity: 0,
            stagger: 0.1,
            duration: 0.3,
            scrollTrigger: {
                trigger: '#summary-page',
                start: 'top 50%',
                end: 'top 20%',
                toggleActions: 'play none none reverse'
            }
        })
    })

    const sankeyProps = {
        setResponseFilter: setResponseFilter
    }

    const bubbleProps = {
        responseFilter: responseFilter
    }

    return (
        <Stack id='summary-page' ref={ref} sx={{position: 'relative', width: '100vw', height: '100vh', minHeight: '720px'}}>
            <Box className='header-box'>
                <h1>Summary</h1>
                <p>Now feel free to explore the data on your own! Click on the answers in the Sankey diagram to filter results by response.</p>
            </Box>
            <Box ref={tooltipRef} className='tooltip'></Box>
            <Box sx={{display: 'flex', flexDirection: 'column'}}>
                <Box sx={{display: 'flex', flexDirection: 'row', height: '40vh', minHeight: 0, marginBottom: '50px'}}>
                    <Box className='summary-page-chart' sx={{flex: 2, paddingLeft: '50px', paddingRight: '30px', minHeight: 0}}>
                        <h2>Survey Responses</h2>
                        <Box sx={{display: 'flex', justifyContent: 'space-between', marginTop: '5px'}}>
                            {props.surveyQuestions.map((q, index) => {
                                return (
                                    <Box
                                        key={index}
                                        className='question-icon'
                                        onMouseOver={(e) => showTooltip(e, q, tooltipRef)}
                                        onMouseMove={(e) => moveTooltip(e, tooltipRef)}
                                        onMouseOut={(e) => hideTooltip(tooltipRef)}
                                    >?</Box>
                                )
                            })}
                        </Box>
                        <Box sx={{width: '100%', height: '100%', minHeight: 0, padding: '10px 0 50px 0', boxSizing: 'border-box'}}>
                            <SankeyDiagram {...sankeyProps}/>
                        </Box>
                    </Box>
                    <Box className='summary-page-chart' sx={{flex: 1, position: 'relative'}}>
                        <h2>Feedback Terms by Mention Count</h2>
                        <Box sx={{width: '100%', height: '100%', padding: '0 30px', boxSizing: 'border-box'}}>
                            <BubbleChart {...bubbleProps}/>
                        </Box>
                    </Box>
                </Box>
                <Box sx={{flex: 1, display: 'flex', flexDirection: 'row', position: 'relative', padding: '20px 50px 0'}}>
                    <Box className='summary-page-chart' sx={{flex: 1, position: 'relative'}}>
                        <h2>Split Heat Map</h2>
                        <p>The heatmap shown before is now split into three, making it easier to compare viewing behavior across scenes.</p>
                        <Box sx={{width: '100%', height: '10%', top: '5px', zIndex: 1, boxSizing: 'border-box'}}>
                            <Slider
                                sx={{color: '#555', zIndex: 1}}
                                onChange={(e, val) => setCurrentInterval(val)}
                                defaultValue={0}
                                step={1}
                                marks
                                min={0}
                                max={11}
                                valueLabelDisplay='auto'
                                valueLabelFormat={(x) => `${5 * x} - ${5 * x + 5} sec`}
                            />
                            <Box sx={{marginTop: '30px'}}>
                                <p style={{fontSize: '11pt'}}>Increasing portion of interval viewing a direction →</p>
                                <svg ref={legendRef} width='100%' height='100%'></svg>
                            </Box>
                        </Box>
                    </Box>
                    {['Busy', 'Moderate', 'Calm'].map((word, index)=> {
                        const chartProps = {
                            currentInterval: currentInterval,
                            intervalOffset: 12 * index,
                            drawTitleLegend: false,
                            responseFilter: responseFilter
                        }
                        return (
                            <Box key={index} className='summary-page-chart' sx={{flex: 2}}>
                                <Box sx={{width: '100%', aspectRatio: 1.5}}>
                                    <h3 style={{textAlign: 'center'}}>{word + ' Scene'}</h3>
                                    <HeatMap {...chartProps}/>
                                </Box>
                            </Box>
                        )
                    })}
                </Box>
            </Box>
        </Stack>
    )
});

export default SummaryPage;

function drawLegend(svgElement, size){
    const svg = d3.select(svgElement);
    svg.selectAll('*').remove();       

    // Gradient
    const def = svg.append('defs');
    const lingrad = def.append('linearGradient')
        .attr('id', 'lingrad')
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '100%')
        .attr('y2', '0%')
    lingrad.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', SLICE_COLOR)
        .attr('stop-opacity', '0.1')
    lingrad.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', SLICE_COLOR)
        .attr('stop-opacity', '1')

    svg.append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', size.width)
        .attr('height', 20)
        .style('fill', 'url(#lingrad)')
}