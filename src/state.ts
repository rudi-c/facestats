export class ThreadInfo {
    constructor(public id: number,
                public parties: string[],
                public length: number) {
    }
}

export class State {
    threads: ThreadInfo[]
    timeToParseInMs: number

    constructor() {
        this.threads = [];
        this.timeToParseInMs = null;
    }
}

export const defaultState = new State();