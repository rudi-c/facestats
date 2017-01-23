import * as _ from 'underscore';
import * as Immutable from 'immutable'

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
        type: "worker_action"
        action: WorkerActions.t
    }

    export function workerAction(action: WorkerActions.t): WorkerAction {
        return {
            type: "worker_action",
            action: action,
        }
    }

    export interface MoveToNavigator {
        type: "move_to_navigator"
    }

    export function moveToNavigator(): MoveToNavigator {
        return {
            type: "move_to_navigator",
        }
    }

    export interface UpdateProgress {
        type: "update_progress"
        progress: number
    }

    export function updateProgress(progress: number): UpdateProgress {
        return {
            type: "update_progress",
            progress: progress,
        }
    }

    export interface ThreadClicked {
        type: "thread_clicked"
        threadId: number
        additive: boolean
    }

    export function threadClicked(threadId: number, additive: boolean): ThreadClicked {
        return {
            type: "thread_clicked",
            threadId: threadId,
            additive: additive
        }
    }

    // Jane Street OCaml convention...
    export type t =
          WorkerCreated
        | WorkerAction
        | MoveToNavigator
        | UpdateProgress
        | ThreadClicked
}

function reduceWorker(state : State, action: WorkerActions.t): State {
    switch (action.type) {
        case "threads":
            return { ...state,
                threads: action.threads,
                timeToParseInMs: action.parsingTimeInMs,
                view: "summary",
            };
        case "ready_for_next_chunk":
            return state;
        case "got_misc_info":
            return { ...state, miscInfo: action.info };
        case "got_message_count_by_day":
            const max = _.max(action.value.map(pair => pair[1]));
            return { ...state,
                msgCountByDate: action.value,
                maxMessagesInDay: Math.max(max, state.maxMessagesInDay),
            };
        case "got_msg_word_counts":
            return { ...state, messageWordCounts: action.counts };
        case "got_conversation_lengths":
            return { ...state, conversationLengths: action.counts };
        case "got_punchcard":
            return { ...state, punchcard: action.value };
        case "got_thread_details":
            return { ...state,
                threadDetails: state.threadDetails.set(
                    action.threadId, action.details
                )
            };
        case "got_wordcloud":
            return { ...state,
                wordcloudWords: state.wordcloudWords.set(
                    action.threadId, action.words
                )
            };
        case "got_conversation_starts":
            return { ...state, conversationStarts: action.starts };
        default: const _exhaustiveCheck: never = action;
    }
}

export function reduce(state : State = defaultState, action: Actions.t): State {
    switch (action.type) {
        case "worker_action":
            return reduceWorker(state, action.action);
        case "worker_created":
            return { ...state,
                worker: action.worker,
                parsingProgress: 0,
                view: "loading",
            };
        case "move_to_navigator":
            return { ...state, view: "navigator" };
        case "update_progress":
            return { ...state, parsingProgress: action.progress };
        case "thread_clicked":
            let newSelected;
            if (action.additive) {
                if (state.selectedThreadIds.has(action.threadId)) {
                    newSelected = state.selectedThreadIds.remove(action.threadId);
                } else {
                    newSelected = state.selectedThreadIds.add(action.threadId);
                }
            } else {
                newSelected = Immutable.Set.of(action.threadId);
            }
            return { ...state, selectedThreadIds: newSelected };
        // default: const _exhaustiveCheck: never = action;
        default: return state;
    }
}