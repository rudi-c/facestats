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

export function mapMap<K, U, V>(
    map: Map<K, U>,
    f: (K, U) => V
    ): Map<K, V> {
    const newMap: Map<K, V> = new Map();
    Array.from(map.entries()).forEach(([key, value]) => {
        newMap.set(key, f(key, value));
    });
    return newMap;
}

export function sum(values: number[]): number {
    return values.reduce((a, b) => a + b);
}

export function splitOnWhitespace(str: string): string[] {
    return str.trim().split(/[ \t\n\r]+/);
}

export function sendUpdate(message: WorkerActions.t) {
    (postMessage as any)(message);
}