import * as _ from "underscore";

import * as Data from "./data";
import { WorkerActions, sendUpdate } from "./worker-actions";
import { WorkerCommands } from "./worker-commands";

import { cleanup } from "./cleanup";
import { countMap, splitOnWhitespace, sum } from "./helpers.js";

import { Message, MessageThread, ThreadParser } from "./parse-threads";

interface WorkerState {
    threads: Map<number, MessageThread>;
    threadDetails: Map<number, Data.ThreadDetails>;
    conversations: Map<number, Message[][]>;
    yourName: string;
    earliestDate: Date;
    latestDate: Date;
    parser: ThreadParser;
}

const state: WorkerState = {
    threads: null,
    threadDetails: new Map(),
    conversations: new Map(),
    yourName: null,
    earliestDate: null,
    latestDate: null,
    parser: null,
};

function simplifiedThreadName(thread: MessageThread): string {
    const withoutYou = thread.parties.filter(name => name !== state.yourName);
    if (withoutYou.length >= 4) {
        // TODO: Could show the person who started the most conversations.
        return withoutYou[0] + " and " + (withoutYou.length - 1) + " others";
    } else {
        return withoutYou.join(" ");
    }
}

function findConversationsForThread(thread: MessageThread): Message[][] {
    const blocks: Message[][] = [];
    let currentBlock: Message[] = [];
    let lastMessageTime = null;

    thread.messages.forEach(message => {
        if (lastMessageTime) {
            const threshold = new Date(lastMessageTime);
            threshold.setHours(threshold.getHours() + 3);
            if (message.time.getTime() > threshold.getTime()) {
                blocks.push(currentBlock);
                currentBlock = [message];
            } else {
                currentBlock.push(message);
            }
        } else {
            currentBlock.push(message);
        }
        lastMessageTime = message.time.getTime();
    });

    blocks.push(currentBlock);

    return blocks;
}

function analyzeThreadDetails(thread: MessageThread): Data.ThreadDetails {
    if (!state.conversations.has(thread.id)) {
        state.conversations.set(thread.id, findConversationsForThread(thread));
    }

    const conversations = state.conversations.get(thread.id);
    const messageCounts = countMap(thread.messages.map(message => message.author)).entries();
    const starterCounts = countMap(conversations.map(conversation => conversation[0].author));
    const enderCounts = countMap(conversations.map(conversation => conversation[conversation.length - 1].author));

    return new Data.ThreadDetails(
        Array.from(messageCounts),
        Array.from(starterCounts),
        Array.from(enderCounts),
    );
}

function calendarDate(timeDate: Date): Date {
    return new Date(
        timeDate.getFullYear(),
        timeDate.getMonth(),
        timeDate.getDate(),
    );
}

// Removes hours, minutes, etc, only keeps the days.
function getMessageCalendarDates(threadIds: number[], includeAllMessages: boolean): Date[] {
    let threadsToCount;
    if (threadIds && threadIds.length > 0) {
        threadsToCount = threadIds.map(id => state.threads.get(id));
    } else {
        threadsToCount = state.threads;
    }

    const dates = [];
    threadsToCount.forEach(thread => {
        thread.messages.forEach(message => {
            if (includeAllMessages || message.author === state.yourName) {
                dates.push(calendarDate(message.time));
            }
        });
    });
    return dates;
}

function getMessagesTimeRange() {
    const dates = [];
    state.threads.forEach(thread => {
        thread.messages.forEach(message => {
            dates.push(message.time);
        });
    });

    let earliest = dates[0].getTime();
    let latest = dates[0].getTime();
    dates.forEach(date => {
        const time = date.getTime();
        if (time < earliest) {
            earliest = time;
        }
        if (time > latest) {
            latest = time;
        }
    });

    state.earliestDate = calendarDate(new Date(earliest));
    state.latestDate = calendarDate(new Date(latest));
}

function applyBlur(counts: Array<[Date, number]>, blurRadius: number): Array<[Date, number]> {
    const blurFilter: number[] = [];
    const sigma = blurRadius / 3;
    let filterSum = 0;
    for (let i = -blurRadius; i <= blurRadius; i++) {
        const filterValue =
            1 / sigma / Math.sqrt(2 * Math.PI) * Math.exp(- i * i / 2 / sigma / sigma);
        filterSum += filterValue;
        blurFilter[i + blurRadius] = filterValue;
    }

    // Normalize the filter to sum to 1.
    for (let i = 0; i < 1 + 2 * blurRadius; i++) {
        blurFilter[i] /= filterSum;
    }

    const result: Array<[Date, number]> = [];

    // Left edge
    for (let i = 0; i < blurRadius; i++) {
        let sum = 0;
        let filterSum = 0;
        for (let j = -i; j <= blurRadius; j++) {
            const filterValue = blurFilter[-i + blurRadius];
            filterSum += filterValue;
            sum += filterValue * counts[i + j][1];
        }
        result.push([counts[i][0], sum / filterSum]);
    }

    // Middle part, where we know that the filter sums to 1.
    for (let i = blurRadius; i < counts.length - blurRadius; i++) {
        let sum = 0;
        for (let j = -blurRadius; j <= blurRadius; j++) {
            sum += blurFilter[j + blurRadius] * counts[i + j][1];
        }
        result.push([counts[i][0], sum]);
    }

    // Right edge
    for (let i = counts.length - blurRadius; i < counts.length; i++) {
        let sum = 0;
        let filterSum = 0;
        for (let j = -blurRadius; j < counts.length - i; j++) {
            const filterValue = blurFilter[j + blurRadius];
            filterSum += filterValue;
            sum += filterValue * counts[i + j][1];
        }
        result.push([counts[i][0], sum / filterSum]);
    }

    return result;
}

function getMsgCountByDay(threadIds: number[], includeAllMessages: boolean, blurRadius: number): Array<[Date, number]> {
    if (!state.earliestDate || !state.latestDate) {
        getMessagesTimeRange();
    }

    // Can't place Date directly into a Map<Date, number>, because equality of Date objects
    // is only by reference.
    const dates = getMessageCalendarDates(threadIds, includeAllMessages);
    const counts = countMap(dates.map(date => date.getTime()));

    let currentDate = state.earliestDate;
    const latestDate = state.latestDate;
    let countForAllDates: Array<[Date, number]> = [];
    while (currentDate <= latestDate) {
       currentDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
       if (counts.has(currentDate.getTime())) {
           countForAllDates.push([currentDate, counts.get(currentDate.getTime())]);
       } else {
           countForAllDates.push([currentDate, 0]);
       }
    }

    if (blurRadius > 0) {
        countForAllDates = applyBlur(countForAllDates, blurRadius);
    }

    return countForAllDates;
}

function getPunchcard(threadIds: number[]): number[][] {
    const counts = Array(7).fill(null).map(() => Array(24).fill(0));

    let threadsToCount;
    if (threadIds && threadIds.length > 0) {
        threadsToCount = threadIds.map(id => state.threads.get(id));
    } else {
        threadsToCount = state.threads;
    }

    threadsToCount.forEach(thread => {
        thread.messages.forEach(message => {
            counts[message.time.getDay()][message.time.getHours()] += 1;
        });
    });

    return counts;
}

function getWordcloudWords(threadId: number): string[] {
    const words = new Set<string>();
    state.threads.get(threadId).messages.forEach(message => {
        // http://stackoverflow.com/questions/6162600/how-do-you-split-a-javascript-string-by-spaces-and-punctuation
        // TODO: Something better that can handle non-english characters
        message.text.split(/\W+/).forEach(word => {
            words.add(word.toLowerCase());
        });
    });
    return Array.from(words).slice(0, 100);
}

function getConversationStarts(threadId: number): Map<string, Array<[Date, number]>> {
    const conversations = state.conversations.get(threadId);
    let year = state.earliestDate.getFullYear();
    let month = state.earliestDate.getMonth();

    const countForMonth = new Map();
    const counts = new Map();
    state.threads.get(threadId).parties.forEach(name => {
        countForMonth.set(name, 0);
        counts.set(name, []);
    });

    conversations.forEach(conversation => {
        const startTime = conversation[0].time;
        while (year < startTime.getFullYear() || month < startTime.getMonth()) {
            state.threads.get(threadId).parties.forEach(name => {
                counts.get(name).push([new Date(year, month), countForMonth.get(name)]);
                countForMonth.set(name, 0);
            });
            month += 1;
            if (month === 12) {
                month = 0;
                year += 1;
            }
        }

        const starter = conversation[0].author;
        countForMonth.set(starter, countForMonth.get(starter) + 1);
    });

    state.threads.get(threadId).parties.forEach(name => {
        counts.get(name).push([new Date(year, month), countForMonth.get(name)]);
    });

    return counts;
}

function getMessageWordCounts(threadId: number): Map<string, Map<number, number>> {
    const thread = state.threads.get(threadId);
    const counts: Map<string, Map<number, number>> = new Map();
    thread.parties.forEach(name => counts.set(name, new Map()));
    thread.messages.forEach(message => {
        const count = splitOnWhitespace(message.text).length;
        const map = counts.get(message.author);
        if (map.has(count)) {
            map.set(count, map.get(count) + 1);
        } else {
            map.set(count, 1);
        }
    });
    return counts;
}

// Returns the length of conversations based on who started it.
function getConversationLengths(threadId: number): Map<string, Map<number, number>> {
    const thread = state.threads.get(threadId);
    const counts: Map<string, Map<number, number>> = new Map();
    thread.parties.forEach(name => counts.set(name, new Map()));

    const conversations = state.conversations.get(threadId);
    conversations.forEach(messages => {
        const map = counts.get(messages[0].author);
        if (map.has(messages.length)) {
            map.set(messages.length, map.get(messages.length) + 1);
        } else {
            map.set(messages.length, 1);
        }
    });
    return counts;
}

function getMessageProportions(): Array<[string, number]> {
    const sorted = _.sortBy(
        Array.from(state.threads.values()),
        thread => -thread.messages.length,
    );
    const totalMessages = sum(sorted.map(thread => thread.messages.length));
    let totalSoFar = 0;
    const proportions = [];
    for (const thread of sorted) {
        totalSoFar += thread.messages.length;
        proportions.push([simplifiedThreadName(thread), thread.messages.length]);
        // There will be too much of a long tail of threads with very few
        // messages, group them into "others".
        if (thread.messages.length / totalMessages < 0.01) {
            proportions.push(["Others", totalMessages - totalSoFar]);
            break;
        }
    }
    return proportions;
}

function getWordsFrequency(threadId: number, wordsToSearch: string[]): Map<string, number> {
    const thread = state.threads.get(threadId);
    const counts = new Map();
    wordsToSearch = wordsToSearch.map(word => word.toLowerCase());
    wordsToSearch.forEach(word => counts.set(word, 0));
    thread.messages.forEach(message => {
        const words = splitOnWhitespace(message.text).map(word => word.toLowerCase());
        wordsToSearch.forEach(wordToSearch => {
            words.forEach(word => {
                if (word === wordToSearch) {
                    counts.set(word, counts.get(word) + 1);
                }
            });
        });
    });
    return counts;
}

// Group conversations are not unique (e.g. John, Adam, Sam could appear multiple times).
// Individual conversations are not unique. There's a limit of 10,000 per thread (in the HTML data),
// and I'm not sure if it could be broken in pieces for other reasons.
//
// There's no reliable way to tell apart two friends with the same name.
function dedupThreads(threads: MessageThread[]): MessageThread[] {
    return _.values(_.groupBy(threads, thread => thread.parties.join("|")))
        .map(threadGroup =>
            new MessageThread(
                threadGroup[0].id,
                threadGroup[0].parties,
                _.flatten(threadGroup.map(thread => thread.messages))),
        );
}

function parseChunk(chunk, isLastChunk) {
    if (!state.parser) {
        state.parser = new ThreadParser();
    }
    state.parser.onChunk(chunk);
    if (isLastChunk) {
        const parseResults = state.parser.finish();
        const threadsList = dedupThreads(parseResults.threads);
        cleanup(threadsList);
        const threadInfos = threadsList.map(thread =>
            new Data.ThreadInfo(thread.id, thread.parties, thread.messages.length),
        );

        state.threads = new Map();
        state.yourName = parseResults.yourName;
        threadsList.forEach(thread => {
            state.threads.set(thread.id, thread);
        });

        const sortedThreadInfos = _.sortBy(threadInfos, info => -info.length);

        // TODO: Handle case of 0 threads or 0 messages.

        const endTime = new Date().getTime();
        const parseTime = endTime - state.parser.parseStartTime;
        sendUpdate(new WorkerActions.Threads(sortedThreadInfos, parseTime));

        state.parser = null;
    } else {
        sendUpdate(new WorkerActions.ReadyForNextChunk());
    }
}

onmessage = (message: MessageEvent) => {
    const command: WorkerCommands.t = message.data;

    if (command.type !== "parse_chunk" && !state.threads) {
        console.error("Expected worker state to contain parsed threads!");
        console.error(command);
    }

    switch (command.type) {
        case "parse_chunk":
            parseChunk(command.chunk, command.isLastChunk);
            break;
        case "get_misc_info":
            const proportions = getMessageProportions();
            sendUpdate(new WorkerActions.GotMiscInfo(
                new Data.MiscInfo(state.yourName, proportions)),
            );
            break;
        case "get_msg_count_by_day":
            const counts = getMsgCountByDay(
                command.threadIds,
                command.includeAllMessages,
                command.blurRadius,
            );
            sendUpdate(new WorkerActions.GotMessageCountByDay(counts));
            break;
        case "get_msg_word_counts":
            sendUpdate(new WorkerActions.GotMessageWordCounts(
                getMessageWordCounts(command.threadId)),
            );
            break;
        case "get_conversation_lengths":
            sendUpdate(new WorkerActions.GotConversationLengths(
                getConversationLengths(command.threadId)),
            );
            break;
        case "get_punchcard":
            const punchcard = getPunchcard(command.threadIds);
            sendUpdate(new WorkerActions.GotPunchcard(punchcard));
            break;
        case "get_thread_details":
            const id = command.threadId;
            const thread = state.threads.get(id);
            if (!state.threadDetails.has(id)) {
                state.threadDetails.set(id, analyzeThreadDetails(thread));
            }

            const threadDetails = state.threadDetails.get(id);
            sendUpdate(new WorkerActions.GotThreadDetails(id, threadDetails));
            break;
        case "get_wordcloud":
            const words = getWordcloudWords(command.threadId);
            sendUpdate(new WorkerActions.GotWordcloud(command.threadId, words));
            break;
        case "get_conversation_starts":
            const starts = getConversationStarts(command.threadId);
            sendUpdate(new WorkerActions.GotConversationStarts(command.threadId, starts));
            break;
        case "get_words_frequency":
            const wordFrequency = getWordsFrequency(command.threadId, command.wordsToSearch);
            sendUpdate(new WorkerActions.GotWordsFrequency(command.threadId, wordFrequency));
            break;
        default: const _exhaustiveCheck: never = command;
    }
}
