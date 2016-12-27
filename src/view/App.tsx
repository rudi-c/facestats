import * as React from 'react';
import { connect } from 'react-redux';
import { StyleSheet, css } from 'aphrodite';

import Progress from 'react-progressbar'

import { Actions } from '../actions'
import { State } from '../state'
import { WorkerActions } from '../analysis/worker-actions'
import { WorkerCommands } from '../analysis/worker-commands'

import ChunkedFileReader from './chunked-file-reader'
import FileInput from './file-input'
import ConversationDonut from './conversation-donut'
import MessageCountTimeline from './message-count-timeline'
import Punchcard from './punchcard'
import Threads from './threads-list'

const Analyzer = require("worker!../analysis/analyzer.ts")

interface StateProps {
    isLoadingFile: boolean
    hasLoadedFile: boolean
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
    }
});

const RenderApp = function({ isLoadingFile,
                             hasLoadedFile,
                             parsingProgress,
                             onFileChange }: AppProps) {
    if (hasLoadedFile) {
        return (
            <div>
                <ConversationDonut />
                <MessageCountTimeline />
                <Punchcard />
                <Threads />
            </div>
        );
    } else if (isLoadingFile) {
        return (
            <div className={"container " + css(styles.inputForm)}>
                <Progress completed={Math.floor(parsingProgress * 100)} />
            </div>
        )
    } else {
        return (
            <div className={"container " + css(styles.inputForm)}>
                <FileInput onFileChange={onFileChange} />
            </div>
        );
    }
}

const mapStateToProps = function(state : State): StateProps {
    return {
        isLoadingFile: state.worker !== null,
        hasLoadedFile: state.threads !== null,
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