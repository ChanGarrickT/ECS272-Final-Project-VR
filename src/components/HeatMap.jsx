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
        <Box sx={{ width: '100vw', height: '100vh', minHeight: '720px', backgroundColor: '#ffe262'}}>
            <h1>Does stress correlate to increased variance in viewing direction?</h1>
            <Box sx={{height: '80%', aspectRatio: '1', margin: "auto", backgroundColor: "white", borderRadius: '20px'}}>
                <svg ref={svgRef} width='100%' height='100%'></svg>
                <Slider
                    sx={{color: 'tomato'}}
                    onChange={(e, val) => setCurrentInterval(val)}
                    defaultValue={0}
                    step={1}
                    marks
                    min={0}
                    max={35}
                />
            </Box>
        </Box>
    )
}

function drawChart(svgElement, interval, size){
    const svg = d3.select(svgElement);
    svg.selectAll('*').remove();

    const innerRad = size.height / 2 - 10;
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