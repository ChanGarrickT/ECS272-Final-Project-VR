import * as d3 from 'd3';

export function showTooltip(e, text, ref){
	d3.select(ref.current)
		.text(text)
		.style('left', `${e.clientX + 10}px`)
		.style('top', `${e.clientY + 10}px`)
		.transition()
		.duration(150)
		.style('opacity', 1)
}

export function moveTooltip(e, ref){
	d3.select(ref.current)
		.style('left', `${e.clientX + 10}px`)
		.style('top', `${e.clientY + 10}px`)
}

export function hideTooltip(ref){
	d3.select(ref.current)
		.transition()
		.duration(150)
		.style('opacity', 0)
}