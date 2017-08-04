import * as Immutable from "immutable";

import * as Data from "./analysis/data";

export type Views = "load_file" | "loading" | "summary" | "navigator";

export class State {
    public threads: Data.ThreadInfo[];
    public parsingProgress: number;
    public timeToParseInMs: number;

    public msgCountByDate: Array<[Date, number]>;
    public miscInfo: Data.MiscInfo;
    public punchcard: number[][];
    public messageWordCounts: Map<string, Map<number, number>>;
    public conversationLengths: Map<string, Map<number, number>>;
    public conversationStarts: Map<string, Array<[Date, number]>>;
    public wordSearchCounts: Map<string, number>;
    public maxMessagesInDay: number;

    public selectedThreadIds: Immutable.Set<number>;
    public threadDetails: Immutable.Map<number, Data.ThreadDetails>;
    public wordcloudWords: Immutable.Map<number, string[]>;

    public worker: any;

    public view: Views;

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
        this.wordSearchCounts = null;
        this.maxMessagesInDay = 10;

        this.selectedThreadIds = Immutable.Set<number>();
        this.threadDetails = Immutable.Map<number, Data.ThreadDetails>();
        this.wordcloudWords = Immutable.Map<number, string[]>();

        this.worker = null;
        this.view = "load_file";
    }
}

export const defaultState = new State();
