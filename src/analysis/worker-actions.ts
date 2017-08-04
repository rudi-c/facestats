import * as Data from "./data";

export namespace WorkerActions {
    export class Threads {
        public type: "threads" = "threads";
        constructor(public threads: Data.ThreadInfo[],
                    public parsingTimeInMs: number) {
        }
    }

    export class ReadyForNextChunk {
        public type: "ready_for_next_chunk" = "ready_for_next_chunk";
        constructor() {
        }
    }

    export class GotMiscInfo {
        public type: "got_misc_info" = "got_misc_info";
        constructor(public info: Data.MiscInfo) {
        }
    }

    export class GotMessageCountByDay {
        public type: "got_message_count_by_day" = "got_message_count_by_day";
        constructor(public value: Array<[Date, number]>) {
        }
    }

    export class GotMessageWordCounts {
        public type: "got_msg_word_counts" = "got_msg_word_counts";
        // name -> (bin size -> bin count)
        constructor(public counts: Map<string, Map<number, number>>) {
        }
    }

    export class GotConversationLengths {
        public type: "got_conversation_lengths" = "got_conversation_lengths";
        // name -> (bin size -> bin count)
        constructor(public counts: Map<string, Map<number, number>>) {
        }
    }

    export class GotPunchcard {
        public type: "got_punchcard" = "got_punchcard";
        // array of (array of counts by hour) by day of week
        constructor(public value: number[][]) {
        }
    }

    export class GotThreadDetails {
        public type: "got_thread_details" = "got_thread_details";
        constructor(public threadId: number,
                    public details: Data.ThreadDetails) {
        }
    }

    export class GotWordcloud {
        public type: "got_wordcloud" = "got_wordcloud";
        constructor(public threadId: number,
                    public words: string[]) {
        }
    }

    export class GotConversationStarts {
        public type: "got_conversation_starts" = "got_conversation_starts";
        constructor(public threadId: number,
                    public starts: Map<string, Array<[Date, number]>>) {
        }
    }

    export class GotWordsFrequency {
        public type: "got_words_frequency" = "got_words_frequency";
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
        | GotWordsFrequency;
}
