const SEARCH_PAGE_SIZE = 100;
const MAX_SEARCH_PAGES = 10;

interface SearchResponse {
  total_count?: number;
  items?: any[];
}

type RateLimitHandler = (headers: Headers) => void;

async function fetchSearchPage(
  query: string,
  page: number,
  headers: Record<string, string>,
  onHeaders: RateLimitHandler,
): Promise<SearchResponse> {
  const response = await fetch(
    `https://api.github.com/search/issues?q=${query}&per_page=${SEARCH_PAGE_SIZE}&page=${page}`,
    { headers },
  );
  onHeaders(response.headers);

  if (!response.ok) {
    throw new Error('Failed to query contribution list. Rate limit might be reached.');
  }

  return response.json();
}

export async function fetchAllSearchResults(
  query: string,
  headers: Record<string, string>,
  onHeaders: RateLimitHandler,
): Promise<any[]> {
  const firstPage = await fetchSearchPage(query, 1, headers, onHeaders);
  const totalPages = Math.min(
    MAX_SEARCH_PAGES,
    Math.ceil((firstPage.total_count ?? firstPage.items?.length ?? 0) / SEARCH_PAGE_SIZE),
  );

  if (totalPages <= 1) {
    return firstPage.items ?? [];
  }

  const remainingPages = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, index) =>
      fetchSearchPage(query, index + 2, headers, onHeaders),
    ),
  );

  return [firstPage, ...remainingPages].flatMap((page) => page.items ?? []);
}
