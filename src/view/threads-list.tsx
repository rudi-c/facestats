import * as React from 'react';
import { connect } from 'react-redux';
import WordCloud from 'react-d3-cloud';

import * as Immutable from 'immutable'

import { State } from '../state'
import { ThreadInfo } from '../analysis/data'

import { Actions } from '../actions'
import { WorkerCommands } from '../analysis/worker-commands'
import { fbEmailRegex } from '../analysis/helpers'

interface StateProps {
    threads: ThreadInfo[]
    selectedThreadIds: Immutable.Set<number>
    yourName: string
    onClickThread: (number, boolean) => any
}

interface DispatchProps {
    onClickThreadDispatch: (number, boolean) => any
}

interface ThreadsProps extends StateProps, DispatchProps {
}

const RenderThreads = function({
    threads,
    selectedThreadIds,
    yourName,
    onClickThread,
    onClickThreadDispatch
}: ThreadsProps): JSX.Element {
    const threadsList = threads.map(thread =>  {
        const onItemClick = (event : React.MouseEvent<HTMLButtonElement>) => {
            const additive = event.ctrlKey || event.shiftKey;
            onClickThread(thread.id, additive);
            onClickThreadDispatch(thread.id, additive);
        };
        const otherKnownParties = thread.parties.filter(name => name != yourName && !name.match(fbEmailRegex));
        const unknownParties = thread.parties.filter(name => name.match(fbEmailRegex));
        // Always show the first two known names
        let displayLines = otherKnownParties.slice(0, 2);
        if (otherKnownParties.length == 3 && unknownParties.length == 0) {
            displayLines.push(otherKnownParties[2]);
        } else if (otherKnownParties.length >= 3) {
            displayLines.push((otherKnownParties.length - 2 + unknownParties.length) + " others");
        } else if (unknownParties.length > 0) {
            displayLines.push(unknownParties.length + " <unknown>");
        }
        const displayItems = displayLines.map((line, i) => (<div key={i}>{line}</div>));

        let className = "list-group-item";
        if (selectedThreadIds.has(thread.id)) {
            className += " active";
        }
        return (
            <button key={thread.id}
                    type="button"
                    className={className}
                    onClick={onItemClick}
            >
                <span className="badge">{ thread.length }</span>
                { displayItems }
            </button>
        );
    });
    return (
        <div className="list-group">
            {threadsList}
        </div>
    );
}

const mapStateToProps = function(state : State): StateProps {
    return {
        threads: state.threads,
        selectedThreadIds: state.selectedThreadIds,
        yourName: state.miscInfo.yourName,
        onClickThread: (threadId, additive) => {
            let newSelected: number[];
            if (additive) {
                if (state.selectedThreadIds.has(threadId)) {
                    newSelected = state.selectedThreadIds.remove(threadId).toArray();
                } else {
                    newSelected = state.selectedThreadIds.add(threadId).toArray();
                }
            } else {
                newSelected = [threadId];
            }
            state.worker.postMessage(new WorkerCommands.GetThreadDetails(threadId));
            state.worker.postMessage(new WorkerCommands.GetWordcloud(threadId));
            state.worker.postMessage(
                new WorkerCommands.GetMessageCountByDay(newSelected, true, 7)
            );
            state.worker.postMessage(
                new WorkerCommands.GetPunchcard(newSelected)
            );
            state.worker.postMessage(
                new WorkerCommands.GetConversationStarts(threadId)
            );
        },
    }
}

const mapDispatchToProps = function(dispatch): DispatchProps {
    return {
        onClickThreadDispatch: (threadId, additive) => {
            dispatch(Actions.threadClicked(threadId, additive));
        },
    }
}

const Threads = connect(mapStateToProps, mapDispatchToProps)(RenderThreads)

export default Threads
