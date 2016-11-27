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

    // Jane Street OCaml convention...
    export type t = WorkerCreated | WorkerAction
}

function reduceWorker(state : State, action: WorkerActions.t): State {
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
            return Object.assign({}, state, {
                msgCountByDate: action.value
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
        // default: const _exhaustiveCheck: never = action;
        default: return state;
    }
}