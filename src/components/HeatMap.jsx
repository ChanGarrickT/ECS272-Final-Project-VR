import { Paper, Divider, Slider, Grid, Stack, Box } from '@mui/material';
import { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { isEmpty } from 'lodash';
import { useResizeObserver, useDebounceCallback } from 'usehooks-ts';
import azimuthData from '../../data/placeholder_heatmap_data.json'

const DATA_MAX = 16;
const SLICE_MASK = [0, 1, 2, 3, 4, 12, 13, 14, 15];

const colorScale = d3.scaleSequential(d3.interpolateYlOrBr);
const pie = d3.pie().value(1);

export default function HeatMap(props){
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

    return (
        <Box sx={{ width: '100vw', minHeight: '100vh', backgroundColor: '#FDFAAB'}}>
            <Box className='title-box'>
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
            <Box sx={{width: '30%', maxWidth: '570px', aspectRatio: '1', margin: "20px auto", backgroundColor: "white", borderRadius: '20px'}}>
                <svg ref={svgRef} width='100%' height='100%'></svg>
            </Box>
            <Grid container sx={{position: 'relative', width: '30%', maxWidth: '570px', margin: '0 auto', padding: '0 0 30px'}}>
                <Box sx={{position: 'absolute', width: '100%', paddingLeft: '2.77%', top: '5px', zIndex: 1, boxSizing: 'border-box'}}>
                    <Slider
                        sx={{color: 'dodgerblue', zIndex: 1}}
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
}

function drawChart(svgElement, interval, size){
    const svg = d3.select(svgElement);
    svg.selectAll('*').remove();

    // Draw labels
    svg.append('text')
        .text('Left')
        .attr('text-anchor', 'middle')
        .style('transform', `translate(40px, ${size.height / 2}px) rotate(-90deg)`);
    
    svg.append('text')
        .text('Right')
        .attr('text-anchor', 'middle')
        .style('transform', `translate(${size.width - 40}px, ${size.height / 2}px) rotate(90deg)`);
    
    svg.append('text')
        .text('Forward')
        .attr('text-anchor', 'middle')
        .style('transform', `translate(${size.width / 2}px, 40px)`);

    const innerRad = size.height / 2 - 60;
    const outerRad = innerRad / 2;

    const arc = d3.arc()
        .innerRadius(innerRad)
        .outerRadius(outerRad);

    const g = svg.append('g')
        .style('transform', `translate(${size.width/2}px, ${size.height/2}px) rotate(${-360/32}deg)`)
    
    // datum(): shared data among selection
    // data(): one array item per selected element
    g.datum(azimuthData[interval]).selectAll('path')
        .data(pie)
        .join('path')
        .attr('fill', (d) => SLICE_MASK.includes(d.index) ? colorScale(d.data/DATA_MAX) : 'none')
        .attr('stroke', 'white')
        .attr('stroke-width', 3)
        .attr('d', arc)
    
    return g;
}

function recolorChart(slices, interval){
    slices.datum(azimuthData[interval]).selectAll('path')
        .data(pie)
        .attr('fill', (d) => SLICE_MASK.includes(d.index) ? colorScale(d.data/DATA_MAX) : 'none')
}