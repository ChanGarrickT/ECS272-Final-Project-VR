import { Paper, Divider, Button, Grid, Stack, Box } from '@mui/material';
import { useState, useEffect, useRef, forwardRef } from 'react';
import * as d3 from 'd3';
import * as d3Sankey from 'd3-sankey';
import { isEmpty } from 'lodash';
import { useResizeObserver, useDebounceCallback } from 'usehooks-ts';
import surveyData from '../../data/sankey_data.json';

const [graphNodes, graphLinks] = genGraph();

export default function SankeyDiagram(props){
    const svgRef = useRef(null);
    const rectsSelectionRef = useRef(null);
    const pathsSelectionRef = useRef(null);
    const [size, setSize] = useState({ width: 0, height: 0 });
    const [currentNode, setCurrentNode] = useState(null);

    const onResize = useDebounceCallback((size) => setSize(size), 200);
    useResizeObserver({ ref: svgRef, onResize });

    useEffect(() => {
        if(size.width === 0 || size.height === 0) return;
        const [rects, paths] = drawChart(svgRef.current, selectNode, size);
        rectsSelectionRef.current = rects;
        pathsSelectionRef.current = paths;
        recolorChart(rectsSelectionRef.current, pathsSelectionRef.current, currentNode);
    }, [size]);

    useEffect(() => {
        if(size.width === 0 || size.height === 0) return;
        if(!rectsSelectionRef || !pathsSelectionRef.current) return;
        recolorChart(rectsSelectionRef.current, pathsSelectionRef.current, currentNode);
        if(props.setResponseFilter){
            if(currentNode) props.setResponseFilter({question: `q${currentNode.questionNumber+1}`, answer: currentNode.answerNumber});
            else props.setResponseFilter(null);
        }
    }, [currentNode]);

    function selectNode(d){
        // Note the currently active node
        setCurrentNode((prev) => {
            if(!prev || d.index !== prev.index){
                return {
                    questionNumber: d.questionNumber,
                    answerNumber: d.answerNumber,
                    answer: d.name,
                    index: d.index
                };
            } else {
                return null;
            }
        });
    }

    return (
        <svg ref={svgRef} width='100%' height='100%'></svg>
    )
}

function genGraph(){
    const keys = ["experience", "before", "during", "after"];
    const qas = [
        ['Never', 'Once/few times before', 'Occasionally / Regularly'],
        ['More than typical', 'About typical', 'Less than typical'],
        ['More stressed', 'About the same', 'Less stressed'],
        ['Increased', 'Not much', 'Reduced']
    ]
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
            const questionNumber = keys.indexOf(k);
            const node = {name: d[k], questionNumber: questionNumber, answerNumber: qas[questionNumber].indexOf(d[k]), index: ++index};
            nodes.push(node);
            nodeByKey.set(key, node);
            indexByKey.set(key, index);
        }
    }
    
    for(let i = 1; i < keys.length; ++i){
        const a = keys[i-1];
        const b = keys[i];
        const prefix = [...keys];
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
            if(link.value !== 0){
                links.push(link);
            }
            linkByKey.set(names, link);
        }
    }

    return [nodes, links];
}

function drawChart(svgElement, clickFunc, size){
    const sankey = d3Sankey.sankey()
        .nodeSort(null)
        .linkSort(null)
        .nodeWidth(20)
        .nodePadding(20)
        .extent([[0, 0], [size.width, size.height]]);

    const svg = d3.select(svgElement);
    svg.selectAll('*').remove();

    // Clone node and link arrays
    // sankey() adds properties (coordinates, path width, etc.) to nodes and links
    const {nodes, links} = sankey({
        nodes: graphNodes.map(d => Object.create(d)),
        links: graphLinks.map(d => Object.create(d))
    });

    // Links
    const paths = svg.append('g')
            .attr('fill', 'none')   // We don't want fill on these paths
        .selectAll('path')
        .data(links)
        .join('path')
        .attr('d', d3Sankey.sankeyLinkHorizontal())
        .classed('path-link', true)
        .attr('stroke-width', d => d.width);
    
    paths.append('title')
            .text(d => `${d.names.join(" → ")}\n${d.value}`);
    
    // Node rectangles
    const rects = svg.append('g')
            .attr('fill', 'none')
        .selectAll('rect')
        .data(nodes.filter(d => d.value > 0))
        .join('rect')
        .attr('x', d => d.x0)
        .attr('y', d => d.y0)
        .attr('width', d => d.x1 - d.x0)
        .attr('height', d => d.y1 - d.y0)
        .classed('rect-node', true)
        .on('click', (event, d) => clickFunc(d));
    
    rects.append('title')
        .text(d => `${d.name}\n${d.value}`);

    // Labels
    svg.append('g')
        .selectAll('text')
        .data(nodes.filter(d => d.value > 0))
        .join('text')
        .text(d => d.name)
        .attr('font-weight', 'bold')
        .attr('text-anchor', d => d.questionNumber <= 1 ? 'start' : 'end')
        .attr('dominant-baseline', 'middle')
        .style('transform', function(d){
            if(d.questionNumber <= 1){
                return `translate(${d.x1 + 10}px, ${(d.y1 + d.y0) / 2}px)`;
            } else {
                return `translate(${d.x0 - 10}px, ${(d.y1 + d.y0) / 2}px)`;
            }
        });

    return [rects, paths];
}

function recolorChart(rects, paths, currentNode){
    // Clear all highlighting
    rects.classed('rect-node-selected', false);
    paths.classed('path-link-active', false);
    if(currentNode){
        // Highlight selected node
        rects.filter(d => d.index === currentNode.index)
            .classed('rect-node-selected', true);
        // Highlight links that connect to the highlighted node
        paths.filter(d => d.names[currentNode.questionNumber] === currentNode.answer)
            .classed('path-link-active', true);
    }
}