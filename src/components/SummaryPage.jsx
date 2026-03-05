import { Paper, Divider, Slider, Grid, Stack, Box } from '@mui/material';
import { useState, useEffect, useRef, forwardRef } from 'react';
import * as d3 from 'd3';
import { isEmpty } from 'lodash';
import { useResizeObserver, useDebounceCallback } from 'usehooks-ts';

import azimuthData from '../../data/placeholder_heatmap_data.json'
import bubbleData from '../../data/placeholder_bubble_data.json';
import SankeyDiagram from './SankeyDiagram';
import HeatMap from './HeatMap';
import BubbleChart from './BubbleChart';

const SLICE_COLOR = 'crimson';

const SummaryPage = forwardRef((props, ref) => {
    const legendRef = useRef(null);
    const [currentInterval, setCurrentInterval] = useState(0);

    const [size, setSize] = useState({ width: 0, height: 0 });
    const onResize = useDebounceCallback((size) => setSize(size), 200);
    useResizeObserver({ ref: legendRef, onResize });

    useEffect(() => {
        if(size.width === 0 || size.height === 0) return;
        drawLegend(legendRef.current, size);
    }, [size]);

    return (
        <Box id='summary-page' ref={ref} sx={{position: 'relative', width: '100vw', height: '100vh', minHeight: '720px', display: 'flex', flexDirection: 'column'}}>
            <Box className='header-box'>
                <h1>Summary</h1>
                <p>Now feel free to explore the data on your own! Click on the answers in the Sankey diagram to filter results by response.</p>
            </Box> 
            <Grid container sx={{flex: 1, padding: '20px 0'}}>
                <Grid container size={12} sx={{height: '40vh'}}>
                    <Grid size={8}>
                        <h2 style={{marginLeft: '50px'}}>Survey Responses</h2>
                        <Box sx={{width: '100%', height: '100%', padding: '30px 30px 30px 50px', boxSizing: 'border-box'}}>
                            <SankeyDiagram />
                        </Box>
                    </Grid>
                    <Grid size={4} sx={{position: 'relative'}}>
                        <h2>Feedback Terms by Mention Count</h2>
                        <Box sx={{width: '100%', height: '100%', padding: '0 30px', boxSizing: 'border-box'}}>
                            <BubbleChart />
                        </Box>
                    </Grid>
                </Grid>
                <Grid container size={12} spacing={5} sx={{height: '40%', position: 'relative', padding: '0 100px'}}>
                    <Grid size={1.5} sx={{position: 'relative'}}>
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
                                <svg ref={legendRef} width='100%' height='100%'></svg>
                            </Box>
                        </Box>
                    </Grid>
                    {['Busy', 'Moderate', 'Calm'].map((word, index)=> {
                        const chartProps = {
                            currentInterval: currentInterval,
                            intervalOffset: 12 * index,
                            drawTitleLegend: false
                        }
                        return (
                            <Grid key={index} size={3.5}>
                                <Box sx={{width: '100%', aspectRatio: 1.5}}>
                                    <h3 style={{textAlign: 'center'}}>{word + ' Scene'}</h3>
                                    <HeatMap {...chartProps}/>
                                </Box>
                            </Grid>
                        )
                    })}
                </Grid>
            </Grid>
        </Box>
    )
});

export default SummaryPage;

function drawLegend(svgElement, size){
    const svg = d3.select(svgElement);
    svg.selectAll('*').remove();

    // Text
    svg.append('text')
        .text('Increasing percentage of interval viewing a direction →')
        .attr('font-size', 12)
        .attr('text-anchor', 'middle')
        .style('transform', `translate(${size.width / 2}px, 20px)`)        
    svg.append('text')
        .text('0%')
        .attr('font-size', 12)
        .attr('text-anchor', 'start')
        .style('transform', `translate(0, 70px)`)
    svg.append('text')
        .text('100%')
        .attr('font-size', 12)
        .attr('text-anchor', 'end')
        .style('transform', `translate(${size.width}px, 70px)`)

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
        .attr('y', 30)
        .attr('width', size.width)
        .attr('height', 20)
        .style('fill', 'url(#lingrad)')
}