export class MiscInfo {
    constructor(public yourName: string,
                public messageProportions: Array<[string, number]>,
               ) {
    }
}

export class ThreadInfo {
    constructor(public id: number,
                public parties: string[],
                public length: number,
               ) {
    }
}

export class ThreadDetails {
    // Message count and conversation counts by author
    constructor(public messageCount: Array<[string, number]>,
                public conversationStartCount: Array<[string, number]>,
                public conversationEndCount: Array<[string, number]>,
               ) {
    }
}
