export declare class MiscInfo {
    yourName: string;
    messageProportions: Array<[string, number]>;
    constructor(yourName: string, messageProportions: Array<[string, number]>);
}
export declare class ThreadInfo {
    id: number;
    parties: string[];
    length: number;
    constructor(id: number, parties: string[], length: number);
}
export declare class ThreadDetails {
    messageCount: Array<[string, number]>;
    conversationStartCount: Array<[string, number]>;
    conversationEndCount: Array<[string, number]>;
    constructor(messageCount: Array<[string, number]>, conversationStartCount: Array<[string, number]>, conversationEndCount: Array<[string, number]>);
}
