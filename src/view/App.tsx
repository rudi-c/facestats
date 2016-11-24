import * as React from 'react';
import { connect } from 'react-redux';

import { Actions } from '../actions'
import { WorkerActions } from '../worker-actions'

import FileInput from './file-input'
import Threads from './threads-list'

const Analyzer = require("worker!../analysis/analyzer.ts")

const RenderApp = function({ dispatch }) {
    const onWorkerMessage = function(messageEvent) {
        console.log(messageEvent);
        dispatch(Actions.workerAction(messageEvent.data as WorkerActions.t));
    }

    const onFileChange = function(result) {
        if ((window as any).Worker) {
            let worker = new Analyzer();
            worker.addEventListener('message', onWorkerMessage);
            console.log("Sending to worker");
            worker.postMessage(result);
        } else {
            console.warn('Web workers not supported');
        }
    }

    return (
        <div>
            <FileInput onFileChange={onFileChange} />
            <Threads />
        </div>
    );
}

const App = connect()(RenderApp)

export default App