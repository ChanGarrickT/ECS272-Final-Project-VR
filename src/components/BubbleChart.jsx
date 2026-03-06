import { Paper, Divider, Grid, Stack, Box } from '@mui/material';
import { useState, useEffect, useRef, forwardRef } from 'react';
import * as d3 from 'd3';
import { isEmpty } from 'lodash';
import { useResizeObserver, useDebounceCallback } from 'usehooks-ts';
import bubbleData from '../../data/placeholder_bubble_data.json';
import studyResults from '../../data/placeholder_combined_data.json';

const [POSITIVE_COLOR, NEGATIVE_COLOR] = ['#63bcf0', '#6a9e6a']

export default function BubbleChart(props){
    const svgRef = useRef(null);
    const [size, setSize] = useState({ width: 0, height: 0 });

    const onResize = useDebounceCallback((size) => setSize(size), 200);
    useResizeObserver({ ref: svgRef, onResize });

    useEffect(() => {
        if(size.width === 0 || size.height === 0) return;
        const filterFunc = !props.responseFilter ? (() => true) : ((d) => d[props.responseFilter.question] === props.responseFilter.answer);
        // Generate data structure for the chart
        const positiveTermCount = {}
        const negativeTermCount = {}
        for(const d of studyResults.filter(filterFunc)){
            for(const t of d.pTerms) {
                if(Object.hasOwn(positiveTermCount, t)) positiveTermCount[t] += 1;
                else positiveTermCount[t] = 1;
            }
            for(const t of d.nTerms) {
                if(Object.hasOwn(negativeTermCount, t)) negativeTermCount[t] += 1;
                else negativeTermCount[t] = 1;
            }
        }
        let terms = [];
        for(const [key, value] of Object.entries(positiveTermCount)){
            terms.push({
                term: key,
                value: value,
                positive: true
            })
        }
        for(const [key, value] of Object.entries(negativeTermCount)){
            terms.push({
                term: key,
                value: value,
                positive: false
            })
        }
        drawChart(svgRef.current, terms, size);
    }, [size, props.responseFilter]);
    
    return (
        <Box sx={{width: '100%', height: '100%'}}>
            <svg ref={svgRef} width='100%' height='100%' textAnchor='middle' dominantBaseline='middle'><g></g></svg>
        </Box>
    )
};

function drawChart(svgElement, terms, size){
    const svg = d3.select(svgElement);

    const color = d3.scaleOrdinal([true, false], [POSITIVE_COLOR, NEGATIVE_COLOR]);

    const pack = d3.pack()
        .size([size.width - 20, size.height - 20])
        .padding(3);

    const root = pack(d3.hierarchy({children: terms})
        .sum(d => d.value)                      // track how large the encompassing node should be
        .sort((a, b) => b.value - a.value));    // put larger circles in the middle

    const g = svg.select('g')
        .attr('transform', `translate(${size.width * 0.1}, 0)`);

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
    
    // Draw legend
    svg.selectAll('.legend').remove();
    svg.append('rect')
        .attr('x', 0)
        .attr('y', size.height / 2 - 25)
        .attr('width', 20)
        .attr('height', 20)
        .attr('fill', POSITIVE_COLOR)
        .classed('legend', true)
    svg.append('rect')
        .attr('x', 0)
        .attr('y', size.height / 2 + 5)
        .attr('width', 20)
        .attr('height', 20)
        .attr('fill', NEGATIVE_COLOR)
        .classed('legend', true)
    svg.append('text')
        .attr('text-anchor', 'start')
        .attr('transform', `translate(30, ${size.height / 2 - 15})`)
        .text('Positive Aspect')
        .classed('legend', true)
    svg.append('text')
        .attr('text-anchor', 'start')
        .attr('transform', `translate(30, ${size.height / 2 + 15})`)
        .text('Aspect to Improve')
        .classed('legend', true)
}