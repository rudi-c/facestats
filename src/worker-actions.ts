import { ThreadInfo } from "./state"

export module WorkerActions {
    export interface Threads {
        type: "threads";
        threads: ThreadInfo[];
    }

    export function threads(threads: ThreadInfo[]): Threads {
        return {
            type: "threads",
            threads: threads
        }
    }

    export interface ProgressParsed {
        type: "progress_parsed";
        timeInMs: number;
    }

    export function progressParsed(time: number): ProgressParsed {
        return {
            type: "progress_parsed",
            timeInMs: time
        }
    }


    // Jane Street OCaml convention...
    export type t = ProgressParsed | Threads 
}