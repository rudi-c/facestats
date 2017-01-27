import * as _ from 'underscore';

import * as React from 'react';
import * as ReactDOM from "react-dom";
import { connect } from 'react-redux';

import * as d3 from "d3";

export default class D3Harness<Props> extends React.Component<any, any> {
    props: Props

    constructor(props) {
        super(props);
    }

    generate(next: Props) {
        throw "Not implemented";
    }

    componentDidMount() {
        this.generate(this.props);
    }

    componentWillReceiveProps(next: Props) {
        this.generate(next);
    }

    render() {
        return (
            <svg></svg>
        );
    }
}