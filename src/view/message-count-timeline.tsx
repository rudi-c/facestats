import * as React from 'react';
import { connect } from 'react-redux';

import * as d3 from 'd3';
import Faux from 'react-faux-dom'

import { State } from '../state'

interface MessageCountTimelineProps {
    msgCountByDate: [Date, number][]
    maxMessagesInDay: number
}

const RenderMessageCountTimeline = function(
    { msgCountByDate, maxMessagesInDay }: MessageCountTimelineProps): JSX.Element {

    if (!msgCountByDate) {
        return null;
    }

    var margin = {top: 20, right: 20, bottom: 30, left: 50},
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    var x = d3.scaleTime()
        .range([0, width]);

    var y = d3.scaleLinear()
        .range([height, 0]);

    var area = d3.area()
        .x(function(d) { return x(d[0] as any); })
        .y0(height)
        .y1(function(d) { return y(d[1]); });

    var fauxDiv = Faux.createElement('div')

    var svg = d3.select(fauxDiv).append('svg')
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    x.domain([msgCountByDate[0][0], msgCountByDate[msgCountByDate.length - 1][0]]);
    y.domain([0, maxMessagesInDay]);

    svg.append("path")
        .datum(msgCountByDate)
        .attr("class", "area")
        .attr("d", area as any);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    svg.append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft(y))
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Price ($)");

    return fauxDiv.toReact();
}

const mapStateToProps = function(state : State): MessageCountTimelineProps {
    return {
        msgCountByDate: state.msgCountByDate,
        maxMessagesInDay: state.maxMessagesInDay,
    }
}

const MessageCountTimeline = connect(mapStateToProps)(RenderMessageCountTimeline)

export default MessageCountTimeline