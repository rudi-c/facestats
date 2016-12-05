import * as Immutable from 'immutable'

import * as Data from './analysis/data'

export class State {
    threads: Data.ThreadInfo[]
    timeToParseInMs: number
    msgCountByDate: [Date, number][]
    punchcard: number[][]
    maxMessagesInDay: number

    selectedThreadIds: Immutable.Set<number>
    threadDetails: Immutable.Map<number, Data.ThreadDetails>
    wordcloudWords: Immutable.Map<number, string[]>

    worker: any;

    constructor() {
        this.threads = [];
        this.timeToParseInMs = null;
        this.msgCountByDate = null;
        this.punchcard = null;
        this.maxMessagesInDay = 10;
        this.selectedThreadIds = Immutable.Set<number>();
        this.threadDetails = Immutable.Map<number, Data.ThreadDetails>();
        this.wordcloudWords = Immutable.Map<number, string[]>();
        this.worker = null;
    }
}

export const defaultState = new State();