// booleanSearch.ts

// Result of matching a single item against a boolean query
export interface BooleanSearchResult {
  matches: boolean;
  score: number; // 0–100 relevance score for ranking
}

// ---------- Normalization helpers ----------

function normalizeSpaces(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

function cleanTerm(raw: string): string {
  // Strip parentheses/quotes and leading/trailing punctuation,
  // collapse spaces, lowercase.
  const t = raw
    .replace(/[()"]/g, " ") // remove () and " that often wrap groups
    .replace(/^[^\w]+|[^\w]+$/g, " "); // trim non-word chars at ends
  return normalizeSpaces(t.toLowerCase());
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeForMatch(s: string): string {
  // Lowercase and replace any run of non-alphanumerics with a space.
  // This makes "x-ray" match "x ray", "clinic/hospital" etc.
  return normalizeSpaces(s.toLowerCase().replace(/[^a-z0-9]+/gi, " "));
}

// ---------- Query parsing ----------

export function parseBooleanQuery(query: string): {
  andTerms: string[];
  orTerms: string[];
  notTerms: string[];
} {
  const andTerms: string[] = [];
  const orTerms: string[] = [];
  const notTerms: string[] = [];

  const q = normalizeSpaces(query);

  // Split by AND/OR/NOT, keeping operators in the array
  const parts = q.split(/\s+(AND|OR|NOT)\s+/i);

  let current: "AND" | "OR" | "NOT" = "AND"; // default
  let sawOR = false;

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (!part) continue;

    if (/^(and|or|not)$/i.test(part)) {
      current = part.toUpperCase() as "AND" | "OR" | "NOT";
      if (current === "OR") sawOR = true;
      continue;
    }

    const term = cleanTerm(part);
    if (!term) continue;

    if (current === "AND") andTerms.push(term);
    else if (current === "OR") orTerms.push(term);
    else notTerms.push(term);
  }

  // IMPORTANT:
  // If the query contained any ORs, merge the initial AND "head" terms into OR.
  // This avoids requiring BOTH the head term and an OR term (which was accidentally over-strict).
  if (sawOR && orTerms.length > 0 && andTerms.length > 0) {
    orTerms.unshift(...andTerms);
    andTerms.length = 0;
  }

  // If no operators at all, treat all words as AND terms
  if (andTerms.length === 0 && orTerms.length === 0 && notTerms.length === 0) {
    const terms = cleanTerm(query).split(" ").filter(Boolean);
    andTerms.push(...terms);
  }

  return { andTerms, orTerms, notTerms };
}

// ---------- Matching ----------

export function matchBooleanSearch(text: string, query: string): BooleanSearchResult {
  const { andTerms, orTerms, notTerms } = parseBooleanQuery(query);

  // Normalize text so punctuation differences don't hurt matching
  const normText = " " + normalizeForMatch(text) + " ";

  const termMatches = (term: string): boolean => {
    const t = normalizeForMatch(term);
    if (!t) return false;

    // Single token -> \bword\b
    // Multi-word -> \bword1\s+word2(\s+word3)*\b
    const tokens = t.split(" ").filter(Boolean);
    const pattern =
      tokens.length === 1 ? `\\b${escapeRegex(tokens[0])}\\b` : `\\b${tokens.map(escapeRegex).join("\\s+")}\\b`;

    const re = new RegExp(pattern, "i");
    return re.test(normText);
  };

  // 1) NOT terms exclude immediately
  for (const term of notTerms) {
    if (term && termMatches(term)) {
      return { matches: false, score: 0 };
    }
  }

  // 2) AND terms: all must match
  let andMatches = 0;
  for (const term of andTerms) {
    if (termMatches(term)) andMatches++;
  }
  if (andTerms.length > 0 && andMatches !== andTerms.length) {
    return { matches: false, score: 0 };
  }

  // 3) OR terms: at least one must match (if OR exists)
  let orMatches = 0;
  if (orTerms.length > 0) {
    for (const term of orTerms) {
      if (termMatches(term)) orMatches++;
    }
    if (orMatches === 0) {
      return { matches: false, score: 0 };
    }
  }

  // 4) Score: simple coverage metric
  const totalMatches = andMatches + orMatches;
  const totalTerms = andTerms.length + orTerms.length;
  const score = totalTerms > 0 ? (totalMatches / totalTerms) * 100 : 0;

  return { matches: true, score };
}

// ---------- Filtering API (unchanged behavior for non-boolean queries) ----------

export function filterWithBooleanSearch<T>(items: T[], query: string, textExtractor: (item: T) => string[]): T[] {
  const q = normalizeSpaces(query || "");
  if (!q) return items;

  // All searches use intelligent boolean matching with word boundaries and scoring
  const scored = items.map((item) => {
    const texts = textExtractor(item);
    const combinedText = texts.join(" ");
    const result = matchBooleanSearch(combinedText, q);
    return { item, ...result };
  });

  return scored
    .filter((s) => s.matches)
    .sort((a, b) => b.score - a.score)
    .map((s) => s.item);
}
