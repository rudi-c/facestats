import * as Immutable from 'immutable'

import * as Data from './analysis/data'

export class State {
    threads: Data.ThreadInfo[]
    timeToParseInMs: number
    msgCountByDate: [Date, number][]

    threadDetails: Immutable.Map<number, Data.ThreadDetails>

    worker: any;

    constructor() {
        this.threads = [];
        this.timeToParseInMs = null;
        this.msgCountByDate = null;
        this.threadDetails = Immutable.Map<number, Data.ThreadDetails>();
        this.worker = null;
    }
}

export const defaultState = new State();