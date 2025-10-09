interface BooleanSearchResult {
  matches: boolean;
  score: number; // Relevance score for ranking
}

export function parseBooleanQuery(query: string): {
  andTerms: string[];
  orTerms: string[];
  notTerms: string[];
} {
  const andTerms: string[] = [];
  const orTerms: string[] = [];
  const notTerms: string[] = [];
  
  // Split by AND, OR, NOT (case insensitive)
  const parts = query.split(/\s+(AND|OR|NOT)\s+/i);
  
  let currentOperator: 'AND' | 'OR' | 'NOT' | null = 'AND'; // default to AND
  
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i].trim().toLowerCase();
    
    if (part === 'and' || part === 'or' || part === 'not') {
      currentOperator = part.toUpperCase() as 'AND' | 'OR' | 'NOT';
    } else if (part) {
      if (currentOperator === 'AND') {
        andTerms.push(part);
      } else if (currentOperator === 'OR') {
        orTerms.push(part);
      } else if (currentOperator === 'NOT') {
        notTerms.push(part);
      }
    }
  }
  
  // If no explicit operators, treat all terms as AND
  if (andTerms.length === 0 && orTerms.length === 0 && notTerms.length === 0) {
    const terms = query.toLowerCase().split(/\s+/).filter(t => t.length > 0);
    andTerms.push(...terms);
  }
  
  return { andTerms, orTerms, notTerms };
}

export function matchBooleanSearch(
  text: string,
  query: string
): BooleanSearchResult {
  const { andTerms, orTerms, notTerms } = parseBooleanQuery(query);
  const lowerText = text.toLowerCase();
  
  // Check NOT terms first - if any match, exclude this result
  for (const term of notTerms) {
    if (lowerText.includes(term)) {
      return { matches: false, score: 0 };
    }
  }
  
  // Check AND terms - all must match
  let andMatches = 0;
  for (const term of andTerms) {
    if (lowerText.includes(term)) {
      andMatches++;
    }
  }
  
  if (andTerms.length > 0 && andMatches !== andTerms.length) {
    return { matches: false, score: 0 };
  }
  
  // Check OR terms - at least one must match (if any OR terms exist)
  let orMatches = 0;
  if (orTerms.length > 0) {
    for (const term of orTerms) {
      if (lowerText.includes(term)) {
        orMatches++;
      }
    }
    if (orMatches === 0) {
      return { matches: false, score: 0 };
    }
  }
  
  // Calculate relevance score (higher is better)
  const totalMatches = andMatches + orMatches;
  const totalTerms = andTerms.length + orTerms.length;
  const score = totalTerms > 0 ? (totalMatches / totalTerms) * 100 : 0;
  
  return { matches: true, score };
}

export function filterWithBooleanSearch<T>(
  items: T[],
  query: string,
  textExtractor: (item: T) => string[]
): T[] {
  if (!query.trim()) return items;
  
  // Check if query contains boolean operators
  const hasBooleanOperators = /\s+(AND|OR|NOT)\s+/i.test(query);
  
  if (!hasBooleanOperators) {
    // Fallback to simple includes search
    const lowerQuery = query.toLowerCase();
    return items.filter(item => {
      const texts = textExtractor(item);
      return texts.some(text => text.toLowerCase().includes(lowerQuery));
    });
  }
  
  // Boolean search with scoring
  const scored = items.map(item => {
    const texts = textExtractor(item);
    const combinedText = texts.join(' ');
    const result = matchBooleanSearch(combinedText, query);
    return { item, ...result };
  });
  
  return scored
    .filter(s => s.matches)
    .sort((a, b) => b.score - a.score) // Sort by relevance
    .map(s => s.item);
}
