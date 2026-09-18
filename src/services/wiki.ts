/**
 * Wikipedia service – fetches article content via the public MediaWiki REST API.
 * No API key required.
 */

export interface WikiSearchResult {
  title: string;
  description: string;
  key: string;
}

export interface WikiArticle {
  title: string;
  content: string; // plain-text summary or full extract
}

/**
 * Search Wikipedia for pages matching a query string.
 * Returns up to `limit` results.
 */
export async function searchWikipedia(
  query: string,
  limit = 8,
): Promise<WikiSearchResult[]> {
  const url = new URL('https://en.wikipedia.org/w/api.php');
  url.searchParams.set('action', 'opensearch');
  url.searchParams.set('search', query);
  url.searchParams.set('limit', String(limit));
  url.searchParams.set('format', 'json');
  url.searchParams.set('origin', '*'); // CORS

  const response = await fetch(url.toString());
  if (!response.ok) throw new Error(`Wikipedia search failed: ${response.status}`);

  // OpenSearch format: [query, [titles], [descriptions], [urls]]
  const data = await response.json() as [string, string[], string[], string[]];
  const titles = data[1];
  const descriptions = data[2];

  return titles.map((title, i) => ({
    title,
    description: descriptions[i] ?? '',
    key: title.replace(/ /g, '_'),
  }));
}

/**
 * Fetch the full plain-text extract of a Wikipedia article by its page title/key.
 */
export async function fetchWikipediaArticle(key: string): Promise<WikiArticle> {
  const url = new URL('https://en.wikipedia.org/w/api.php');
  url.searchParams.set('action', 'query');
  url.searchParams.set('titles', key.replace(/_/g, ' '));
  url.searchParams.set('prop', 'extracts');
  url.searchParams.set('explaintext', 'true');   // plain text, no HTML
  url.searchParams.set('exsectionformat', 'plain');
  url.searchParams.set('format', 'json');
  url.searchParams.set('origin', '*');

  const response = await fetch(url.toString());
  if (!response.ok) throw new Error(`Wikipedia fetch failed: ${response.status}`);

  const data = await response.json();
  const pages = data?.query?.pages as Record<string, { title: string; extract?: string }>;
  const page = Object.values(pages)[0];

  if (!page || page.extract == null) {
    throw new Error(`No content found for article: ${key}`);
  }

  return {
    title: page.title,
    content: page.extract,
  };
}
