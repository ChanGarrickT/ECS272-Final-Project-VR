import { Paper, Divider, Slider, Grid, Stack, Box } from '@mui/material';
import { useState, useEffect, useRef, forwardRef } from 'react';
import * as d3 from 'd3';
import { isEmpty } from 'lodash';
import { useResizeObserver, useDebounceCallback } from 'usehooks-ts';
import azimuthData from '../../data/placeholder_heatmap_data.json';

const DATA_MAX = 40;
const SLICE_MASK = [0, 1, 2, 3, 4, 12, 13, 14, 15];
const SLICE_COLOR = 'crimson';

const opacityScale = d3.scaleLinear([0, DATA_MAX], [0.1, 1]);
const pie = d3.pie().value(1);

export default function HeatMap(props){
    const svgRef = useRef(null);
    const sliceSelectionRef = useRef(null);
    const [size, setSize] = useState({ width: 0, height: 0 });

    const onResize = useDebounceCallback((size) => setSize(size), 200);
    useResizeObserver({ ref: svgRef, onResize });

    useEffect(() => {
        if(size.width === 0 || size.height === 0) return;
        sliceSelectionRef.current = drawChart(svgRef.current, props.currentInterval + props.intervalOffset, size, props);
    }, [size]);

    useEffect(() => {
        if(!sliceSelectionRef.current) return;
        recolorChart(sliceSelectionRef.current, props.currentInterval + props.intervalOffset);
    }, [props.currentInterval]);

    return (
        <Box sx={{position: 'relative', width: '100%', height: '100%'}}>
            <svg ref={svgRef} width='100%' height='100%'></svg>
            <img className='heatmap-head' src='head_top.svg' />
        </Box>
    )
}

function drawChart(svgElement, interval, size, props){
    const svg = d3.select(svgElement);
    svg.selectAll('*').remove();

    if(props.drawTitleLegend){
        // Draw title
        svg.append('text')
            .text('View Azimuth Heatmap')
            .attr('font-size', 26)
            .attr('font-weight', 'bold')
            .attr('text-anchor', 'start')
            .style('transform', 'translate(0, 30px)');

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
    }    

    // Draw slices
    const outerRad = size.height * 0.75 - 60;
    const innerRad = outerRad / 2;

    // Draw labels
    svg.append('text')
        .text('Left')
        .attr('font-size', 20)
        .attr('text-anchor', 'middle')
        .style('transform', `translate(${size.width / 2 - outerRad - 20}px, ${size.height * 0.75}px) rotate(-90deg)`);    
    svg.append('text')
        .text('Right')
        .attr('font-size', 20)
        .attr('text-anchor', 'middle')
        .style('transform', `translate(${size.width / 2 + outerRad + 20}px, ${size.height * 0.75}px) rotate(90deg)`);    
    svg.append('text')
        .text('Forward')
        .attr('font-size', 20)
        .attr('text-anchor', 'middle')
        .style('transform', `translate(${size.width / 2}px, 40px)`);


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
        .attr('opacity', (d) => SLICE_MASK.includes(d.index) ? opacityScale(d.data) : 0)
        .attr('d', arc)
        .classed('slice', true)
    
    return g;
}

function recolorChart(slices, interval){
    slices.datum(azimuthData[interval]).selectAll('path')
        .data(pie)
        .attr('opacity', (d) => SLICE_MASK.includes(d.index) ? opacityScale(d.data) : 0)
}