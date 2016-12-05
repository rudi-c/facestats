import * as React from 'react';
import { connect } from 'react-redux';

import * as Immutable from 'immutable'

import * as Data from '../analysis/data'

import { State } from '../state'
import { ThreadInfo } from '../analysis/data'

import { Actions } from '../actions'
import { WorkerCommands } from '../analysis/worker-commands'

interface StateProps {
    threads: ThreadInfo[],
    threadDetails: Immutable.Map<number, Data.ThreadDetails>
    onSelectedWorker: (number) => any
    onChooseThread: (number) => any
}

interface DispatchProps {
    onSelected: (number) => any
}

interface ThreadsProps extends StateProps, DispatchProps {
}

const RenderThreads = function(
  { threads, threadDetails, onSelected, onSelectedWorker, onChooseThread }: ThreadsProps
  ): JSX.Element {

    const threadsList = threads.map(thread =>  {
        let detailsView = null;
        if (threadDetails.has(thread.id)) {
            const details = threadDetails.get(thread.id);
            detailsView = (
                <div>
                  <div>
                    Messages written by:
                    { details.messageCount.map((info, id) => {
                        const [author, count] = info;
                        return (<p key={id}>{author}: {count}</p>);
                      })
                    }
                  </div>
                  <div>
                    Conversations started by:
                    { details.conversationStartCount.map((info, id) => {
                        const [author, count] = info;
                        return (<p key={id}>{author}: {count}</p>);
                      })
                    }
                  </div>
                </div>
            );
        }
        return (
          <div key={thread.id}>
            <input type="checkbox" defaultChecked={false} onChange={(event) => 
                { onSelected(thread.id); onSelectedWorker(thread.id) }
            }/>
            <span onClick={onChooseThread(thread.id)}>
            { thread.parties.join(", ") + " (" + thread.length + ")" }
            </span>
            { detailsView }
          </div>
        );
    });
    return (
        <div>
            {threadsList}
        </div>
    );
}

const mapStateToProps = function(state : State): StateProps {
    return {
        threads: state.threads,
        threadDetails: state.threadDetails,
        onChooseThread: (threadId) => ((event) => {
            state.worker.postMessage(WorkerCommands.getThreadDetails(threadId));
        }),
        onSelectedWorker: (threadId) => {
            let newSelected: Immutable.Set<number>;
            if (state.selectedThreadIds.has(threadId)) {
                newSelected = state.selectedThreadIds.remove(threadId);
            } else {
                newSelected = state.selectedThreadIds.add(threadId);
            }
            state.worker.postMessage(
                WorkerCommands.getMessageCountByDay(newSelected.toArray(), true, 7)
            );
            state.worker.postMessage(
                WorkerCommands.getPunchcard(newSelected.toArray())
            );
        },
    }
}

const mapDispatchToProps = function(dispatch): DispatchProps {
    return {
        onSelected: (threadId) => {
            dispatch(Actions.threadChecked(threadId));
        },
    }
}

const Threads = connect(mapStateToProps, mapDispatchToProps)(RenderThreads)

export default Threads
