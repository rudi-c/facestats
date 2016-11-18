import * as parse5 from 'parse5';
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
                .map(child => (child as TextNode).value.trim());
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
    let threads = contents.div().getAllByClass("thread");
    (postMessage as any)({ key :"name", value: name });
}