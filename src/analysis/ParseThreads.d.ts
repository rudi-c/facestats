export declare class Message {
    author: string;
    time: Date;
    text: string;
    constructor(author: string, time: Date, text: string);
}
export declare class MessageThread {
    id: number;
    parties: string[];
    messages: Message[];
    constructor(id: number, parties: string[], messages: Message[]);
}
export declare class ParseResults {
    threads: MessageThread[];
    yourName: string;
    constructor(threads: MessageThread[], yourName: string);
}
export declare class ThreadParser {
    parseStartTime: number;
    private handlerStack;
    private childrenStack;
    private lastAddedTextChild;
    private parser;
    constructor();
    initParser(): void;
    onChunk(chunk: string): void;
    finish(): any;
}
