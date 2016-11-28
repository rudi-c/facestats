export class ThreadInfo {
    constructor(public id: number,
                public parties: string[],
                public length: number
               ) {
    }
}

export class ThreadDetails {
    constructor(public messageCount: [string, number][],
                public conversationStartCount: [string, number][],
               ) {
    }
}