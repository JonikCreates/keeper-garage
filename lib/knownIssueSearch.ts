import type { KnownIssue, VehicleProfile } from "./catalog";

export type KnownIssueSearchResult = {
  issue: KnownIssue;
  score: number;
  matchLabel: "High match" | "Close match" | "Related match";
  reason: string;
};

const stopWords = new Set(["a", "an", "and", "at", "for", "from", "in", "is", "of", "on", "or", "the", "to", "with"]);

const synonymGroups = [
  ["vvt", "valvetronic"],
  ["actuator", "servomotor"],
  ["control", "arm", "thrust", "tension", "strut", "wishbone"],
  ["sway", "stabilizer", "antiroll", "end", "drop", "link"],
  ["gasket", "seal", "flange", "oring"],
  ["clunk", "knock", "rattle", "noise"],
  ["leak", "seep", "wet", "drip"],
  ["pcv", "crankcase", "ventilation", "breather"],
];

function normalize(value: string) {
  return value.normalize("NFKD").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function tokens(value: string) {
  return normalize(value).split(/\s+/).filter((token) => token.length > 1 && !stopWords.has(token));
}

function editDistance(left: string, right: string) {
  const previous = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
    const current = [leftIndex];
    for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
      const cost = left[leftIndex - 1] === right[rightIndex - 1] ? 0 : 1;
      current[rightIndex] = Math.min(current[rightIndex - 1] + 1, previous[rightIndex] + 1, previous[rightIndex - 1] + cost);
    }
    previous.splice(0, previous.length, ...current);
  }
  return previous[right.length];
}

function expandedTerms(queryToken: string) {
  if (queryToken === "ofhg") return ["ofhg", "oil", "filter", "housing", "gasket"];
  const group = synonymGroups.find((values) => values.includes(queryToken));
  return group ?? [queryToken];
}

function termConcept(queryToken: string) {
  if (queryToken === "ofhg") return "ofhg";
  const groupIndex = synonymGroups.findIndex((values) => values.includes(queryToken));
  return groupIndex >= 0 ? `group-${groupIndex}` : queryToken;
}

function tokenSimilarity(queryToken: string, candidateToken: string) {
  if (queryToken === candidateToken) return 1;
  if (queryToken.length >= 3 && candidateToken.startsWith(queryToken)) return .86;
  if (candidateToken.length >= 3 && queryToken.startsWith(candidateToken)) return .8;
  if (queryToken.length < 4 || candidateToken.length < 4) return 0;
  const distance = editDistance(queryToken, candidateToken);
  return distance <= Math.max(1, Math.floor(Math.max(queryToken.length, candidateToken.length) * .25))
    ? 1 - distance / Math.max(queryToken.length, candidateToken.length)
    : 0;
}

function fieldScore(queryTokens: string[], value: string, weight: number) {
  const candidateTokens = tokens(value);
  if (!candidateTokens.length) return 0;
  return queryTokens.reduce((total, queryToken) => {
    const similarity = expandedTerms(queryToken).reduce((best, term) => Math.max(best, ...candidateTokens.map((candidate) => tokenSimilarity(term, candidate))), 0);
    return total + similarity * weight;
  }, 0);
}

export function searchKnownIssues(query: string, issues: KnownIssue[], profile: VehicleProfile): KnownIssueSearchResult[] {
  const normalizedQuery = normalize(query);
  const queryTokens = tokens(query);
  if (!normalizedQuery || !queryTokens.length) return [];
  // REVIEW DECISION: synonym-linked words count as one concept so a generic seal mention cannot outrank a VVT-specific match.
  const queryConceptCount = new Set(queryTokens.map(termConcept)).size;

  return issues.map((issue) => {
    const aliases = issue.aliases ?? [];
    const fields = [
      { name: "issue title", value: issue.issue, weight: 14 },
      { name: "alternate name", value: aliases.join(" "), weight: 16 },
      { name: "component", value: issue.component ?? "", weight: 13 },
      { name: "symptom", value: issue.symptoms, weight: 10 },
      { name: "description", value: issue.description, weight: 7 },
      { name: "search keyword", value: (issue.keywords ?? []).join(" "), weight: 12 },
      { name: "system", value: issue.system, weight: 6 },
      { name: "vehicle fitment", value: `${profile.platform} ${profile.engineCode} ${profile.drivetrain} ${profile.transmission}`, weight: 4 },
    ];
    const scoredFields = fields.map((field) => ({ ...field, score: fieldScore(queryTokens, field.value, field.weight) }));
    const allCandidateTokens = tokens(fields.map((field) => field.value).join(" "));
    const matchedConcepts = new Set(queryTokens.filter((queryToken) => expandedTerms(queryToken).some((term) =>
      allCandidateTokens.some((candidate) => tokenSimilarity(term, candidate) >= .65))).map(termConcept));
    const phraseBonus = fields.reduce((total, field) => normalize(field.value).includes(normalizedQuery) ? total + field.weight * 2 : total, 0);
    const sortedFields = [...scoredFields].sort((left, right) => right.score - left.score);
    const score = sortedFields.reduce((total, field) => total + field.score, phraseBonus);
    const strongest = sortedFields[0];
    const aliasPhrase = aliases.find((alias) => normalize(alias).includes(normalizedQuery) || normalizedQuery.includes(normalize(alias)));
    const reason = aliasPhrase
      ? `“${query}” matches the alternate name “${aliasPhrase}”.`
      : strongest.score > 0
        ? `Closest terminology appears in this issue’s ${strongest.name}.`
        : "Related terminology appears in this vehicle’s known-issue record.";
    const matchLabel: KnownIssueSearchResult["matchLabel"] = score >= 85 ? "High match" : score >= 38 ? "Close match" : "Related match";
    return {
      issue,
      score,
      matchedConceptCount: matchedConcepts.size,
      matchLabel,
      reason,
    };
  }).filter((result) => result.score >= 12 && result.matchedConceptCount >= (queryConceptCount > 1 ? 2 : 1))
    .sort((left, right) => right.score - left.score || left.issue.issue.localeCompare(right.issue.issue))
    .slice(0, 10);
}
