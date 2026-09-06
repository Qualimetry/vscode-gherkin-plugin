/**
 * Shared SonarQube Web API transport: URL normalisation, authentication, and paging.
 */

export interface SonarConnection {
    serverUrl: string;
    token?: string;
}

const USER_AGENT = 'Qualimetry-Gherkin-Extension/1.0';

/** SonarQube caps page size at 500 on every paged endpoint. */
export const MAX_PAGE_SIZE = 500;

/**
 * SonarQube refuses to page beyond this many results and returns an error rather than
 * an empty page, so callers must stop before crossing it and report the shortfall.
 */
export const MAX_SEARCHABLE_RESULTS = 10000;

export function normalizeUrl(url: string): string {
    let u = url.trim();
    if (!/^https?:\/\//i.test(u)) {
        u = 'https://' + u;
    }
    return u.replace(/\/+$/, '');
}

/**
 * SonarQube Web API accepts:
 * - Authorization: Bearer <token> (recommended, SonarQube 9.x+)
 * - Authorization: Basic <base64(token:)> (token as username, empty password; used by SonarScanner)
 * We send Bearer so the token is verbatim; some proxies forward it more reliably than Basic.
 */
export function buildAuthHeaders(token: string | undefined): Record<string, string> {
    if (!token || !token.trim()) {
        return {};
    }
    return { Authorization: 'Bearer ' + token.trim() };
}

/** Basic auth (token as username, empty password) for older SonarQube or strict proxies. */
export function buildBasicAuthHeader(token: string | undefined): Record<string, string> {
    if (!token || !token.trim()) {
        return {};
    }
    const b64 = Buffer.from(token.trim() + ':', 'utf8').toString('base64');
    return { Authorization: 'Basic ' + b64 };
}

export interface SonarRequestOptions {
    method?: 'GET' | 'POST';
    form?: Record<string, string>;
    signal?: AbortSignal;
}

/**
 * Issues one request, retrying once with Basic auth when Bearer is rejected.
 */
export async function sonarFetch(
    connection: SonarConnection,
    path: string,
    options: SonarRequestOptions = {}
): Promise<Response> {
    const url = normalizeUrl(connection.serverUrl) + path;
    const headers: Record<string, string> = {
        Accept: 'application/json',
        'User-Agent': USER_AGENT,
    };
    let body: string | undefined;
    if (options.form) {
        headers['Content-Type'] = 'application/x-www-form-urlencoded';
        body = new URLSearchParams(options.form).toString();
    }
    const init: RequestInit = { method: options.method ?? 'GET', body, signal: options.signal };

    let response = await fetch(url, { ...init, headers: { ...headers, ...buildAuthHeaders(connection.token) } });
    if ((response.status === 401 || response.status === 403) && connection.token) {
        response = await fetch(url, {
            ...init,
            headers: { ...headers, ...buildBasicAuthHeader(connection.token) },
        });
    }
    return response;
}

export async function sonarGetJson<T>(
    connection: SonarConnection,
    path: string,
    description: string,
    signal?: AbortSignal
): Promise<T> {
    const response = await sonarFetch(connection, path, { signal });
    if (!response.ok) {
        throw new Error(`SonarQube ${description} request failed: ${response.status} ${response.statusText}`);
    }
    return (await response.json()) as T;
}

/** Distinguishes "the server said no such thing" from a transport or permission failure. */
export async function sonarResourceExists(
    connection: SonarConnection,
    path: string
): Promise<boolean> {
    const response = await sonarFetch(connection, path);
    if (response.status === 404) {
        return false;
    }
    if (!response.ok) {
        throw new Error(`SonarQube request failed: ${response.status} ${response.statusText}`);
    }
    return true;
}
