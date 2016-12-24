export class MiscInfo {
    constructor(public yourName: string,
                public messageProportions: [string, number][]
               ) {
    }
}

export class ThreadInfo {
    constructor(public id: number,
                public parties: string[],
                public length: number
               ) {
    }
}

export class ThreadDetails {
    // Message count and conversation counts by author
    constructor(public messageCount: [string, number][],
                public conversationStartCount: [string, number][],
                public conversationEndCount: [string, number][],
               ) {
    }
}