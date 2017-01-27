import * as _ from 'underscore';

import * as React from 'react';
import * as ReactDOM from "react-dom";
import { connect } from 'react-redux';

import * as d3 from "d3";

import { State } from '../state'
import D3Harness from './d3-harness'

interface Props {
    conversationStarts: Map<string, [Date, number][]>
}

// Based off http://bl.ocks.org/mbostock/3884955
// TODO: A legend would be nice so that the names don't pile up on each other
// TODO: Would a barplot be more readable than a line plot?
class ReactConversationsTimeline extends D3Harness<Props> {
    constructor(props) {
        super(props);
    }

    generate(next: Props) {
        // Need large right margin since the name of people show up on the right.
        const margin = {top: 20, right: 100, bottom: 30, left: 50};
        const width = 700 - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;

        d3.select(ReactDOM.findDOMNode(this)).selectAll("*").remove();

        const svg = d3.select(ReactDOM.findDOMNode(this))
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        const parties = Array.from(next.conversationStarts.keys());
        const firstList = next.conversationStarts.get(parties[0]);
        const timeRange: [Date, Date] = [_.first(firstList)[0], _.last(firstList)[0]];
        const conversationsMax = d3.max(parties.map(name =>
            d3.max(next.conversationStarts.get(name), d => d[1])
        ));

        const x = d3.scaleTime().range([0, width]).domain(timeRange);
        const y = d3.scaleLinear().range([height, 0]).domain([0, conversationsMax]);
        const z = d3.scaleOrdinal(d3.schemeCategory10).domain(parties);
        const line = d3.line()
            .curve(d3.curveLinear)
            .x(d => x(d[0] as any))
            .y(d => y(d[1]));

        svg.append("g")
           .attr("class", "axis")
           .attr("transform", "translate(0, " + height + ")")
           .call(d3.axisBottom(x));

        svg.append("g")
           .attr("class", "axis")
           .call(d3.axisLeft(y));

        const city = svg.selectAll(".name")
            .data(parties)
            .enter()
            .append("g")
            .attr("class", "name");

        city.append("path")
            .attr("class", "line")
            .attr("d", d => line(next.conversationStarts.get(d) as any))
            .style("stroke", d => z(d));

        city.append("text")
            .datum(d => ({
                id: d,
                value: _.last(next.conversationStarts.get(d))
            }))
            .attr("transform", d => ("translate(" + x(d.value[0])) + "," + y(d.value[1]) + ")")
            .attr("x", 3)
            .attr("dy", "0.35em")
            .style("font", "10px sans-serif")
            .text(d => d.id);
    }
}

const RenderConversationsTimeline = function({ conversationStarts }: Props): JSX.Element {
    if (!conversationStarts) {
        return null;
    }

    return (
        <div className="conversations-timeline">
            <ReactConversationsTimeline conversationStarts={conversationStarts} />
        </div>
    );
}

const mapStateToProps = function(state : State): Props {
    return {
        conversationStarts: state.conversationStarts,
    }
}

const ConversationsTimeline = connect(mapStateToProps)(RenderConversationsTimeline)

export default ConversationsTimeline