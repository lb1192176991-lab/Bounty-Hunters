export interface SearchMatch {
  start: number;
  end: number;
}

export function fuzzySearch(query: string, text: string): SearchMatch[] {
  const matches: SearchMatch[] = [];
  let queryIdx = 0;
  let textIdx = 0;
  let matchStart = -1;
  
  while (queryIdx < query.length && textIdx < text.length) {
    if (query[queryIdx].toLowerCase() === text[textIdx].toLowerCase()) {
      if (matchStart === -1) matchStart = textIdx;
      queryIdx++;
    } else if (matchStart !== -1) {
      matches.push({ start: matchStart, end: textIdx });
      matchStart = -1;
    }
    textIdx++;
  }
  
  if (matchStart !== -1) {
    matches.push({ start: matchStart, end: textIdx });
  }
  
  return queryIdx === query.length ? matches : [];
}

export function highlightMatches(text: string, matches: SearchMatch[]): string {
  if (matches.length === 0) return text;
  
  let result = '';
  let lastEnd = 0;
  
  for (const match of matches.sort((a, b) => a.start - b.start)) {
    result += text.slice(lastEnd, match.start);
    result += `<mark>${text.slice(match.start, match.end)}</mark>`;
    lastEnd = match.end;
  }
  result += text.slice(lastEnd);
  
  return result;
}
