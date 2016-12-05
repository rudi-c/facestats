import * as _ from 'underscore';

import { State, defaultState } from "./state"
import { WorkerActions } from "./analysis/worker-actions"

export module Actions {
    export interface WorkerCreated {
        type: "worker_created"
        worker: any
    }

    export function workerCreated(worker: any): WorkerCreated {
        return {
            type: "worker_created",
            worker: worker,
        }
    }

    export interface WorkerAction {
        type: "worker_action";
        action: WorkerActions.t
    }

    export function workerAction(action: WorkerActions.t): WorkerAction {
        return {
            type: "worker_action",
            action: action,
        }
    }

    export interface ThreadChecked {
        type: "thread_checked";
        threadId: number;
    }

    export function threadChecked(threadId: number): ThreadChecked {
        return {
            type: "thread_checked",
            threadId: threadId,
        }
    }

    // Jane Street OCaml convention...
    export type t = WorkerCreated | WorkerAction | ThreadChecked
}

function reduceWorker(state : State, action: WorkerActions.t): State {
    // TODO: Object spread operator?
    switch (action.type) {
        case "threads": 
            return Object.assign({}, state, {
                threads: action.threads
            });
        case "progress_parsed": 
            return Object.assign({}, state, {
                timeToParseInMs: action.timeInMs
            });
        case "got_message_count_by_day":
            const max = _.max(action.value.map(pair => pair[1]));
            return Object.assign({}, state, {
                msgCountByDate: action.value,
                maxMessagesInDay: Math.max(max, state.maxMessagesInDay),
            });
        case "got_punchcard":
            return Object.assign({}, state, {
                punchcard: action.value,
            });
        case "got_thread_details":
            return Object.assign({}, state, {
                threadDetails: state.threadDetails.set(
                    action.threadId, action.details
                )
            });
        default: const _exhaustiveCheck: never = action;
    }
}

export function reduce(state : State = defaultState, action: Actions.t): State {
    switch (action.type) {
        case "worker_action":
            return reduceWorker(state, action.action);
        case "worker_created":
            return Object.assign({}, state, {
                worker: action.worker
            });
        case "thread_checked":
            let newSelected;
            if (state.selectedThreadIds.has(action.threadId)) {
                newSelected = state.selectedThreadIds.remove(action.threadId);
            } else {
                newSelected = state.selectedThreadIds.add(action.threadId);
            }
            return Object.assign({}, state, {
                selectedThreadIds: newSelected
            });
        // default: const _exhaustiveCheck: never = action;
        default: return state;
    }
}