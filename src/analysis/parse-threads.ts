import * as parse5 from 'parse5';
import * as d3 from 'd3-time-format';
import * as _ from 'underscore';

import { WorkerActions } from '../worker-actions'
import { sendUpdate } from './helpers'

type TextNode = parse5.AST.Default.TextNode
type ASTElement = parse5.AST.Default.Element;

export class MessageThread {
    // The id is our internal identifier for a message thread.
    constructor(public id: number,
                public parties: string[], 
                public messages: Message[]) {
    }
}

class DomNode {
    ast: ASTElement;

    constructor(ast: ASTElement) {
        this.ast = ast;
    }

    hasClass(node: ASTElement, cls: string) {
        return node.attrs && node.attrs.findIndex(attr => 
            attr.name === "class" && attr.value === cls
        ) >= 0;
    }

    getFirstByTag(tag: string): DomNode {
        let result = this.ast.childNodes.find(child => child.nodeName === tag);
        if (result) {
            return new DomNode(result as ASTElement);
        } else {
            return undefined;
        }
    }

    getFirstByClass(cls: string): DomNode {
        let result = this.ast.childNodes.find(child => 
            this.hasClass(child as ASTElement, cls)
        );
        if (result) {
            return new DomNode(result as ASTElement);
        } else {
            return undefined;
        }
    }

    getAllByTag(tag: string): DomNode[] {
        return this.ast.childNodes
            .filter(child => child.nodeName === tag)
            .map(ast => new DomNode(ast as ASTElement));
    }

    getAllByClass(cls: string): DomNode[] {
        return this.ast.childNodes
            .filter(child => this.hasClass(child as ASTElement, cls))
            .map(ast => new DomNode(ast as ASTElement));
    }

    text(): string {
        let text_fragments =
            this.ast.childNodes
                .filter(child => child.nodeName === "#text")
                .map(child => (child as TextNode).value.trim())
                .filter(fragment => fragment.length > 0);
        return text_fragments.join("\n");
    }

    body(): DomNode {
        return this.getFirstByTag("body");
    }

    h1(): DomNode {
        return this.getFirstByTag("h1");
    }

    div(): DomNode {
        return this.getFirstByTag("div");
    }
}

class Message {
    constructor(private author: string, 
                private time: Date, 
                private text: string) {
    }
}

let _parseTime = d3.timeParse("%A, %B %d, %Y at %I:%M%p %Z");
function parseTime(raw: string): Date {
    // The %Z format specified of d3-time-format doesn't understand PST and PDT.
    const time = _parseTime(raw.replace("PDT", "-07").replace("PST", "-08"));
    if (!time) {
        // TODO: Maybe not print an error every time.
        console.error("Could not parse: " + raw);
    }
    return time;
}

function readMessage(info: DomNode, text: string): Message {
    let author = info.getFirstByClass("user").text();
    let time = parseTime(info.getFirstByClass("meta").text());
    return new Message(author, time, text);
}

function readMessageThread(node: DomNode, id: number): MessageThread {
    // TODO: Edge case: What if people have a comma in their names?
    let people = node.text().split(",").map(name => name.trim());
    let messageInfos =
        node.getAllByClass("message")
            .map(node => node.getFirstByClass("message_header"));
    let messageTexts = node.getAllByTag("p").map(node => node.text());

    if (messageInfos.length != messageTexts.length) {
        console.error("Number of message infos not the same as messages");
    }

    let messages = _.zip(messageInfos, messageTexts)
                    .map(pair => readMessage(pair[0], pair[1]));
    return new MessageThread(id, people, messages);
}

function parseRaw(raw: string): DomNode {
    let start = new Date().getTime();
    let document = parse5.parse(raw) as parse5.AST.Default.Document;
    let end = new Date().getTime();
    sendUpdate(WorkerActions.progressParsed(end - start));
    return new DomNode(document.childNodes[0] as ASTElement);
}

export function parseThreads(data: string): MessageThread[] {
    let dom = parseRaw(data);
    let contents = dom.body().getFirstByClass("contents");
    let name = contents.h1().text();

    // Not sure what critera determines how <div class="thread"> are grouped
    // into unlabelled <div>s, but it happens.
    let threads_groups = contents.getAllByTag("div")
                                 .map(group => group.getAllByClass("thread"));
    let threads = [].concat.apply([], threads_groups).map(readMessageThread);
    return threads;
}