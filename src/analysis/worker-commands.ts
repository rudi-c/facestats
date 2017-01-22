export module WorkerCommands {
    export class ParseChunk {
        type: "parse_chunk"
        constructor(public chunk: string, 
                    public isLastChunk: boolean) {
            this.type = "parse_chunk";
        }
    }

    export class GetMiscInfo {
        type: "get_misc_info"
        constructor() {
            this.type = "get_misc_info";
        }
    }

    export class GetMessageCountByDay {
        type: "get_msg_count_by_day"
        constructor(public threadIds: number[],
                    // If this is false, will only count the messages that you've written.
                    public includeAllMessages: boolean = true,
                    public blurRadius: number = 0) {
            this.type = "get_msg_count_by_day";
        }
    }

    export class GetMessageWordCounts {
        type: "get_msg_word_counts"
        constructor(public threadId) {
            this.type = "get_msg_word_counts";
        }
    }

    export class GetPunchcard {
        type: "get_punchcard";
        constructor(public threadIds: number[]) {
            this.type = "get_punchcard";
        }
    }

    export class GetThreadDetails {
        type: "get_thread_details"
        constructor(public threadId: number) {
            this.type = "get_thread_details";
        }
    }

    export class GetWordcloud {
        type: "get_wordcloud"
        constructor(public threadId: number) {
            this.type = "get_wordcloud";
        }
    }

    export class GetConversationStarts {
        type: "get_conversation_starts"
        constructor(public threadId: number) {
            this.type = "get_conversation_starts";
        }
    }

    // Jane Street OCaml convention...
    export type t =
          ParseChunk
        | GetMiscInfo
        | GetMessageCountByDay
        | GetPunchcard
        | GetThreadDetails
        | GetWordcloud
        | GetConversationStarts
}