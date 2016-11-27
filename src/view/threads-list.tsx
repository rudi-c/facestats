import * as React from 'react';
import { connect } from 'react-redux';

import * as Immutable from 'immutable'

import * as Data from '../analysis/data'

import { State } from '../state'
import { ThreadInfo } from '../analysis/data'

import { Actions } from '../actions'
import { WorkerCommands } from '../analysis/worker-commands'

interface ThreadsProps {
    threads: ThreadInfo[],
    threadDetails: Immutable.Map<number, Data.ThreadDetails>
    onChooseThread: (number) => any
}

const RenderThreads = function(
  { threads, threadDetails, onChooseThread }: ThreadsProps
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
          <li key={thread.id} onClick={onChooseThread(thread.id)}>
            { thread.parties.join(", ") + " (" + thread.length + ")" }
            { detailsView }
          </li>
        );
    });
    return (
        <ul>
            {threadsList}
        </ul>
    );
}

const mapStateToProps = function(state : State): ThreadsProps {
    return {
        threads: state.threads,
        threadDetails: state.threadDetails,
        onChooseThread: (threadId) => ((event) => {
            state.worker.postMessage(WorkerCommands.getThreadDetails(threadId));
        }),
    }
}

const Threads = connect(mapStateToProps)(RenderThreads)

export default Threads
