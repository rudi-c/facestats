export module WorkerCommands {
    export interface ParseRawData {
        type: "parse_raw_data";
        rawData: string;
    }

    export function parseRawData(rawData: string): ParseRawData {
        return {
            type: "parse_raw_data",
            rawData: rawData,
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
    }

    export function getMessageCountByDay(): GetMessageCountByDay {
        return { type: "get_msg_count_by_day" };
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

    // Jane Street OCaml convention...
    export type t = ParseRawData | GetMiscInfo | GetMessageCountByDay | GetThreadDetails
}