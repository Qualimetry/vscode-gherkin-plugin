/**
 * Server-side project search. Large instances hold thousands of projects, so results are
 * always paged and filtered by the server, never fetched wholesale and filtered locally.
 */

import { sonarFetch, sonarGetJson, type SonarConnection } from './sonarHttp';

export const PROJECT_PAGE_SIZE = 50;

export interface ProjectSummary {
    key: string;
    name: string;
}

export interface ProjectSearchResult {
    projects: ProjectSummary[];
    total: number;
    /** True when the server holds more matches than this page carries. */
    truncated: boolean;
}

interface SearchProjectsResponse {
    components?: Array<{ key?: string; name?: string }>;
    paging?: { total?: number };
}

interface ComponentsSearchResponse {
    components?: Array<{ key?: string; name?: string }>;
    paging?: { total?: number };
}

function toResult(
    components: Array<{ key?: string; name?: string }> | undefined,
    total: number
): ProjectSearchResult {
    const projects: ProjectSummary[] = [];
    for (const component of components ?? []) {
        if (component.key) {
            projects.push({ key: component.key, name: component.name?.trim() || component.key });
        }
    }
    return { projects, total, truncated: total > projects.length };
}

/**
 * `search_projects` backs the server's own Projects page, so it honours Browse permission for
 * ordinary users. `components/search` is the fallback for servers that do not expose it.
 */
export async function searchProjects(
    connection: SonarConnection,
    query: string,
    signal?: AbortSignal
): Promise<ProjectSearchResult> {
    const trimmed = query.trim();
    const filter = trimmed ? `&filter=${encodeURIComponent(`query = "${trimmed}"`)}` : '';
    try {
        const data = await sonarGetJson<SearchProjectsResponse>(
            connection,
            `/api/components/search_projects?ps=${PROJECT_PAGE_SIZE}${filter}`,
            'project search',
            signal
        );
        return toResult(data.components, data.paging?.total ?? 0);
    } catch (error) {
        if (signal?.aborted) {
            throw error;
        }
        const queryParam = trimmed ? `&q=${encodeURIComponent(trimmed)}` : '';
        const data = await sonarGetJson<ComponentsSearchResponse>(
            connection,
            `/api/components/search?qualifiers=TRK&ps=${PROJECT_PAGE_SIZE}${queryParam}`,
            'project search',
            signal
        );
        return toResult(data.components, data.paging?.total ?? 0);
    }
}

interface FavoritesResponse {
    favorites?: Array<{ key?: string; name?: string; qualifier?: string }>;
    paging?: { total?: number };
}

/**
 * On an instance with thousands of projects the user's favourites are almost always the short
 * list they actually want, so they are the opening screen rather than an arbitrary first page.
 */
export async function fetchFavouriteProjects(
    connection: SonarConnection,
    signal?: AbortSignal
): Promise<ProjectSummary[]> {
    const response = await sonarFetch(connection, `/api/favorites/search?ps=${PROJECT_PAGE_SIZE}`, { signal });
    if (!response.ok) {
        return [];
    }
    const data = (await response.json()) as FavoritesResponse;
    return (data.favorites ?? [])
        .filter((f) => f.key && (f.qualifier === undefined || f.qualifier === 'TRK'))
        .map((f) => ({ key: f.key as string, name: f.name?.trim() || (f.key as string) }));
}

/**
 * Reports whether the token may enumerate projects at all. When it may not, the caller offers
 * a typed key instead of surfacing a permission error the user cannot act on.
 */
export async function canListProjects(connection: SonarConnection): Promise<boolean> {
    try {
        await searchProjects(connection, '');
        return true;
    } catch {
        return false;
    }
}

export const SEARCH_DEBOUNCE_MS = 250;

export interface SearchScheduler<T> {
    schedule(query: string): void;
    dispose(): void;
}

/**
 * Collapses rapid keystrokes into a single request and abandons a query the moment a newer one
 * arrives, so a fast typist cannot queue a request per character against a large instance.
 */
export function createSearchScheduler<T>(
    run: (query: string, signal: AbortSignal) => Promise<T>,
    onResult: (query: string, result: T) => void,
    onError: (query: string, error: unknown) => void,
    delayMs: number = SEARCH_DEBOUNCE_MS
): SearchScheduler<T> {
    let timer: ReturnType<typeof setTimeout> | undefined;
    let inFlight: AbortController | undefined;
    let disposed = false;

    const cancelPending = () => {
        if (timer) {
            clearTimeout(timer);
            timer = undefined;
        }
        inFlight?.abort();
        inFlight = undefined;
    };

    return {
        schedule(query: string) {
            if (disposed) {
                return;
            }
            cancelPending();
            timer = setTimeout(() => {
                timer = undefined;
                const controller = new AbortController();
                inFlight = controller;
                run(query, controller.signal)
                    .then((result) => {
                        if (!controller.signal.aborted && !disposed) {
                            onResult(query, result);
                        }
                    })
                    .catch((error) => {
                        if (!controller.signal.aborted && !disposed) {
                            onError(query, error);
                        }
                    })
                    .finally(() => {
                        if (inFlight === controller) {
                            inFlight = undefined;
                        }
                    });
            }, delayMs);
        },
        dispose() {
            disposed = true;
            cancelPending();
        },
    };
}

export function truncationNotice(result: ProjectSearchResult): string | undefined {
    if (!result.truncated) {
        return undefined;
    }
    return `Showing ${result.projects.length} of ${result.total} projects - keep typing to narrow.`;
}
