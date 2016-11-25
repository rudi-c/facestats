export class ThreadInfo {
    constructor(public id: number,
                public parties: string[],
                public length: number) {
    }
}

export class State {
    threads: ThreadInfo[]
    timeToParseInMs: number
    msgCountByDate: [Date, number][]

    constructor() {
        this.threads = [];
        this.timeToParseInMs = null;
        this.msgCountByDate = null;
    }
}

export const defaultState = new State();