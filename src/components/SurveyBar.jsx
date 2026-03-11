import { FormControl, FormControlLabel, FormLabel, Radio, RadioGroup, Box } from '@mui/material';
import { useState, useEffect, useRef, forwardRef } from 'react';
import * as d3 from 'd3';
import { isEmpty } from 'lodash';
import { useResizeObserver, useDebounceCallback } from 'usehooks-ts';
import studyResults from '../../data/study_data.json';

import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";  
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(useGSAP, ScrollTrigger);

const margins = {top: 60, bottom: 80, left: 60, right: 10};
const [POSITIVE_COLOR, NEGATIVE_COLOR] = ['#81c8f2', '#77af77']

let barData = [];
let words = new Set();
// Generate data structure for the chart
const positiveTermCount = {}
const negativeTermCount = {}
for(const d of studyResults){
    for(const t of d.pTerms) {
        if(Object.hasOwn(positiveTermCount, t)) positiveTermCount[t] += 1;
        else positiveTermCount[t] = 1;
        words.add(t);
    }
    for(const t of d.nTerms) {
        if(Object.hasOwn(negativeTermCount, t)) negativeTermCount[t] += 1;
        else negativeTermCount[t] = 1;
        words.add(t);
    }
}
for(const word of words){
    barData.push({
        term: word,
        positive: positiveTermCount[word] ? positiveTermCount[word] : 0,
        negative: negativeTermCount[word] ? negativeTermCount[word] : 0
    })
}

let maxCount = 0;
for (const d of barData){
    maxCount = Math.max(maxCount, d.positive, d.negative);
}

const SurveyBar = forwardRef((props, ref) => {
    const svgRef = useRef(null);
    const [positiveBarsRef, negativeBarsRef, xAxisRef, yScaleRef] = [useRef(null), useRef(null), useRef(null), useRef(null)];
    const [size, setSize] = useState({ width: 0, height: 0 });
    const [data, setData] = useState([...barData].toSorted(getSortFunc('total')));
    const [currentSortMode, setSortMode] = useState('total');

    const onResize = useDebounceCallback((size) => setSize(size), 200);
    useResizeObserver({ ref: svgRef, onResize });

    useEffect(() => {
        if(size.width === 0 || size.height === 0) return;
        [positiveBarsRef.current, negativeBarsRef.current, xAxisRef.current, yScaleRef.current] = drawChart(svgRef.current, size);
        reorderChart(data, size, positiveBarsRef.current, negativeBarsRef.current, xAxisRef.current, yScaleRef.current);
    }, [size]);

    useEffect(() => {
        if(!positiveBarsRef.current || !negativeBarsRef.current || !xAxisRef.current) return;
        setData((prev) => {
            const newOrder = [...prev].toSorted(getSortFunc(currentSortMode));
            reorderChart(newOrder, size, positiveBarsRef.current, negativeBarsRef.current, xAxisRef.current, yScaleRef.current);
            return newOrder;
        })
    }, [currentSortMode]);

    useGSAP(() => {
        gsap.from('#bar-page-chart', {
            opacity: 0,
            transform: 'rotateY(22deg)',
            stagger: 0.1,
            scrollTrigger: {
                trigger: '#bar-page-chart',
                start: 'top 60%',
                end: 'top 40%',
                scrub: true
            }
        })
    });
    
    return (
        <Box ref={ref} sx={{position: 'relative', width: '100vw', height: '100vh', minHeight: '720px', paddingBottom: '50px'}}>
            <Box className='header-box'>
                <h1>What factors should AI-generated scenes consider?</h1>
                <p>
                    We asked participants what aspects of the AI-generated VR experience they liked (blue) or disliked (yellow).
                    This bar chart shows how many participants noted particular key terms in their feedback.
                    Note that the same feature could be viewed positively by one participant and negatively by another.
                </p>
            </Box>
            <Box id='bar-page-chart' sx={{width: '70%', height: '60%', margin: '50px auto', backgroundColor: "none", borderRadius: '20px'}}>
                <svg ref={svgRef} width='100%' height='100%' textAnchor='middle' dominantBaseline='middle'><g></g></svg>
            </Box>
            <Box sx={{width: '100vw', display: 'flex', justifyContent: 'center'}}>
                <FormControl>
                    <FormLabel>Sort by</FormLabel>
                    <RadioGroup row defaultValue={'total'} onChange={(e) => setSortMode(e.target.value)}>
                        <FormControlLabel value="total" control={<Radio />} label="Total" />
                        <FormControlLabel value="positive" control={<Radio />} label="Positive Aspects" />
                        <FormControlLabel value="negative" control={<Radio />} label="Aspects to Improve" />
                        <FormControlLabel value="alpha" control={<Radio />} label="Alphabetically" />
                    </RadioGroup>
                </FormControl>
            </Box>
        </Box>
    )
});

export default SurveyBar;

function drawChart(svgElement, size){
    const svg = d3.select(svgElement);
    svg.selectAll('*').remove();

    // Draw Title
    svg.append('text')
        .text('Feedback Key Terms by Mention Count')
        .attr('font-size', 26)
        .attr('font-weight', 'bold')
        .style('transform', `translate(${size.width / 2}px, 20px)`);

    // Construct y scale
    const yScale = d3.scaleLinear()
        .domain([0, maxCount + 2])
        .range([size.height - margins.bottom, margins.top]);    

    // Make bar groups
    const positiveBars = svg.append('g')
    const negativeBars = svg.append('g')
    
    // Draw axes
    const xAxis = svg.append('g')
        .classed('xAxis', true)
        .attr('transform', `translate(0, ${size.height - margins.bottom})`)

    const yAxis = svg.append('g')
        .classed('yAxis', true);
    yAxis
        .attr('transform', `translate(${margins.left}, 0)`)
        .call(d3.axisLeft(yScale));

    // Draw axis labels
    svg.append('g')
        .attr('transform', `translate(${(size.width + margins.left - margins.right) / 2}, ${size.height - 12})`)
        .append('text')
        .text('Key Terms in Responses')
        .style('font-size', '1.25rem')
    svg.append('g')
        .attr('transform', `translate(12, ${(size.height - margins.bottom + margins.top) / 2}) rotate(-90)`)
        .append('text')
        .text('Count')
        .style('font-size', '1.25rem')

    // Draw legend
    svg.append('rect')
        .attr('x', size.width - 270)
        .attr('y', 30)
        .attr('width', 30)
        .attr('height', 30)
        .attr('fill', POSITIVE_COLOR)
    svg.append('rect')
        .attr('x', size.width - 270)
        .attr('y', 70)
        .attr('width', 30)
        .attr('height', 30)
        .attr('fill', NEGATIVE_COLOR)
    svg.append('text')
        .attr('text-anchor', 'start')
        .attr('transform', `translate(${size.width - 220}, 47)`)
        .text('Positive Aspect')
    svg.append('text')
        .attr('text-anchor', 'start')
        .attr('transform', `translate(${size.width - 220}, 87)`)
        .text('Aspect to Improve')
    
    return [positiveBars, negativeBars, xAxis, yScale]
}

function reorderChart(data, size, positiveBars, negativeBars, xAxis, yScale){
    const terms = [];
    for (const d of data){
        terms.push(d.term);
    }

    // Construct x scale
    const xScale = d3.scaleBand()
        .domain(terms)
        .range([margins.left, size.width - margins.right]);

    // Draw or reorder bars
    positiveBars.selectAll('rect')
        .data(data, d => d.term)
        .join(
            function(enter){
                enter.append('rect')
                    .attr('x', d => xScale(d.term) + xScale.bandwidth() * 0.1)
                    .attr('y', d => yScale(d.positive))
                    .attr('width', xScale.bandwidth() * 0.4)
                    .attr('height', d => Math.abs(yScale(0) - yScale(d.positive)))
                    .attr('fill', POSITIVE_COLOR)
            },
            function(update){
                update.transition()
                    .duration(200)
                    .attr('x', d => xScale(d.term) + xScale.bandwidth() * 0.1)
                    .attr('y', d => yScale(d.positive))
            },
            exit => exit
        )
    positiveBars.selectAll('text')
        .data(data, d => d.term)
        .join(
            function(enter){
                enter.append('text')
                    .text(d => `${d.positive}`)
                    .attr('font-size', 16)
                    .attr('text-anchor', 'middle')
                    .attr('x', d => xScale(d.term) + xScale.bandwidth() * 0.3)
                    .attr('y', d => yScale(d.positive) - 15)
            },
            function(update){
                update.transition()
                    .duration(200)
                    .attr('x', d => xScale(d.term) + xScale.bandwidth() * 0.3)
                    .attr('y', d => yScale(d.positive) - 15)
            },
            exit => exit
        )        
    negativeBars.selectAll('rect')
        .data(data, d => d.term)
        .join(
            function(enter){
                enter.append('rect')
                    .attr('x', d => xScale(d.term) + xScale.bandwidth() * 0.5)
                    .attr('y', d => yScale(d.negative))
                    .attr('width', xScale.bandwidth() * 0.4)
                    .attr('height', d => Math.abs(yScale(0) - yScale(d.negative)))
                    .attr('fill', NEGATIVE_COLOR)
            },
            function(update){
                update.transition()
                    .duration(200)
                    .attr('x', d => xScale(d.term) + xScale.bandwidth() * 0.5)
                    .attr('y', d => yScale(d.negative))
            },
            exit => exit
        )
    negativeBars.selectAll('text')
        .data(data, d => d.term)
        .join(
            function(enter){
                enter.append('text')
                    .text(d => `${d.negative}`)
                    .attr('font-size', 16)
                    .attr('text-anchor', 'middle')
                    .attr('x', d => xScale(d.term) + xScale.bandwidth() * 0.7)
                    .attr('y', d => yScale(d.negative) - 15)
            },
            function(update){
                update.transition()
                    .duration(200)
                    .attr('x', d => xScale(d.term) + xScale.bandwidth() * 0.7)
                    .attr('y', d => yScale(d.negative) - 15)
            },
            exit => exit
        )   
    
    xAxis.call(d3.axisBottom(xScale));
}

function getSortFunc(sortMode){
    if(sortMode === 'positive'){
        return function(a, b){
            const diff = b.positive - a.positive;
            if(diff !== 0) return diff;
            else return b.negative - a.negative;
        }
    }
    if(sortMode === 'negative'){
        return function(a, b){
            const diff = b.negative - a.negative;
            if(diff !== 0) return diff;
            else return b.positive - a.positive;
        }
    }
    if(sortMode === 'alpha'){
        return function(a, b){return a.term.localeCompare(b.term)};
    }
    return function(a, b){
        const diff = b.positive + b.negative - a.positive - a.negative;
        if(diff !== 0) return diff;
        else return b.positive - a.positive;
    }
}