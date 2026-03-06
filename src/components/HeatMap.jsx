import { Paper, Divider, Slider, Grid, Stack, Box } from '@mui/material';
import { useState, useEffect, useRef, forwardRef } from 'react';
import * as d3 from 'd3';
import { isEmpty } from 'lodash';
import { useResizeObserver, useDebounceCallback } from 'usehooks-ts';
import { add, max } from 'mathjs';
import studyResults from '../../data/placeholder_combined_data.json';

const SLICE_MASK = [0, 1, 2, 3, 4, 12, 13, 14, 15];
const SLICE_COLOR = 'crimson';

const pie = d3.pie().value(1);

export default function HeatMap(props){
    const svgRef = useRef(null);
    const sliceSelectionRef = useRef(null);
    const [size, setSize] = useState({ width: 0, height: 0 });
    const [renderData, setRenderData] = useState(null);
    const [currentMax, setCurrentMax] = useState(0);

    const onResize = useDebounceCallback((size) => setSize(size), 200);
    useResizeObserver({ ref: svgRef, onResize });

    useEffect(() => {
        if(size.width === 0 || size.height === 0) return;
        const filterFunc = !props.responseFilter ? (() => true) : ((d) => d[props.responseFilter.question] === props.responseFilter.answer);
        const azimuthData = studyResults.filter(filterFunc).map(d => d.azimuth);
        const newRenderData = azimuthData.reduce((accum, current) => add(accum, current));
        const newMax = max(newRenderData);
        setRenderData(newRenderData);
        setCurrentMax(newMax);
        sliceSelectionRef.current = drawChart(svgRef.current, newRenderData, newMax, props.currentInterval + props.intervalOffset, size, props);
    }, [size, props.responseFilter]);

    useEffect(() => {
        if(!sliceSelectionRef.current || !renderData) return;
        recolorChart(sliceSelectionRef.current, renderData, currentMax, props.currentInterval + props.intervalOffset);
    }, [props.currentInterval]);

    return (
        <Box sx={{position: 'relative', width: '100%', height: '100%'}}>
            <svg ref={svgRef} width='100%' height='100%'></svg>
            <img className='heatmap-head' src='head_top.svg' />
        </Box>
    )
}

function drawChart(svgElement, renderData, currentMax, interval, size, props){
    const svg = d3.select(svgElement);
    svg.selectAll('*').remove();

    const opacityScale = d3.scaleLinear([0, currentMax], [0.1, 1]);

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
            .text('Increasing portion of interval viewing a direction →')
            .attr('font-size', 12)
            .attr('text-anchor', 'end')
            .style('transform', `translate(${size.width}px, 20px)`)

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
    g.datum(renderData[interval]).selectAll('path')
        .data(pie)
        .join('path')
        .attr('fill', SLICE_COLOR)
        .attr('opacity', (d) => SLICE_MASK.includes(d.index) ? opacityScale(d.data) : 0)
        .attr('d', arc)
        .classed('slice', true)
    
    return g;
}

function recolorChart(slices, renderData, currentMax, interval){
    const opacityScale = d3.scaleLinear([0, currentMax], [0.1, 1]);
    slices.datum(renderData[interval]).selectAll('path')
        .data(pie)
        .attr('opacity', (d) => SLICE_MASK.includes(d.index) ? opacityScale(d.data) : 0)
}