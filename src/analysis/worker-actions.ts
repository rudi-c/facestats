import * as Data from './data'

export module WorkerActions {
    export class Threads {
        type: "threads" = "threads"
        constructor(public threads: Data.ThreadInfo[],
                    public parsingTimeInMs: number) {
        }
    }

    export class ReadyForNextChunk {
        type: "ready_for_next_chunk" = "ready_for_next_chunk"
        constructor() {
        }
    }

    export class GotMiscInfo {
        type: "got_misc_info" = "got_misc_info"
        constructor(public info: Data.MiscInfo) {
        }
    }

    export class GotMessageCountByDay {
        type: "got_message_count_by_day" = "got_message_count_by_day"
        constructor(public value: [Date, number][]) {
        }
    }

    export class GotMessageWordCounts {
        type: "got_msg_word_counts" = "got_msg_word_counts"
        // name -> (bin size -> bin count)
        constructor(public counts: Map<string, Map<number, number>>) {
        }
    }

    export class GotConversationLengths {
        type: "got_conversation_lengths" = "got_conversation_lengths"
        // name -> (bin size -> bin count)
        constructor(public counts: Map<string, Map<number, number>>) {
        }
    }

    export class GotPunchcard {
        type: "got_punchcard" = "got_punchcard"
        // array of (array of counts by hour) by day of week
        constructor (public value: number[][]) {
        }
    }

    export class GotThreadDetails {
        type: "got_thread_details" = "got_thread_details"
        constructor(public threadId: number,
                    public details: Data.ThreadDetails) {
        }
    }

    export class GotWordcloud {
        type: "got_wordcloud" = "got_wordcloud"
        constructor(public threadId: number,
                    public words: string[]) {
        }
    }

    export class GotConversationStarts {
        type: "got_conversation_starts" = "got_conversation_starts"
        constructor(public threadId: number,
                    public starts: Map<string, [Date, number][]>) {
        }
    }

    export class GotWordsFrequency {
        type: "got_words_frequency" = "got_words_frequency"
        constructor(public threadId: number,
                    public counts: Map<string, number>) {                
        }
    }

    // Jane Street OCaml convention...
    export type t =
          ReadyForNextChunk
        | Threads
        | GotMiscInfo
        | GotMessageCountByDay
        | GotMessageWordCounts
        | GotConversationLengths
        | GotPunchcard
        | GotThreadDetails
        | GotWordcloud
        | GotConversationStarts
        | GotWordsFrequency
}