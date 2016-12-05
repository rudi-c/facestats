import * as _ from 'underscore';

import * as React from 'react';
import { connect } from 'react-redux';

import * as d3 from 'd3';
import Faux from 'react-faux-dom'

import { State } from '../state'

interface Props {
    punchcard: number[][]
}

const hours = _.flatten([
    '12a', _.range(1, 12).map(n => n + 'a'),
    '12p', _.range(1, 12).map(n => n + 'p')
]);

// Monday == 0, Sunday == 6
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const RenderPunchcard = function({ punchcard }: Props): JSX.Element {
    if (!punchcard) {
        return null;
    }

    const maxCount = _.max(_.flatten(punchcard));

    var margin = {top: 20, right: 20, bottom: 30, left: 50},
        width = 700 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    // var x = d3.scaleTime()
    //     .range([0, width]);

    // var y = d3.scaleLinear()
    //     .range([height, 0]);

    // var area = d3.area()
    //     .x(function(d) { return x(d[0] as any); })
    //     .y0(height)
    //     .y1(function(d) { return y(d[1]); });

    var fauxDiv = Faux.createElement('div')

    var svg = d3.select(fauxDiv).append('svg')
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    const row = svg.selectAll("g")
       .data(punchcard)
       .enter()
       .append("g")
       .attr("transform", (row, i) => "translate(0, " + i * 50 + ")");

    row.append("text")
       .text((row, i) => days[i]);

    row.selectAll("g")
       .data(row => row)
       .enter()
       .append("circle")
       .attr("transform", (count, i) => "translate(" + (i * 20 + 100) + ", 0)")
       .attr("r", (count, i) => Math.sqrt(count / maxCount) * 10);

    svg.append("g")
       .attr("transform", "translate(0, " + 7 * 50 + ")")
       .selectAll("text")
       .data(hours)
       .enter()
       .append("text")
       .attr("text-anchor", "middle")
       .attr("transform", (count, i) => "translate(" + (i * 20 + 100) + ", 0)")
       .text(time => time);

    return fauxDiv.toReact();
}

const mapStateToProps = function(state : State): Props {
    return {
        punchcard: state.punchcard,
    }
}

const Punchcard = connect(mapStateToProps)(RenderPunchcard)

export default Punchcard