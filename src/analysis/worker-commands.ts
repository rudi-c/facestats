export module WorkerCommands {
    export interface ParseChunk {
        type: "parse_chunk";
        chunk: string;
        isLastChunk: boolean;
    }

    export function parseChunk(chunk: string, isLastChunk: boolean): ParseChunk {
        return {
            type: "parse_chunk",
            chunk: chunk,
            isLastChunk: isLastChunk,
        }
    }

    // TODO: Make a generic thing for messages that expect a response.
    export interface GetMiscInfo {
        type: "get_misc_info";
    }

    export function getMiscInfo(): GetMiscInfo {
        return { type: "get_misc_info" };
    }

    export interface GetMessageCountByDay {
        type: "get_msg_count_by_day";
        threadIds: number[];
        // If this is false, will only count the messages that you've written.
        includeAllMessages: boolean
        blurRadius: number
    }

    export function getMessageCountByDay(threadIds: number[],
                                         includeAllMessages: boolean = true,
                                         blurRadius: number = 0
                                        ): GetMessageCountByDay {
        return { 
            type: "get_msg_count_by_day",
            threadIds: threadIds,
            includeAllMessages: includeAllMessages,
            blurRadius: blurRadius,
        };
    }

    export interface GetPunchcard {
        type: "get_punchcard";
        threadIds: number[];
    }

    export function getPunchcard(threadIds: number[]): GetPunchcard {
        return { 
            type: "get_punchcard",
            threadIds: threadIds,
        };
    }

    export interface GetThreadDetails {
        type: "get_thread_details";
        threadId: number;
    }

    export function getThreadDetails(threadId: number): GetThreadDetails {
        return { 
            type: "get_thread_details",
            threadId: threadId,
        };
    }

    export interface GetWordcloud {
        type: "get_wordcloud";
        threadId: number;
    }

    export function getWordcloud(threadId: number): GetWordcloud {
        return { 
            type: "get_wordcloud",
            threadId: threadId,
        };
    }

    // Jane Street OCaml convention...
    export type t = 
          ParseChunk 
        | GetMiscInfo 
        | GetMessageCountByDay 
        | GetPunchcard
        | GetThreadDetails
        | GetWordcloud
}