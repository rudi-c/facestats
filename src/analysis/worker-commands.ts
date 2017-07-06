export module WorkerCommands {
    export class ParseChunk {
        type: "parse_chunk" = "parse_chunk"
        constructor(public chunk: string, 
                    public isLastChunk: boolean) {
        }
    }

    export class GetMiscInfo {
        type: "get_misc_info" = "get_misc_info"
        constructor() {}
    }

    export class GetMessageCountByDay {
        type: "get_msg_count_by_day" = "get_msg_count_by_day"
        constructor(public threadIds: number[],
                    // If this is false, will only count the messages that you've written.
                    public includeAllMessages: boolean = true,
                    public blurRadius: number = 0) {
        }
    }

    export class GetMessageWordCounts {
        type: "get_msg_word_counts" = "get_msg_word_counts"
        constructor(public threadId) {
        }
    }

    export class GetConversationLengths {
        type: "get_conversation_lengths" = "get_conversation_lengths"
        constructor(public threadId) {
        }
    }

    export class GetPunchcard {
        type: "get_punchcard" = "get_punchcard"
        constructor(public threadIds: number[]) {
        }
    }

    export class GetThreadDetails {
        type: "get_thread_details" = "get_thread_details"
        constructor(public threadId: number) {
        }
    }

    export class GetWordcloud {
        type: "get_wordcloud" = "get_wordcloud"
        constructor(public threadId: number) {
        }
    }

    export class GetConversationStarts {
        type: "get_conversation_starts" = "get_conversation_starts"
        constructor(public threadId: number) {
        }
    }

    export class GetWordsFrequency {
        type: "get_words_frequency" = "get_words_frequency"
        constructor(public threadId: number,
                    public wordsToSearch: string[]) {
        }
    }

    // Jane Street OCaml convention...
    export type t =
          ParseChunk
        | GetMiscInfo
        | GetMessageCountByDay
        | GetMessageWordCounts
        | GetConversationLengths
        | GetPunchcard
        | GetThreadDetails
        | GetWordcloud
        | GetConversationStarts
        | GetWordsFrequency
}