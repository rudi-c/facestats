import { WorkerActions } from './worker-actions'

export const fbEmailRegex = new RegExp("^([0-9]*)@facebook.com$");

export function countMap<T>(values: T[]): Map<T, number> {
    const counts = new Map<T, number>();
    values.forEach(value => {
        if (counts.has(value)) {
            counts.set(value, counts.get(value) + 1);
        } else {
            counts.set(value, 1);
        }
    });
    return counts;
}

export function sendUpdate(message: WorkerActions.t) {
    (postMessage as any)(message);
}