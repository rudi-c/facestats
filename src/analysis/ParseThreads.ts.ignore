import * as d3 from "d3-time-format";
import * as parse5 from "parse5";
import * as _ from "underscore";

const htmlparser2 = require("../../lib/htmlparser2");

import { WorkerActions, sendUpdate } from "../analysis/worker-actions";

type TextNode = parse5.AST.Default.TextNode;
type ASTElement = parse5.AST.Default.Element;

export class Message {
    constructor(public author: string,
                public time: Date,
                public text: string) {
    }
}

export class MessageThread {
    // The id is our internal identifier for a message thread.
    constructor(public id: number,
                public parties: string[],
                public messages: Message[]) {
        this.parties = parties.sort();
        this.messages = _.sortBy(messages, message => message.time.getTime());
    }
}

export class ParseResults {
    constructor(public threads: MessageThread[],
                public yourName: string) {
    }
}

const _parseTime = d3.timeParse("%A, %B %d, %Y at %I:%M%p %Z");
function parseTime(raw: string): Date {
    // The %Z format specified of d3-time-format doesn't understand PST and PDT.
    const time = _parseTime(
        raw.replace("PDT", "-07").replace("PST", "-08")
           .replace("EDT", "-04").replace("EST", "-05"));
    if (!time) {
        console.error("Could not parse: " + raw);
        // TODO: Proper error handling
        throw new Error("");
    }
    return time;
}

class Handler {
    public tagClass?: string;
    public childHandlers?: Handler[];
    public onFinish: (children: any[]) => any;

    constructor(public tagName: string) {
        this.onFinish = children => children;
    }

    public withClass(tagClass: string) {
        this.tagClass = tagClass;
        return this;
    }

    public withChildHandlers(childHandlers: Handler[]) {
        this.childHandlers = childHandlers;
        return this;
    }

    public withOnFinish(onFinish) {
        this.onFinish = onFinish;
        return this;
    }

    public matches(name, attribs) {
        return this.tagName === name && (!this.tagClass || this.tagClass === attribs.class);
    }
}

class IgnoreHandler extends Handler {
    constructor() {
        super("");
        this.childHandlers = [this];
        this.onFinish = _ => undefined;
    }

    public matches(name, attribs) {
        return true;
    }
}

function firstChild(children) {
    const [child] = children;
    return child;
}

const messageTextHandler = new Handler("p").withOnFinish(firstChild);

const userHandler = new Handler("span").withClass("user").withOnFinish(firstChild);

const dateHandler = new Handler("span").withClass("meta").withOnFinish(firstChild);

const messageMetadataHandler = new Handler("div")
    .withClass("message")
    .withChildHandlers([
        new Handler("div")
            .withClass("message_header")
            .withChildHandlers([userHandler, dateHandler])
            .withOnFinish(children => {
                const [user, timeString] = children;
                return {
                    author: user,
                    time: parseTime(timeString),
                };
            }),
    ])
    .withOnFinish(firstChild);

const threadHandler = new Handler("div")
    .withClass("thread")
    .withChildHandlers([messageMetadataHandler, messageTextHandler])
    .withOnFinish(children => {
        const threadName = children[0];
        // TODO: Edge case: What if people have a comma in their names?
        const parties = threadName.split(",").map(name => name.trim());

        const messages = [];
        for (let i = 1; i < children.length; i += 2) {
            const meta = children[i];
            if (!meta.author || !meta.time) {
                console.error("Missing attributes author and/or time");
                console.error(meta);
                console.error(i);
                // TODO: Proper error handling
                throw new Error("");
            }
            messages.push(new Message(meta.author, meta.time, children[i + 1]));
        }

        return {
            parties,
            messages,
        };
    });

const contentsDivHandler = new Handler("div").withChildHandlers([threadHandler]);

const nameH1Handler = new Handler("h1")
    .withChildHandlers([threadHandler])
    .withOnFinish(firstChild);

const contentsHandler = new Handler("div")
    .withClass("contents")
    .withChildHandlers([nameH1Handler, contentsDivHandler])
    .withOnFinish(children => {
        const name = children[0];
        const threadGroups = children.slice(1);
        const threads = _.flatten(threadGroups).map((thread, i) =>
            new MessageThread(i, thread.parties, thread.messages),
        );
        return new ParseResults(threads, name);
    });

const bodyHandler = new Handler("body")
    .withChildHandlers([contentsHandler, new IgnoreHandler()])
    .withOnFinish(firstChild);

const htmlHandler = new Handler("html")
    .withChildHandlers([bodyHandler, new IgnoreHandler()])
    .withOnFinish(firstChild);

const rootHandler = new Handler("")
    .withChildHandlers([htmlHandler])
    .withOnFinish(firstChild);

export class ThreadParser {
    public parseStartTime: number;

    private handlerStack: Handler[];
    private childrenStack: any[][];
    private lastAddedTextChild: boolean;
    private parser: any;

    constructor() {
        this.handlerStack = [rootHandler];
        this.childrenStack = [[]];
        this.lastAddedTextChild = false;
        this.initParser();
    }

    public initParser() {
        this.parseStartTime = new Date().getTime();
        this.parser = new htmlparser2.Parser({
            onopentag: (name, attribs) => {
                for (const handler of _.last(this.handlerStack).childHandlers) {
                    if (handler.matches(name, attribs)) {
                        this.handlerStack.push(handler);
                        this.childrenStack.push([]);
                        this.lastAddedTextChild = false;
                        return;
                    }
                }
                console.error("No matching handler found!");
                console.error(name);
                console.error(attribs);
                // TODO: Proper error handling
                throw new Error("");
            },
            ontext: text => {
                const children = _.last(this.childrenStack);
                // Sometimes text gets broken up into multiple text events. For example,
                // when special characters like @ get represented as &#064;
                // TODO: Fix O(n^2) behavior here if this code gets shared (we won't run
                // into this kind of input in practice in this application).
                if (this.lastAddedTextChild) {
                    children[children.length - 1] += text;
                } else {
                    children.push(text);
                }
                this.lastAddedTextChild = true;
            },
            onclosetag: name => {
                const handler = _.last(this.handlerStack);
                const children = _.last(this.childrenStack);
                let result;
                if (children.length === 0) {
                    // Something like <p></p> doesn't trigger the onText event,
                    // but in most cases we probably still want to interpret that
                    // as the empty string.
                    result = handler.onFinish([""]);
                } else {
                    result = handler.onFinish(children);
                }
                this.handlerStack.pop();
                this.childrenStack.pop();
                this.lastAddedTextChild = false;
                if (result !== undefined) {
                    _.last(this.childrenStack).push(result);
                }
            },
        }, { decodeEntities: true });
    }

    public onChunk(chunk: string) {
        this.parser.write(chunk);
    }

    public finish() {
        this.parser.end();
        const end = new Date().getTime();
        console.log("Total parsing time: " + (end - this.parseStartTime));
        const [[result]] = this.childrenStack;
        return result;
    }
}
