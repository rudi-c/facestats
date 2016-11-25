import { State, defaultState } from "./state"
import { WorkerActions } from "./worker-actions"

export module Actions {
    export interface WorkerAction {
        type: "worker_action";
        action: WorkerActions.t
    }

    export function workerAction(action): WorkerAction {
        return {
            type: "worker_action",
            action: action
        }
    }

    // Jane Street OCaml convention...
    export type t = WorkerAction
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
        default: const _exhaustiveCheck: never = action;
    }
}

export function reduce(state : State = defaultState, action: Actions.t): State {
    switch (action.type) {
        case "worker_action":
            return reduceWorker(state, action.action);
        // default: const _exhaustiveCheck: never = action;
        default: return state;
    }
}