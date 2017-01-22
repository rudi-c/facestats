import * as Data from './data'

export module WorkerActions {
    export class Threads {
        type: "threads"
        constructor(public threads: Data.ThreadInfo[],
                    public parsingTimeInMs: number) {
            this.type = "threads";
        }
    }

    export class ReadyForNextChunk {
        type: "ready_for_next_chunk"
        constructor() {
            this.type = "ready_for_next_chunk";
        }
    }

    export class GotMiscInfo {
        type: "got_misc_info"
        constructor(public info: Data.MiscInfo) {
            this.type = "got_misc_info";
        }
    }

    export class GotMessageCountByDay {
        type: "got_message_count_by_day"
        constructor(public value: [Date, number][]) {
            this.type = "got_message_count_by_day";
        }
    }

    export class GotMessageWordCounts {
        type: "got_msg_word_counts"
        constructor(public counts: Map<string, Map<number, number>>) {
            this.type = "got_msg_word_counts";
        }
    }

    export class GotPunchcard {
        type: "got_punchcard"
        // array of (array of counts by hour) by day of week
        constructor (public value: number[][]) {
            this.type = "got_punchcard";
        }
    }

    export class GotThreadDetails {
        type: "got_thread_details"
        constructor(public threadId: number,
                    public details: Data.ThreadDetails) {
            this.type = "got_thread_details";
        }
    }

    export class GotWordcloud {
        type: "got_wordcloud"
        constructor(public threadId: number,
                    public words: string[]) {
            this.type = "got_wordcloud";
        }
    }

    export class GotConversationStarts {
        type: "got_conversation_starts"
        constructor(public threadId: number,
                    public starts: Map<string, [Date, number][]>) {
            this.type = "got_conversation_starts";
        }
    }

    // Jane Street OCaml convention...
    export type t =
          ReadyForNextChunk
        | Threads
        | GotMiscInfo
        | GotMessageCountByDay
        | GotPunchcard
        | GotThreadDetails
        | GotWordcloud
        | GotConversationStarts
}