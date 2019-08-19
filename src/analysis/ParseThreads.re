[%%bs.raw {|
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();

var d3 = require("d3-time-format");
var _ = require("underscore");
var htmlparser2 = require("../../lib/htmlparser2");
|}];

let _Message = [%bs.raw {| (function () {
    function Message(author, time, text) {
        this.author = author;
        this.time = time;
        this.text = text;
    }
    return Message;
}())
|}];

let _MessageThread = [%bs.raw {| (function () {
    // The id is our internal identifier for a message thread.
    function MessageThread(id, parties, messages) {
        this.id = id;
        this.parties = parties;
        this.messages = messages;
        this.parties = parties.sort();
        this.messages = _.sortBy(messages, function (message) { return message.time.getTime(); });
    }
    return MessageThread;
}())
|}];

let _ParseResults = [%bs.raw {| (function () {
    function ParseResults(threads, yourName) {
        this.threads = threads;
        this.yourName = yourName;
    }
    return ParseResults;
}())
|}];

let _parseTime = [%bs.raw {| d3.timeParse("%A, %B %d, %Y at %I:%M%p %Z") |}];

let parseTime = [%bs.raw {| function (raw) {
    // The %Z format specified of d3-time-format doesn't understand PST and PDT.
    var time = _parseTime(raw.replace("PDT", "-07").replace("PST", "-08")
        .replace("EDT", "-04").replace("EST", "-05"));
    if (!time) {
        console.error("Could not parse: " + raw);
        // TODO: Proper error handling
        throw new Error("");
    }
    return time;
}
|}];

let _Handler = [%bs.raw {| (function () {
    function Handler(tagName) {
        this.tagName = tagName;
        this.onFinish = function (children) { return children; };
    }
    Handler.prototype.withClass = function (tagClass) {
        this.tagClass = tagClass;
        return this;
    };
    Handler.prototype.withChildHandlers = function (childHandlers) {
        this.childHandlers = childHandlers;
        return this;
    };
    Handler.prototype.withOnFinish = function (onFinish) {
        this.onFinish = onFinish;
        return this;
    };
    Handler.prototype.matches = function (name, attribs) {
        return this.tagName === name && (!this.tagClass || this.tagClass === attribs["class"]);
    };
    return Handler;
}())
|}];

let _IgnoreHandler = [%bs.raw {| (function (_super) {
    __extends(IgnoreHandler, _super);
    function IgnoreHandler() {
        var _this = _super.call(this, "") || this;
        _this.childHandlers = [_this];
        _this.onFinish = function (_) { return undefined; };
        return _this;
    }
    IgnoreHandler.prototype.matches = function (name, attribs) {
        return true;
    };
    return IgnoreHandler;
}(Handler))
|}];

let firstChild = [%bs.raw {| function (children) {
    var child = children[0];
    return child;
}
|}];

let messageTextHandler = [%bs.raw {| new Handler("p").withOnFinish(firstChild) |}];
let userHandler = [%bs.raw {| new Handler("span").withClass("user").withOnFinish(firstChild) |}];
let dateHandler = [%bs.raw {| new Handler("span").withClass("meta").withOnFinish(firstChild) |}];
let messageMetadataHandler = [%bs.raw {| new Handler("div")
    .withClass("message")
    .withChildHandlers([
    new Handler("div")
        .withClass("message_header")
        .withChildHandlers([userHandler, dateHandler])
        .withOnFinish(function (children) {
        var user = children[0], timeString = children[1];
        return {
            author: user,
            time: parseTime(timeString)
        };
    }),
])
    .withOnFinish(firstChild)
|}];

let threadHandler = [%bs.raw {| new Handler("div")
    .withClass("thread")
    .withChildHandlers([messageMetadataHandler, messageTextHandler])
    .withOnFinish(function (children) {
    var threadName = children[0];
    // TODO: Edge case: What if people have a comma in their names?
    var parties = threadName.split(",").map(function (name) { return name.trim(); });
    var messages = [];
    for (var i = 1; i < children.length; i += 2) {
        var meta = children[i];
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
        parties: parties,
        messages: messages
    };
})
|}];

let contentsDivHandler = [%bs.raw {| new Handler("div").withChildHandlers([threadHandler])
|}];

let nameH1Handler = [%bs.raw {| new Handler("h1")
    .withChildHandlers([threadHandler])
    .withOnFinish(firstChild)
|}];

let contentsHandler = [%bs.raw {| new Handler("div")
    .withClass("contents")
    .withChildHandlers([nameH1Handler, contentsDivHandler])
    .withOnFinish(function (children) {
    var name = children[0];
    var threadGroups = children.slice(1);
    var threads = _.flatten(threadGroups).map(function (thread, i) {
        return new MessageThread(i, thread.parties, thread.messages);
    });
    return new ParseResults(threads, name);
})
|}];

let bodyHandler = [%bs.raw {| new Handler("body")
    .withChildHandlers([contentsHandler, new IgnoreHandler()])
    .withOnFinish(firstChild)
|}];

let htmlHandler = [%bs.raw {| new Handler("html")
    .withChildHandlers([bodyHandler, new IgnoreHandler()])
    .withOnFinish(firstChild)
|}];

let rootHandler = [%bs.raw {| new Handler("")
    .withChildHandlers([htmlHandler])
    .withOnFinish(firstChild)
|}];

let _ThreadParser = [%bs.raw {| (function () {
    function ThreadParser() {
        this.handlerStack = [rootHandler];
        this.childrenStack = [[]];
        this.lastAddedTextChild = false;
        this.initParser();
    }
    ThreadParser.prototype.initParser = function () {
        var _this = this;
        this.parseStartTime = new Date().getTime();
        this.parser = new htmlparser2.Parser({
            onopentag: function (name, attribs) {
                for (var _i = 0, _a = _.last(_this.handlerStack).childHandlers; _i < _a.length; _i++) {
                    var handler = _a[_i];
                    if (handler.matches(name, attribs)) {
                        _this.handlerStack.push(handler);
                        _this.childrenStack.push([]);
                        _this.lastAddedTextChild = false;
                        return;
                    }
                }
                console.error("No matching handler found!");
                console.error(name);
                console.error(attribs);
                // TODO: Proper error handling
                throw new Error("");
            },
            ontext: function (text) {
                var children = _.last(_this.childrenStack);
                // Sometimes text gets broken up into multiple text events. For example,
                // when special characters like @ get represented as &#064;
                // TODO: Fix O(n^2) behavior here if this code gets shared (we won't run
                // into this kind of input in practice in this application).
                if (_this.lastAddedTextChild) {
                    children[children.length - 1] += text;
                }
                else {
                    children.push(text);
                }
                _this.lastAddedTextChild = true;
            },
            onclosetag: function (name) {
                var handler = _.last(_this.handlerStack);
                var children = _.last(_this.childrenStack);
                var result;
                if (children.length === 0) {
                    // Something like <p></p> doesn't trigger the onText event,
                    // but in most cases we probably still want to interpret that
                    // as the empty string.
                    result = handler.onFinish([""]);
                }
                else {
                    result = handler.onFinish(children);
                }
                _this.handlerStack.pop();
                _this.childrenStack.pop();
                _this.lastAddedTextChild = false;
                if (result !== undefined) {
                    _.last(_this.childrenStack).push(result);
                }
            }
        }, { decodeEntities: true });
    };
    ThreadParser.prototype.onChunk = function (chunk) {
        this.parser.write(chunk);
    };
    ThreadParser.prototype.finish = function () {
        this.parser.end();
        var end = new Date().getTime();
        console.log("Total parsing time: " + (end - this.parseStartTime));
        var result = this.childrenStack[0][0];
        return result;
    };
    return ThreadParser;
}())
|}];
