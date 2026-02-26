import { Paper, Divider, Button, Grid, Stack, Box } from '@mui/material';
import { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import * as d3Sankey from 'd3-sankey';
import { isEmpty } from 'lodash';
import { useResizeObserver, useDebounceCallback } from 'usehooks-ts';
import surveyData from '../../data/placeholder_sankey_data.json';

const [graphNodes, graphLinks] = genGraph();

function genGraph(){
    const keys = ["experience", "before", "during", "after"];
    let index = -1;
    const nodes = [];
    const links = [];
    // This setup allows arrays and other non-primitives to be used as keys, whereas vanilla Map compares by instance
    // Here, compare key equality of stringified arrays
    // Ex. key: ['before', 'More than typical'] value: {name: 'More than typical'}
    const nodeByKey = new d3.InternMap([], JSON.stringify);
    // Ex. key: ['before', 'More than typical'] value: 4
    const indexByKey = new d3.InternMap([], JSON.stringify);

    // Get a list of all unique keys, to draw node rectangles
    for(const k of keys){
        for(const d of surveyData){
            const key = [k, d[k]];
            if(nodeByKey.has(key)) continue;
            const node = {name: d[k]};
            nodes.push(node);
            nodeByKey.set(key, node);
            indexByKey.set(key, ++index);
        }
    }
    
    for(let i = 1; i < keys.length; ++i){
        const a = keys[i-1];
        const b = keys[i];
        const prefix = keys.slice(0, i+1);
        // Ex. key: ['Never', 'More than typical', 'More stressed', 'Increased']
        // Ex. value: {names: <same as key, used for tooltips>, source: 7, target: 10, value: 0}
        const linkByKey = new d3.InternMap([], JSON.stringify);
        for(const d of surveyData){
            const names = prefix.map(k => d[k]);
            const value = d.value;
            let link = linkByKey.get(names);
            if(link){
                link.value += value;
                continue;
            }
            link = {
                source: indexByKey.get([a, d[a]]),
                target: indexByKey.get([b, d[b]]),
                names,
                value
            };
            links.push(link);
            linkByKey.set(names, link);
        }
    }

    return [nodes, links];
}

export default function SurveySankey(props){
    const svgRef = useRef(null);
    const [size, setSize] = useState({ width: 0, height: 0 });

    const onResize = useDebounceCallback((size) => setSize(size), 200);
    useResizeObserver({ ref: svgRef, onResize });

    useEffect(() => {
        if(size.width === 0 || size.height === 0) return;
        drawChart(svgRef.current, size);
    }, [size]);

    return (
        <Box sx={{ width: '100vw', height: '100vh', minHeight: '720px', backgroundColor: '#ff7b42'}}>
            <h1>Can AI-generated VR scenes relieve stress?</h1>
            <Box sx={{width: '70%', height: '70%', margin: "auto", backgroundColor: "none", borderRadius: '20px'}}>
                <svg ref={svgRef} width='100%' height='100%'></svg>
            </Box>
        </Box>
    )
}

function drawChart(svgElement, size){
    const sankey = d3Sankey.sankey()
        .nodeSort(null)
        .linkSort(null)
        .nodeWidth(20)
        .nodePadding(20)
        .extent([[0, 0], [size.width, size.height]]);

    const color = d3.scaleOrdinal(['Never'], ['#FFDDDD']).unknown('#CCC');

    const svg = d3.select(svgElement);
    svg.selectAll('*').remove();

    // Clone node and link arrays
    // sankey() adds properties (coordinates, path width, etc.) to nodes and links
    const {nodes, links} = sankey({
        nodes: graphNodes.map(d => Object.create(d)),
        links: graphLinks.map(d => Object.create(d))
    });

    // Node rectangles
    svg.append('g')
            .attr('fill', 'none')
        .selectAll('rect')
        .data(nodes)
        .join('rect')
        .attr('x', d => d.x0)
        .attr('y', d => d.y0)
        .attr('width', d => d.x1 - d.x0)
        .attr('height', d => d.y1 - d.y0)
        .attr('fill', 'black')
        .attr('stroke', 'black')
        .attr('stroke-width', 1)
        .append('title')
            .text(d => `${d.name}\n${d.value}`)

    // Links
    svg.append('g')
            .attr('fill', 'none')   // We don't want fill on these paths
        .selectAll('path')
        .data(links)
        .join('path')
        .attr('d', d3Sankey.sankeyLinkHorizontal())
        .attr('stroke', d => color(d.names[0]))
        .attr('stroke-width', d => d.width)
        .style('mix-blend-mode', 'multiply')
        .append('title')
            .text(d => `${d.names.join(" → ")}\n${d.value}`)
}