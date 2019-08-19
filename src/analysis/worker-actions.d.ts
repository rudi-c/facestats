import * as Data from "./data";
export declare namespace WorkerActions {
    class Threads {
        threads: Data.ThreadInfo[];
        parsingTimeInMs: number;
        type: "threads";
        constructor(threads: Data.ThreadInfo[], parsingTimeInMs: number);
    }
    class ReadyForNextChunk {
        type: "ready_for_next_chunk";
        constructor();
    }
    class GotMiscInfo {
        info: Data.MiscInfo;
        type: "got_misc_info";
        constructor(info: Data.MiscInfo);
    }
    class GotMessageCountByDay {
        value: Array<[Date, number]>;
        type: "got_message_count_by_day";
        constructor(value: Array<[Date, number]>);
    }
    class GotMessageWordCounts {
        counts: Map<string, Map<number, number>>;
        type: "got_msg_word_counts";
        constructor(counts: Map<string, Map<number, number>>);
    }
    class GotConversationLengths {
        counts: Map<string, Map<number, number>>;
        type: "got_conversation_lengths";
        constructor(counts: Map<string, Map<number, number>>);
    }
    class GotPunchcard {
        value: number[][];
        type: "got_punchcard";
        constructor(value: number[][]);
    }
    class GotThreadDetails {
        threadId: number;
        details: Data.ThreadDetails;
        type: "got_thread_details";
        constructor(threadId: number, details: Data.ThreadDetails);
    }
    class GotWordcloud {
        threadId: number;
        words: string[];
        type: "got_wordcloud";
        constructor(threadId: number, words: string[]);
    }
    class GotConversationStarts {
        threadId: number;
        starts: Map<string, Array<[Date, number]>>;
        type: "got_conversation_starts";
        constructor(threadId: number, starts: Map<string, Array<[Date, number]>>);
    }
    class GotWordsFrequency {
        threadId: number;
        counts: Map<string, number>;
        type: "got_words_frequency";
        constructor(threadId: number, counts: Map<string, number>);
    }
    type t = ReadyForNextChunk | Threads | GotMiscInfo | GotMessageCountByDay | GotMessageWordCounts | GotConversationLengths | GotPunchcard | GotThreadDetails | GotWordcloud | GotConversationStarts | GotWordsFrequency;
}
export declare function sendUpdate(message: WorkerActions.t): void;
