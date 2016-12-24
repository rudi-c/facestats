import * as Data from './data'

export module WorkerActions {
    export interface Threads {
        type: "threads";
        threads: Data.ThreadInfo[];
    }

    export function threads(threads: Data.ThreadInfo[]): Threads {
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

    export interface GotMiscInfo {
        type: "got_misc_info";
        info: Data.MiscInfo;
    }

    export function gotMiscInfo(info: Data.MiscInfo): GotMiscInfo {
        return {
            type: "got_misc_info",
            info: info
        }
    }

    export interface GotMessageCountByDay {
        type: "got_message_count_by_day";
        value: [Date, number][];
    }

    export function gotMessageCountByDay(value: [Date, number][]): GotMessageCountByDay {
        return {
            type: "got_message_count_by_day",
            value: value
        }
    }

    export interface GotPunchcard {
        type: "got_punchcard";
        // array of (array of counts by hour) by day of week
        value: number[][];
    }

    export function gotPunchcard(value: number[][]): GotPunchcard {
        return {
            type: "got_punchcard",
            value: value
        }
    }

    export interface GotThreadDetails {
        type: "got_thread_details";
        threadId: number;
        details: Data.ThreadDetails;
    }

    export function gotThreadDetails(threadId: number,
                                     details: Data.ThreadDetails): GotThreadDetails {
        return {
            type: "got_thread_details",
            threadId: threadId,
            details: details,
        }
    }

    export interface GotWordcloud {
        type: "got_wordcloud";
        threadId: number;
        words: string[]
    }

    export function gotWordcloud(threadId: number,
                                 words: string[]): GotWordcloud {
        return {
            type: "got_wordcloud",
            threadId: threadId,
            words: words,
        }
    }

    // Jane Street OCaml convention...
    export type t =
          ProgressParsed
        | Threads
        | GotMiscInfo
        | GotMessageCountByDay
        | GotPunchcard
        | GotThreadDetails
        | GotWordcloud
}