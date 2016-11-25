import * as React from 'react';
import { connect } from 'react-redux';

import { Actions } from '../actions'
import { WorkerActions } from '../worker-actions'
import { WorkerCommands } from '../analysis/worker-commands'

import FileInput from './file-input'
import MessageCountTimeline from './message-count-timeline'
import Threads from './threads-list'

const Analyzer = require("worker!../analysis/analyzer.ts")

function onWorkerMessage(dispatch, worker) {
    return messageEvent => {
        console.log(messageEvent);
        
        const action = messageEvent.data as WorkerActions.t;
        switch (action.type) {
            case "threads": 
                worker.postMessage(WorkerCommands.getMessageCountByDay());
                break;
        }

        dispatch(Actions.workerAction(action));
    }
}

const RenderApp = function({ dispatch }) {

    const onFileChange = function(result) {
        if ((window as any).Worker) {
            let worker = new Analyzer();
            worker.addEventListener('message', onWorkerMessage(dispatch, worker));
            console.log("Sending to worker");
            worker.postMessage(WorkerCommands.parseRawData(result));
        } else {
            console.warn('Web workers not supported');
        }
    }

    return (
        <div>
            <FileInput onFileChange={onFileChange} />
            <MessageCountTimeline />
            <Threads />
        </div>
    );
}

const App = connect()(RenderApp)

export default App