import { Paper, Divider, Button, Grid, Stack, Box } from '@mui/material';
import { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { isEmpty } from 'lodash';
import { useResizeObserver, useDebounceCallback } from 'usehooks-ts';
import bubbleData from '../../data/placeholder_bubble_data.json'

export default function SurveyBubble(props){
    const svgRef = useRef(null);
    const [size, setSize] = useState({ width: 0, height: 0 });

    const onResize = useDebounceCallback((size) => setSize(size), 200);
    useResizeObserver({ ref: svgRef, onResize });

    useEffect(() => {
        if(size.width === 0 || size.height === 0) return;
        drawChart(svgRef.current, size);
    }, [size]);
    
    return (
        <Box sx={{ width: '100vw', height: '100vh', minHeight: '720px', backgroundColor: '#429485'}}>
            <h1>What factors should AI-generated scenes consider?</h1>
            <Box sx={{width: '70%', height: '70%', margin: "auto", backgroundColor: "none", borderRadius: '20px'}}>
                <svg ref={svgRef} width='100%' height='100%' textAnchor='middle'></svg>
            </Box>
        </Box>
    )
}

function drawChart(svgElement, size){
    const svg = d3.select(svgElement);
    svg.selectAll('*').remove();

    const color = d3.scaleOrdinal([true, false], ['#05BFDB', 'gold'])

    const pack = d3.pack()
        .size([size.width - 20, size.height - 20])
        .padding(3);

    const root = pack(d3.hierarchy({children: bubbleData})
        .sum(d => d.value)); // track how large the encompassing node should be

    const g = svg.append('g')

    const node = g.selectAll('circle')
        .data(root.leaves())
        .join('circle')
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)
        .attr('r', d => d.r)
        .attr('fill', d => color(d.data.positive))
    
    const text = g.selectAll('text')
        .data(root.leaves())
        .join('text')
        .attr('x', d => d.x)
        .attr('y', d => d.y)
        .text(d => d.data.term)
}