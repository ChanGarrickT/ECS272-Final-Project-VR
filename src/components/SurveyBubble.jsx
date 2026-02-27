import { Paper, Divider, Grid, Stack, Box } from '@mui/material';
import { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { isEmpty } from 'lodash';
import { useResizeObserver, useDebounceCallback } from 'usehooks-ts';
import bubbleData from '../../data/placeholder_bubble_data.json'

export default function SurveyBubble(props){
    const svgRef = useRef(null);
    const [size, setSize] = useState({ width: 0, height: 0 });
    const [currentFilter, setCurrentFilter] = useState('');

    const onResize = useDebounceCallback((size) => setSize(size), 200);
    useResizeObserver({ ref: svgRef, onResize });

    useEffect(() => {
        if(size.width === 0 || size.height === 0) return;
        drawChart(svgRef.current, currentFilter, size);
    }, [size, currentFilter]);
    
    return (
        <Box sx={{ width: '100vw', height: '100vh', minHeight: '720px', backgroundColor: '#429485'}}>
            <Box sx={{width: '70%', margin: 'auto', color: 'white'}}>
                <h1>What factors should AI-generated scenes consider?</h1>
                <p>We asked participants what aspects of the AI-generated VR experience contributed to a decrease in stress (blue circles) or increase in stress (yellow circles).</p>
            </Box>
            <Box sx={{width: '70%', height: '70%', margin: 'auto', backgroundColor: "none", borderRadius: '20px'}}>
                <svg ref={svgRef} width='100%' height='100%' textAnchor='middle' dominantBaseline='middle'><g></g></svg>
                <Stack divider={<Divider orientation='vertical' flexItem/>} direction={'row'} justifyContent={'center'} sx={{margin: '10px auto'}}>
                    <Box className='bubble-filter' onClick={() => setCurrentFilter('')}>All</Box>
                    <Box className='bubble-filter' onClick={() => setCurrentFilter('positive')}>Positive Aspects</Box>
                    <Box className='bubble-filter' onClick={() => setCurrentFilter('negative')}>Aspects to Improve</Box>
            </Stack>
            </Box>
        </Box>
    )
}

function drawChart(svgElement, currentFilter, size){
    const svg = d3.select(svgElement);

    const color = d3.scaleOrdinal([true, false], ['#05BFDB', 'gold'])

    const pack = d3.pack()
        .size([size.width - 20, size.height - 20])
        .padding(3);

    const root = pack(d3.hierarchy({children: bubbleData.filter((d) => filterTerm(d, currentFilter))})
        .sum(d => d.value)                      // track how large the encompassing node should be
        .sort((a, b) => b.value - a.value));    // put larger circles in the middle

    const g = svg.select('g')

    const node = g.selectAll('circle')
        .data(root.leaves(), d => `${d.data.term}-${d.data.positive.toString()}`)
        .join(
            function(enter){
                enter.append('circle')
                    .attr('cx', d => d.x)
                    .attr('cy', d => d.y)
                    .attr('r', d => d.r)
                    .attr('fill', d => color(d.data.positive))
            },
            function(update){
                update
                    .transition()
                    .duration(200)
                    .attr('cx', d => d.x)
                    .attr('cy', d => d.y)
                    .attr('r', d => d.r)
            },
            function(exit){
                exit
                    .transition()
                    .duration(200)
                    .attr('r', 0)
                    .remove()
            }
        );
        
    g.selectAll('text').remove();
    g.selectAll('text')
        .data(root.leaves())
        .join('text')
        .attr('x', d => d.x)
        .attr('y', d => d.y)
        .text(d => d.data.term)
        .attr('opacity', 0)
        .transition()
        .duration(200)
        .delay(100)
        .attr('opacity', 1);
}

function filterTerm(d, currentFilter){
    if(currentFilter === '') return true;
    if(currentFilter === 'positive') return d.positive;
    if(currentFilter === 'negative') return !d.positive;
}