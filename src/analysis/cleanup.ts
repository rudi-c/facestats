import * as _ from 'underscore';
import * as Immutable from 'immutable'

import { Message, MessageThread } from './parse-threads'
import { fbEmailRegex } from './helpers'

class Relation {
    // Prefer using Immutable.Set as it comes with useful built-in helper functions.
    constructor(public thread: MessageThread,
                // Names that appear in the thread author list
                public statedParties: Immutable.Set<string>,
                // Ids that appear in the message list but not author list
                public unknownIds: Immutable.Set<number>,
                // Names that appear in the message list but not author list
                public unknownNames: Immutable.Set<string>) {
    }
}

function numberIfId(name) {
    const result = name.match(fbEmailRegex);
    return result ? parseInt(result[1]) : name;
}

function makeRelations(threads: MessageThread[]): Relation[] {
    return threads.map(thread => {
        const statedParties = Immutable.Set(thread.parties);
        const actualParties = Immutable.Set(thread.messages.map(msg => msg.author));

        const statedIds = Immutable.Set<number>(
            thread.parties.map(numberIfId).filter(Number.isInteger)
        );

        // Assume no one would do something pathological like set their Facebook names to the
        // format of the Facebook email. There's no way we could tell the difference.
        const parsedNames = actualParties.map(numberIfId).toArray();

        const [ids, names] = _.partition(parsedNames, Number.isInteger);
        const unknownIds = Immutable.Set<number>(ids).subtract(statedIds);
        const unknownNames = Immutable.Set<string>(names).subtract(statedParties);

        return new Relation(thread, statedParties, unknownIds, unknownNames);
    });
}

// This function handles two situations:
// 1) Someone's first and last name are reversed in some messages.
//    e.g. Chen Wu and Wu Chen both showing up.
// 2) Someone has a middle name or a first or last name with a space, and they don't show up
//    consistently.
//    e.g. John Adam Smith and John Smith both showing up.
function resolveNameOrdering(relations: Relation[]) {
    relations.forEach(relation => {
        const mapping = new Map<string, string>();
        relation.unknownNames.forEach(unknown => {
            const nameComponents = Immutable.Set(unknown.split(" "));
            const matchCounts = relation.statedParties.toArray().map(stated => {
                let match: [number, string] =
                    [Immutable.Set(stated.split(" ")).intersect(nameComponents).size, stated];
                return match;
            });
            const bestNumberOfMatchingComponents = _.max(matchCounts.map(count => count[0]));

            // Only resolve a mapping if there is no tie.
            const bests = matchCounts.filter(count => count[0] == bestNumberOfMatchingComponents);
            if (bests.length == 1) {
                mapping.set(unknown, bests[0][1]);
            }
        });
        // Resolve mapping.
        relation.thread.messages.forEach(message => {
            if (mapping.has(message.author)) {
                message.author = mapping.get(message.author);
            }
        })
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


function makeIdMapping(relations: Relation[]): Map<number, Immutable.Set<string>> {
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

    return knownIds;
}


function applyMapping(relations: Relation[], knownIds: Map<number, Immutable.Set<string>>) {
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

function takeRemainingUnknownsAsLiteral(threads: MessageThread[]) {
    threads.forEach(thread => {
        const statedParties = Immutable.Set(thread.parties);
        const actualParties = Immutable.Set(thread.messages.map(msg => msg.author));
        thread.parties = statedParties.union(actualParties).toArray();
    });
}

export function cleanup(threads: MessageThread[]) {
    console.log("Cleaning up " + threads.length + " threads...");

    const relations = makeRelations(threads);
    resolveNameOrdering(relations);
    const knownIds = makeIdMapping(relations);
    applyMapping(relations, knownIds);
    takeRemainingUnknownsAsLiteral(threads);
}