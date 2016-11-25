import { ThreadInfo } from '../state'
import { WorkerActions } from '../worker-actions'
import { WorkerCommands } from './worker-commands'
import * as _ from 'underscore';

import { sendUpdate } from './helpers'

import { parseThreads, Message, MessageThread } from './parse-threads'

let threads: MessageThread[] = undefined;

// Removes hours, minutes, etc, only keeps the days.
function getMessageCalendarDates(): Date[] {
    const dates = [];
    threads.forEach(thread => {
        thread.messages.forEach(message => {
            const date = new Date(
                message.time.getFullYear(), 
                message.time.getMonth(), 
                message.time.getDate()
            );
            dates.push(date);
        });
    });
    return dates;
}

function getMsgCountByDay(): [Date, number][] {
    // Can't place Date directly into a Map<Date, number>, because equality of Date objects
    // is only by reference.
    const counts = new Map<number, number>();
    const dates = getMessageCalendarDates();
    dates.forEach(date => {
        const time = date.getTime();
        if (counts.has(time)) {
            counts.set(time, counts.get(time) + 1);
        } else {
            counts.set(time, 1);
        }
    });

    let earliest = dates[0].getTime();
    let latest = dates[0].getTime();
    counts.forEach((_, time) => {
        if (time < earliest) {
            earliest = time;
        }
        if (time > latest) {
            latest = time;
        }
    });

    let currentDate = new Date(earliest);
    let latestDate = new Date(latest);
    let countForAllDates: [Date, number][] = [];
    while (currentDate <= latestDate) {
       currentDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
       if (counts.has(currentDate.getTime())) {
           countForAllDates.push([currentDate, counts.get(currentDate.getTime())]);
       } else {
           countForAllDates.push([currentDate, 0]);
       }
    }
    return countForAllDates;
}

onmessage = function(message: MessageEvent) {
    const command: WorkerCommands.t = message.data;

    if (command.type != 'parse_raw_data' && !threads) {
        console.error("Expected worker state to contain parsed threads!");
    }

    switch (command.type) {
        case "parse_raw_data": 
            threads = parseThreads(command.rawData);
            const thread_infos = threads.map(thread => 
                new ThreadInfo(thread.id, thread.parties, thread.messages.length)
            );

            // TODO: Handle case of 0 threads or 0 messages.

            sendUpdate(WorkerActions.threads(thread_infos));
            break;
        case "get_misc_info": 
            break;
        case "get_msg_count_by_day": 
            const counts = getMsgCountByDay();
            sendUpdate(WorkerActions.gotMessageCountByDay(counts));
            break;
        default: const _exhaustiveCheck: never = command;
    }
}