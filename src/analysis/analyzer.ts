import * as parse5 from 'parse5';
import * as _ from 'underscore';
import * as d3 from 'd3-time-format';

type TextNode = parse5.AST.Default.TextNode
type ASTElement = parse5.AST.Default.Element;

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
    author: string;
    time: Date;
    text: string;

    constructor(author: string, time: Date, text: string) {
        this.author = author;
        this.time = time;
        this.text = text;
    }
}

class MessageThread {
    parties: string[];
    messages: Message[]

    constructor(parties: string[], messages: Message[]) {
        this.parties = parties;
        this.messages = messages;
    }
}

let _parseTimePlain = d3.timeParse("%A, %B %d, %Y at %I:%M%p");
let _parseTimePST = d3.timeParse("%A, %B %d, %Y at %I:%M%p PST");
let _parseTimePDT = d3.timeParse("%A, %B %d, %Y at %I:%M%p PDT");
function parseTime(raw: string): Date {
    // TODO: Think about the PST/PDT parsing issue.
    return _parseTimePlain(raw);
}

function readMessage(info: DomNode, text: string): Message {
    let author = info.getFirstByClass("user").text();
    let time = parseTime(info.getFirstByClass("meta").text());
    return new Message(author, time, text);
}

function readMessageThread(node: DomNode): MessageThread {
    // TODO: Edge case: What if people have a comma in their names?
    let people = node.text().split(",");
    let messageInfos =
        node.getAllByClass("message")
            .map(node => node.getFirstByClass("message_header"));
    let messageTexts = node.getAllByTag("p").map(node => node.text());

    if (messageInfos.length != messageTexts.length) {
        console.error("Number of message infos not the same as messages");
    }

    let messages = _.zip(messageInfos, messageTexts)
                    .map(pair => readMessage(pair[0], pair[1]));
    return new MessageThread(people, messages);
}

function parseRaw(raw: string) {
    let start = new Date().getTime();
    let document = parse5.parse(raw) as parse5.AST.Default.Document;
    let end = new Date().getTime();
    console.log("Parsing took: " + (end - start) + " ms");
    return new DomNode(document.childNodes[0] as ASTElement);
}

onmessage = function (message) {
    console.log('>>> In worker <<<');
    let dom = parseRaw(String(message.data));
    let contents = dom.body().getFirstByClass("contents");
    let name = contents.h1().text();

    // Not sure what critera determines how <div class="thread"> are grouped
    // into unlabelled <div>s, but it happens.
    let threads_groups = contents.getAllByTag("div")
                                 .map(group => group.getAllByClass("thread"));
    let threads = [].concat.apply([], threads_groups);
    threads.map(readMessageThread);

    (postMessage as any)({ key: "name", value: name });
}