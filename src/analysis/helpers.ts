import { WorkerActions } from '../worker-actions'

export function sendUpdate(message: WorkerActions.t) {
    (postMessage as any)(message);
}