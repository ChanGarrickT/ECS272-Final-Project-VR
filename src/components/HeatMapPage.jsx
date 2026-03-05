import { Paper, Divider, Slider, Grid, Stack, Box } from '@mui/material';
import { useState, useEffect, useRef, forwardRef } from 'react';
import * as d3 from 'd3';
import { isEmpty } from 'lodash';
import { useResizeObserver, useDebounceCallback } from 'usehooks-ts';
import azimuthData from '../../data/placeholder_heatmap_data.json';
import HeatMap from './HeatMap';

const DATA_MAX = 16;
const SLICE_MASK = [0, 1, 2, 3, 4, 12, 13, 14, 15];
const SLICE_COLOR = 'crimson';

const opacityScale = d3.scaleLinear([0, DATA_MAX], [0.1, 1]);
const pie = d3.pie().value(1);

const HeatMapPage = forwardRef((props, ref) => {
    const svgRef = useRef(null);
    const sliceSelectionRef = useRef(null);
    const [size, setSize] = useState({ width: 0, height: 0 });
    const [currentInterval, setCurrentInterval] = useState(0);

    const onResize = useDebounceCallback((size) => setSize(size), 200);
    useResizeObserver({ ref: svgRef, onResize });

    useEffect(() => {
        if(size.width === 0 || size.height === 0) return;
        sliceSelectionRef.current = drawChart(svgRef.current, currentInterval, size);
    }, [size]);

    useEffect(() => {
        if(!sliceSelectionRef.current) return;
        recolorChart(sliceSelectionRef.current, currentInterval);
    }, [currentInterval]);

    const chartProps = {
        currentInterval: currentInterval,
        intervalOffset: 0,
        drawTitleLegend: true
    };

    return (
        <Box id='heatmap-page' ref={ref} sx={{position: 'relative', width: '100vw', minHeight: '100vh'}}>
            <Box className='header-box'>
                <h1>Does stress correlate to increased variance in users' viewing direction?</h1>
                <p>
                    We tracked the y-coordinate of the virtual camera at 0.1 second intervals throughout the 3-minute session.
                    Viewing direction was binned to 22.5º slices, and time was binned to 5-second intervals.
                    Results are the average over all participants.
                    "Forward" is defined as the starting orientation of each participant.
                </p>
                <p>
                    Use the slider below to select an interval. A darker slice indicates more focus in that direction within that interval.
                </p>
            </Box>    
            <Box sx={{position: 'relative', width: '50%', minWidth: '720px', aspectRatio: '2', margin: "50px auto", borderRadius: '20px'}}>
                <HeatMap {...chartProps}/>
            </Box>
            <Grid container sx={{position: 'relative', width: '30%', minWidth: '570px', margin: '0 auto', padding: '0 0 30px'}}>
                <Box sx={{position: 'absolute', width: '100%', paddingLeft: '2.77%', top: '5px', zIndex: 1, boxSizing: 'border-box'}}>
                    <Slider
                        sx={{color: '#555', zIndex: 1}}
                        onChange={(e, val) => setCurrentInterval(val)}
                        defaultValue={0}
                        step={1}
                        marks
                        min={0}
                        max={35}
                        valueLabelDisplay='auto'
                        valueLabelFormat={(x) => `${5 * x} - ${5 * x + 5} sec`}
                    />
                </Box>
                <Grid size={4} sx={{backgroundColor: 'hsl(50, 100%, 75%)', textAlign: 'center', padding: '40px 0 15px', borderRadius: '8px 0 0 8px'}}>Busy Scene</Grid>
                <Grid size={4} sx={{backgroundColor: 'hsl(60, 100%, 75%)', textAlign: 'center', padding: '40px 0 15px'}}>Moderate Scene</Grid>
                <Grid size={4} sx={{backgroundColor: 'hsl(100, 100%, 87%)', textAlign: 'center', padding: '40px 0 15px', borderRadius: '0 8px 8px 0'}}>Calm Scene</Grid>
            </Grid>
        </Box>
    )
});

export default HeatMapPage;

function drawChart(svgElement, interval, size){
    const svg = d3.select(svgElement);
    svg.selectAll('*').remove();

    // Draw title
    svg.append('text')
        .text('View Azimuth Heatmap')
        .attr('font-size', 26)
        .attr('font-weight', 'bold')
        .attr('text-anchor', 'start')
        .style('transform', 'translate(0, 30px)');

    // Draw labels
    svg.append('text')
        .text('Left')
        .attr('font-size', 20)
        .attr('text-anchor', 'middle')
        .style('transform', `translate(150px, ${size.height * 0.75}px) rotate(-90deg)`);
    
    svg.append('text')
        .text('Right')
        .attr('font-size', 20)
        .attr('text-anchor', 'middle')
        .style('transform', `translate(${size.width - 150}px, ${size.height * 0.75}px) rotate(90deg)`);
    
    svg.append('text')
        .text('Forward')
        .attr('font-size', 20)
        .attr('text-anchor', 'middle')
        .style('transform', `translate(${size.width / 2}px, 40px)`);
    
    // Draw legend
    svg.append('text')
        .text('Increasing percentage of interval viewing a direction →')
        .attr('font-size', 12)
        .attr('text-anchor', 'end')
        .style('transform', `translate(${size.width}px, 20px)`)
    
    svg.append('text')
        .text('0%')
        .attr('font-size', 12)
        .attr('text-anchor', 'start')
        .style('transform', `translate(${size.width - 250}px, 70px)`)

    svg.append('text')
        .text('100%')
        .attr('font-size', 12)
        .attr('text-anchor', 'end')
        .style('transform', `translate(${size.width}px, 70px)`)

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
        .attr('x', size.width - 250)
        .attr('y', 30)
        .attr('width', 250)
        .attr('height', 20)
        .style('fill', 'url(#lingrad)')

    // Draw slices
    const outerRad = size.height * 0.75 - 60;
    const innerRad = outerRad / 2;

    const arc = d3.arc()
        .innerRadius(innerRad)
        .outerRadius(outerRad);

    const g = svg.append('g')
        .style('transform', `translate(${size.width/2}px, ${size.height * 0.75}px) rotate(${-360 / 32}deg)`)
    
    // datum(): shared data among selection
    // data(): one array item per selected element
    g.datum(azimuthData[interval]).selectAll('path')
        .data(pie)
        .join('path')
        .attr('fill', SLICE_COLOR)
        .attr('stroke', '#FDFAAB')
        .attr('stroke-width', 3)
        .attr('opacity', (d) => SLICE_MASK.includes(d.index) ? opacityScale(d.data) : 0)
        .attr('d', arc)
    
    return g;
}

function recolorChart(slices, interval){
    slices.datum(azimuthData[interval]).selectAll('path')
        .data(pie)
        .attr('opacity', (d) => SLICE_MASK.includes(d.index) ? opacityScale(d.data) : 0)
}