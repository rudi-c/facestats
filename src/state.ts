import * as Immutable from 'immutable'

import * as Data from './analysis/data'

export type Views = "load_file" | "loading" | "summary" | "navigator"

export class State {
    threads: Data.ThreadInfo[]
    parsingProgress: number
    timeToParseInMs: number

    msgCountByDate: [Date, number][]
    miscInfo: Data.MiscInfo
    punchcard: number[][]
    messageWordCounts: Map<string, Map<number, number>>
    conversationLengths: Map<string, Map<number, number>>
    conversationStarts: Map<string, [Date, number][]>
    maxMessagesInDay: number

    selectedThreadIds: Immutable.Set<number>
    threadDetails: Immutable.Map<number, Data.ThreadDetails>
    wordcloudWords: Immutable.Map<number, string[]>

    worker: any

    view: Views

    constructor() {
        this.threads = null;
        this.parsingProgress = 0;
        this.timeToParseInMs = null;

        this.msgCountByDate = null;
        this.miscInfo = null;
        this.punchcard = null;
        this.messageWordCounts = null;
        this.conversationLengths = null;
        this.conversationStarts = null;
        this.maxMessagesInDay = 10;

        this.selectedThreadIds = Immutable.Set<number>();
        this.threadDetails = Immutable.Map<number, Data.ThreadDetails>();
        this.wordcloudWords = Immutable.Map<number, string[]>();

        this.worker = null;
        this.view = "load_file";
    }
}

export const defaultState = new State();