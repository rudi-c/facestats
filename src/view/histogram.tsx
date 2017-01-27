import * as _ from 'underscore';

import * as React from 'react';
import * as ReactDOM from "react-dom";
import { connect } from 'react-redux';

import * as d3 from "d3";

import { mapMap } from '../analysis/helpers'

import { State } from '../state'
import D3Harness from './d3-harness'

interface Props {
    values: Map<string, Map<number, number>>
    stacked: boolean
}

const bins = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000]

function findBin(value: number): string {
    if (value < bins[0]) {
        throw "Expected non-negative values"
    }
    for (let i = 0; i < bins.length - 1; i++) {
        if (value >= bins[i] && value < bins[i+1]) {
            return bins[i] + "-" + bins[i+1];
        }
    }
    return _.last(bins) + "+";
}

function makeBins(values: Map<number, number>): [string, number][] {
    const binMap: Map<string, number> = new Map()
    values.forEach((count, key) => {
        const bin = findBin(key);
        if (binMap.has(bin)) {
            binMap.set(bin, binMap.get(bin) + count);
        } else {
            binMap.set(bin, count);
        }
    });
    return Array.from(binMap.entries());
}

function getAllBins(): string[] {
    return bins.map(findBin);
}

// Based of http://bl.ocks.org/mbostock/3887051
class ReactHistogram extends D3Harness<Props> {
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

        const parties = Array.from(next.values.keys());
        const allBins = getAllBins();
        const dataByBin: Map<string, [string, number][]> = new Map();
        allBins.forEach(bin => dataByBin.set(bin, []));
        parties.forEach(party => {
            const bins = makeBins(next.values.get(party));
            bins.forEach(([binName, count]) =>
                dataByBin.get(binName).push([party, count])
            );
        });
        const dataByBinAsArray = Array.from(dataByBin.entries());

        const x0 = d3.scaleBand()
            .rangeRound([0, width])
            .paddingInner(0.1)
            .domain(allBins);
        let y;
        const z = d3.scaleOrdinal(d3.schemeCategory10).domain(parties);

        if (next.stacked) {
            let maxValue = 0;
            const dataBandsByBin: Map<string, [string, [number, number]][]> =
                mapMap(dataByBin, (name, values) => {
                    const bands: [string, [number, number]][] = [];
                    let lower = 0;
                    for (let i = 0; i < values.length; i++) {
                        const upper = lower + values[i][1];
                        bands.push([values[i][0], [lower, upper]]);
                        lower = upper;
                        maxValue = Math.max(maxValue, upper);
                    }
                    return bands;
                });

            y = d3.scaleLinear().range([height, 0]).domain([0, maxValue]);

            svg.append("g")
               .selectAll("g")
               .data(Array.from(dataBandsByBin.entries()))
               .enter().append("g")
               .attr("transform", d => "translate(" + x0(d[0]) + ", 0)")
               .selectAll("rect")
               .data(d => d[1])
               .enter().append("rect")
               .attr("y", d => y(d[1][1]) )
               .attr("height", d => y(d[1][0]) - y(d[1][1]))
               .attr("width", x0.bandwidth())
               .attr("fill", d => z(d[0]));
        } else {
            const x1 = d3.scaleBand()
                .padding(0.05)
                .domain(Array.from(next.values.keys()))
                .rangeRound([0, x0.bandwidth()]);

            const maxValue = d3.max(allBins.map(binName =>
                d3.max(dataByBin.get(binName), d => d[1])
            ));
            y = d3.scaleLinear().range([height, 0]).domain([0, maxValue]);

            svg.append("g")
               .selectAll("g")
               .data(dataByBinAsArray)
               .enter().append("g")
               .attr("transform", d => "translate(" + x0(d[0]) + ", 0)")
               .selectAll("rect")
               .data(d => d[1])
               .enter().append("rect")
               .attr("x", d => x1(d[0]))
               .attr("y", d => y(d[1]))
               .attr("width", x1.bandwidth())
               .attr("height", d => height - y(d[1]))
               .attr("fill", d => z(d[0]));
        }

        svg.append("g")
           .attr("class", "axis")
           .attr("transform", "translate(0, " + height + ")")
           .call(d3.axisBottom(x0));

        svg.append("g")
           .attr("class", "axis")
           .call(d3.axisLeft(y));

        const legend = svg.append("g")
            .attr("font-family", "sans-serif")
            .attr("font-size", 10)
            .attr("text-anchor", "end")
            .selectAll("g")
            .data(parties)
            .enter().append("g")
            .attr("transform", (d, i) => "translate(0, " + i * 20 + ")");

        legend.append("rect")
            .attr("x", width - 19)
            .attr("width", 19)
            .attr("height", 19)
            .attr("fill", z);

        legend.append("text")
            .attr("x", width - 24)
            .attr("y", 9.5)
            .attr("dy", "0.32em")
            .text(d => d);
    }
}

const RenderHistogram = function({ values, stacked }: Props): JSX.Element {
    if (!values) {
        return null;
    }

    return (
        <div>
            <ReactHistogram values={values} stacked={stacked} />
        </div>
    );
}

const mapStateToProps = function(state, ownProps): Props {
    return ownProps;
}

const Histogram = connect(mapStateToProps)(RenderHistogram)

export default Histogram