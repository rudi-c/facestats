import * as React from 'react';
import { connect } from 'react-redux';
import { StyleSheet, css } from 'aphrodite';

import Progress from 'react-progressbar'

import { Actions } from '../actions'
import { State, Views } from '../state'
import { WorkerActions } from '../analysis/worker-actions'
import { WorkerCommands } from '../analysis/worker-commands'

import ChunkedFileReader from './chunked-file-reader'
import FileInput from './file-input'
import Navigator from './navigator'
import Summary from './summary'

const Analyzer = require("worker!../analysis/analyzer.ts")

interface StateProps {
    view: Views
    parsingProgress: number
}

interface DispatchProps {
    onFileChange: (any) => any
}

interface AppProps extends StateProps, DispatchProps {
}

function onWorkerMessage(dispatch, worker, fileReader) {
    return messageEvent => {
        // console.log(messageEvent.data);

        const action = messageEvent.data as WorkerActions.t;
        switch (action.type) {
            // On new chunk
            case "ready_for_next_chunk":
                fileReader.gotChunk();
                break;
            // When the parsing is done.
            case "threads":
                worker.postMessage(WorkerCommands.getMiscInfo());
                worker.postMessage(WorkerCommands.getMessageCountByDay(null));
                worker.postMessage(WorkerCommands.getPunchcard(null));
                break;
        }

        dispatch(Actions.workerAction(action));
    }
}

const styles = StyleSheet.create({
    inputForm: {
        width: '300px'
    },
    loadingBar: {
        width: '300px'
    }
});

const RenderApp = function({ view,
                             parsingProgress,
                             onFileChange }: AppProps) {
    switch (view) {
        case "load_file":
            return (
                <div className={"container " + css(styles.inputForm)}>
                    <FileInput onFileChange={onFileChange} />
                </div>
            );
        case "loading":
            return (
                <div className={"container " + css(styles.loadingBar)}>
                    <Progress completed={Math.floor(parsingProgress * 100)} />
                </div>
            )
        case "summary":
            return (<Summary />);
        case "navigator":
            return (<Navigator />);
        default: const _exhaustiveCheck: never = view;
    }
}

const mapStateToProps = function(state : State): StateProps {
    return {
        view: state.view,
        parsingProgress: state.parsingProgress
    };
}

const mapDispatchToProps = function(dispatch): DispatchProps {
    return {
        onFileChange: (file) => {
            if ((window as any).Worker) {
                const worker = new Analyzer();
                const fileReader = new ChunkedFileReader(file, worker, dispatch);
                worker.addEventListener('message',
                    onWorkerMessage(dispatch, worker, fileReader));
                dispatch(Actions.workerCreated(worker));
                fileReader.startReading();
            } else {
                console.warn('Web workers not supported');
            }
        },
    };
}

const App = connect(mapStateToProps, mapDispatchToProps)(RenderApp)

export default App