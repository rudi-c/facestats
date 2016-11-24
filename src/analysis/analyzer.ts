import { ThreadInfo } from '../state'
import { WorkerActions } from '../worker-actions'
import { WorkerCommands } from './worker-commands'

import { sendUpdate } from './helpers'

import { parseThreads } from './parse-threads'

let threads = undefined;

onmessage = function (message: MessageEvent) {
    const command: WorkerCommands.t = message.data;
    switch (command.type) {
        case "parse_raw_data": 
            threads = parseThreads(command.rawData);
            const thread_infos = threads.map(thread => 
                new ThreadInfo(thread.id, thread.parties, thread.messages.length)
            );

            sendUpdate(WorkerActions.threads(thread_infos));
            break;
        case "get_misc_info": 
            break;
        case "get_msg_count_by_day": 
            break;
        default: const _exhaustiveCheck: never = command;
    }
}