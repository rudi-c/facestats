import * as _ from 'underscore';

import * as React from 'react';
import * as ReactDOM from "react-dom";
import ReactTransitionGroup from 'react-addons-transition-group';
import { connect } from 'react-redux';

import * as d3 from 'd3';

import * as Data from '../analysis/data'
import { State } from '../state'

const styles = require('../styles/main.scss');

var width = 960,
    height = 450,
    radius = Math.min(width, height) / 2;

interface Props {
    miscInfo: Data.MiscInfo
}

// http://bl.ocks.org/dbuezas/9306799
// https://www.sitepoint.com/how-react-makes-your-d3-better/
class AnimatedDonut extends React.Component<any, any> {
    constructor(props) {
        super(props);
    }

    componentWillAppear(callback) {
        var svg = d3.select(ReactDOM.findDOMNode(this))

        var pie = d3.pie()
            .sort(null)
            .value(d => (d as any).value);

        var arc = d3.arc()
            .outerRadius(radius * 0.8)
            .innerRadius(radius * 0.4);

        var outerArc = d3.arc()
            .innerRadius(radius * 0.9)
            .outerRadius(radius * 0.9);


        var key = function(d){ return d.data.label; };

        var color = d3.scaleOrdinal(d3.schemeCategory20)
            .domain(["Lorem ipsum", "dolor sit", "amet", "consectetur", "adipisicing", "elit", "sed", "do", "eiusmod", "tempor", "incididunt"])
            .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

        var data = this.props.proportions.map(([threadName, messageCount]) => {
            return { label: threadName, value: messageCount };
        });

        function randomData (){
            var labels = color.domain();
            return labels.map(function(label){
                return { label: label, value: Math.random() }
            });
        }

        function change(data) {
            /* ------- PIE SLICES -------*/
            var slice = svg.select(".slices").selectAll("path.slice")
                .data(pie(data), key);

            slice.enter()
                .append("path") // insert?
                .style("fill", d => color((d as any).data.label))
                .attr("class", "slice");

            slice		
                .transition().duration(1000)
                .attrTween("d", function(d) {
                    (this as any)._current = (this as any)._current || d;
                    var interpolate = d3.interpolate((this as any)._current, d);
                    (this as any)._current = interpolate(0);
                    return function(t) {
                        return arc((interpolate as any)(t));
                    };
                })

            slice.exit()
                .remove();

            /* ------- TEXT LABELS -------*/

            var text = svg.select(".labels").selectAll("text")
                .data(pie(data), key);

            text.enter()
                .append("text")
                .attr("dy", ".35em")
                .text(d => (d as any).data.label);

            function midAngle(d){
                return d.startAngle + (d.endAngle - d.startAngle)/2;
            }

            text.transition().duration(1000)
                .attrTween("transform", function(d) {
                    (this as any)._current = (this as any)._current || d;
                    var interpolate = d3.interpolate((this as any)._current, d);
                    (this as any)._current = interpolate(0);
                    return function(t) {
                        var d2 = interpolate(t) as any;
                        var pos = outerArc.centroid(d2);
                        pos[0] = radius * (midAngle(d2) < Math.PI ? 1 : -1);
                        return "translate("+ pos +")";
                    };
                })
                .styleTween("text-anchor", function(d){
                    (this as any)._current = (this as any)._current || d;
                    var interpolate = d3.interpolate((this as any)._current, d);
                    (this as any)._current = interpolate(0);
                    return function(t) {
                        var d2 = interpolate(t);
                        return midAngle(d2) < Math.PI ? "start":"end";
                    };
                });

            text.exit()
                .remove();

            /* ------- SLICE TO TEXT POLYLINES -------*/

            var polyline = svg.select(".lines").selectAll("polyline")
                .data(pie(data), key);
            
            polyline.enter()
                .append("polyline");

            polyline.transition().duration(1000)
                .attrTween("points", function(d){
                    (this as any)._current = (this as any)._current || d;
                    var interpolate = d3.interpolate((this as any)._current, d);
                    (this as any)._current = interpolate(0);
                    return function(t) {
                        var d2 = interpolate(t) as any;
                        var pos = outerArc.centroid(d2);
                        pos[0] = radius * 0.95 * (midAngle(d2) < Math.PI ? 1 : -1);
                        return [arc.centroid(d2), outerArc.centroid(d2), pos];
                    };			
                } as any)
                .on('end', () => callback());
            
            polyline.exit()
                .remove();
        };

        change(data);
        change(data);

        d3.select(".randomize")
            .on("click", function(){
                change(randomData());
            });
    }

    render() {
        return (
            <g transform={"translate(" + width / 2 + "," + height / 2 + ")"}>
                <g className="slices" />
                <g className="labels" />
                <g className="lines" />
            </g>
        );
    }
}

const RenderConversationDonut = function({ miscInfo }): JSX.Element {
    if (!miscInfo) {
        return null;
    }

    return (
        <div className="donut">
            <button className="randomize">randomize</button> 
            <ReactTransitionGroup component="svg">
                <AnimatedDonut proportions={miscInfo.messageProportions} />
            </ReactTransitionGroup>
        </div>
    );
}

const mapStateToProps = function(state : State): Props {
    return {
        miscInfo: state.miscInfo
    }
}

const ConversationDonut = connect(mapStateToProps)(RenderConversationDonut)

export default ConversationDonut
