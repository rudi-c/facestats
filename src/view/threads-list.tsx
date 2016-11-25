import * as React from 'react';
import { connect } from 'react-redux';

import { State, ThreadInfo } from '../state'

interface ThreadsProps {
    threads: ThreadInfo[]
}

const RenderThreads = function({ threads }: ThreadsProps): JSX.Element {
    const threadsList = threads.map((thread, i) => 
        <li key={i}>{ thread.parties.join(", ") + " (" + thread.length + ")"}</li>
    );
    return (
        <ul>
            {threadsList}
        </ul>
    );
}

const mapStateToProps = function(state : State): ThreadsProps {
    return {
        threads: state.threads,
    }
}

const Threads = connect(mapStateToProps)(RenderThreads)

export default Threads
