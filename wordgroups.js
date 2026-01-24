// wordgroups.js - Semantic word groups for local puzzle generation

let semanticGroups = null;

async function loadSemanticGroups() {
    if (semanticGroups) return semanticGroups;

    try {
        const response = await fetch('wordlists/semantic_groups.json');
        if (!response.ok) {
            throw new Error('Failed to load semantic groups');
        }
        semanticGroups = await response.json();
        return semanticGroups;
    } catch (error) {
        console.error('Error loading semantic groups:', error);
        return null;
    }
}

function getGroupsByPrefix(prefix) {
    if (!semanticGroups) return [];

    const normalizedPrefix = prefix.toLowerCase().trim();
    const matchingGroups = [];

    for (const [groupName, words] of Object.entries(semanticGroups)) {
        if (groupName.startsWith(normalizedPrefix)) {
            matchingGroups.push({ name: groupName, words: words });
        }
    }

    return matchingGroups;
}

function getGroupsByFuzzyMatch(query) {
    if (!semanticGroups) return [];

    const normalizedQuery = query.toLowerCase().trim();
    if (!normalizedQuery) return [];

    const matchingGroups = [];

    for (const [groupName, words] of Object.entries(semanticGroups)) {
        // Match if query appears anywhere in the group name
        if (groupName.includes(normalizedQuery)) {
            matchingGroups.push({ name: groupName, words: words });
        }
    }

    // Sort by relevance: exact prefix match first, then by name length
    matchingGroups.sort((a, b) => {
        const aStartsWith = a.name.startsWith(normalizedQuery) ? 0 : 1;
        const bStartsWith = b.name.startsWith(normalizedQuery) ? 0 : 1;
        if (aStartsWith !== bStartsWith) return aStartsWith - bStartsWith;
        return a.name.length - b.name.length;
    });

    return matchingGroups;
}

function getRandomGroupByPrefix(prefix) {
    // Use fuzzy matching instead of strict prefix
    const groups = getGroupsByFuzzyMatch(prefix);
    if (groups.length === 0) return null;

    const randomIndex = Math.floor(Math.random() * groups.length);
    return groups[randomIndex];
}

function getAutocompleteSuggestions(query, limit = 10) {
    const groups = getGroupsByFuzzyMatch(query);
    return groups.slice(0, limit).map(g => g.name);
}

function getAllPrefixes() {
    if (!semanticGroups) return [];

    const prefixes = new Set();
    for (const groupName of Object.keys(semanticGroups)) {
        const prefix = groupName.split('_')[0];
        prefixes.add(prefix);
    }

    return Array.from(prefixes).sort();
}

function getGroupCount() {
    if (!semanticGroups) return 0;
    return Object.keys(semanticGroups).length;
}

function getAllGroupNames() {
    if (!semanticGroups) return [];
    return Object.keys(semanticGroups);
}
