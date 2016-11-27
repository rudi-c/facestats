import * as _ from 'underscore';
import * as Immutable from 'immutable'

import { Message, MessageThread } from './parse-threads'
import { fbEmailRegex } from './helpers'

class Relation {
    // Prefer using Immutable.Set as it comes with useful built-in helper functions.
    constructor(public thread: MessageThread,
                public statedParties: Immutable.Set<string>,
                public unknownIds: Immutable.Set<number>,
                public unknownNames: Immutable.Set<string>) {
    }
}

function makeRelations(threads: MessageThread[]): Relation[] {
    return threads.map(thread => {
        const statedParties = Immutable.Set(thread.parties);
        const actualParties = Immutable.Set(thread.messages.map(msg => msg.author));

        // Assume no one would do something pathological like set their Facebook names to the 
        // format of the Facebook email. There's no way we could tell the difference.
        const parsedNames = actualParties.map(name => {
            const result = name.match(fbEmailRegex);
            return result ? parseInt(result[1]) : name;
        }).toArray();

        const [ids, names] = _.partition(parsedNames, Number.isInteger);
        const unknownIds = Immutable.Set<number>(ids);
        const unknownNames = Immutable.Set<string>(names).subtract(statedParties);

        return new Relation(thread, statedParties, unknownIds, unknownNames);
    });
}

function addKnownId(knownIds: Map<number, Immutable.Set<string>>, id: number, statedName: string) {
    if (knownIds.has(id)) {
        if (!knownIds.get(id).has(statedName)) {
            // console.log("Found another mapping for id " + id + ": " + statedName);
        }
        knownIds.set(id, knownIds.get(id).add(statedName));
    } else {
        // console.log("Found mapping for id " + id + ": " + statedName);
        knownIds.set(id, Immutable.Set([statedName]));
    }
}

function findMappingsByElimination(relation: Relation, 
                                   knownIds: Map<number, Immutable.Set<string>>) {
    const unknownIds = relation.unknownIds.filter(id => !knownIds.has(id));
    const knownParties = relation.unknownIds
        .reduce((acc, id) => knownIds.has(id) ? acc.merge(knownIds.get(id)) : acc, 
                Immutable.Set<string>());
    const freeParties = relation.statedParties.subtract(knownParties);
    if (unknownIds.size == 1 && freeParties.size == 1) {
        addKnownId(knownIds, unknownIds.first(), freeParties.first());
    }
}

export function cleanup(threads: MessageThread[]) {
    console.log("Cleaning up " + threads.length + " threads...");

    const relations = makeRelations(threads);

    const knownIds = new Map<number, Immutable.Set<string>>();
    
    // Start by resolving Facebook Ids.
    // O(n^2) for simplicity since n should be relatively small
    // TODO: Doesn't solve all cases, but will do for now.
    for (let i = 0; i < relations.length; i++) {
        for (let j = i + 1; j < relations.length; j++) {
            const r1 = relations[i];
            const r2 = relations[j];
            if (r1.unknownIds.size > 0 && r2.unknownIds.size > 0) {
                const commonStated = r1.statedParties.intersect(r2.statedParties);
                const commonUnknown = r1.unknownIds.intersect(r2.unknownIds);
                if (commonStated.size === 1 && commonUnknown.size === 1) {
                    // Found a resolution!
                    const statedName = commonStated.first();
                    const id = commonUnknown.first();
                    addKnownId(knownIds, id, statedName);
                    // This might allow us to find more mappings.
                    findMappingsByElimination(r1, knownIds);
                    findMappingsByElimination(r2, knownIds);
                }
            }
        }
    }

    // Apply mapping
    relations.forEach(relation => {
        const idMapping = new Map<string, string>();
        relation.unknownIds.forEach(unknownId => {
            if (knownIds.has(unknownId)) {
                const possibleMatches = knownIds.get(unknownId).intersect(relation.statedParties);
                if (possibleMatches.size == 1) {
                    idMapping.set(unknownId + "@facebook.com", possibleMatches.first());
                } else if (possibleMatches.size == 0) {
                    // TODO (group conversations?)
                    // console.log("check me 1")
                } else {
                    // TODO (group conversations?)
                    // console.log("check me 2: " + possibleMatches.toArray())
                }
            }
        });
        relation.thread.messages.forEach(message => {
            if (idMapping.has(message.author)) {
                message.author = idMapping.get(message.author);
            }
        });
    });
}