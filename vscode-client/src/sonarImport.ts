/**
 * Fetches a Gherkin quality profile from SonarQube and converts it to gherkinAnalyzer.rules format.
 */

const GHERKIN_LANGUAGE = 'gherkin';
const REPO_KEY = 'qualimetry-gherkin';

export interface SonarConfig {
    serverUrl: string;
    profileNameOrKey: string;
    token?: string;
}

interface QualityProfile {
    key: string;
    name: string;
    language: string;
    languageName?: string;
}

interface QualityProfilesResponse {
    profiles?: QualityProfile[];
}

interface RuleActivation {
    severity?: string;
    params?: Array<{ key: string; value: string }>;
}

interface SonarRule {
    key: string;
    name?: string;
    severity?: string;
    activations?: RuleActivation[];
}

/** Top-level actives: ruleKey -> list of activations (per profile) */
interface RulesSearchResponse {
    total?: number;
    rules?: SonarRule[];
    actives?: Record<string, Array<{ severity?: string; params?: Array<{ key: string; value: string }> }>>;
    p?: number;
    ps?: number;
}

function normalizeUrl(url: string): string {
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
function buildAuthHeaders(token: string | undefined): Record<string, string> {
    if (!token || !token.trim()) {
        return {};
    }
    const t = token.trim();
    return { Authorization: 'Bearer ' + t };
}

/** Basic auth (token as username, empty password) for older SonarQube or strict proxies. */
function buildBasicAuthHeader(token: string | undefined): Record<string, string> {
    if (!token || !token.trim()) {
        return {};
    }
    const b64 = Buffer.from(token.trim() + ':', 'utf8').toString('base64');
    return { Authorization: 'Basic ' + b64 };
}

export async function fetchQualityProfiles(config: SonarConfig): Promise<QualityProfile[]> {
    const base = normalizeUrl(config.serverUrl);
    const url = `${base}/api/qualityprofiles/search?language=${encodeURIComponent(GHERKIN_LANGUAGE)}`;
    const baseHeaders: Record<string, string> = {
        'Accept': 'application/json',
        'User-Agent': 'Qualimetry-Gherkin-Extension/1.0',
    };
    let res = await fetch(url, { headers: { ...baseHeaders, ...buildAuthHeaders(config.token) } });
    if ((res.status === 401 || res.status === 403) && config.token) {
        res = await fetch(url, { headers: { ...baseHeaders, ...buildBasicAuthHeader(config.token) } });
    }
    if (!res.ok) {
        throw new Error(`SonarQube profiles request failed: ${res.status} ${res.statusText}`);
    }
    const data = (await res.json()) as QualityProfilesResponse;
    return data.profiles ?? [];
}

export function resolveProfileKey(profiles: QualityProfile[], nameOrKey: string): string | undefined {
    const input = nameOrKey.trim().toLowerCase();
    const exact = profiles.find(
        (p) => p.key === nameOrKey.trim() || p.name?.toLowerCase() === input
    );
    if (exact) {
        return exact.key;
    }
    const partial = profiles.find(
        (p) => p.key.toLowerCase().includes(input) || p.name?.toLowerCase().includes(input)
    );
    return partial?.key;
}

export async function fetchActiveRules(
    config: SonarConfig,
    profileKey: string
): Promise<Record<string, { enabled: boolean; severity: string; [k: string]: unknown }>> {
    const base = normalizeUrl(config.serverUrl);
    const rules: Record<string, { enabled: boolean; severity: string; [k: string]: unknown }> = {};
    const baseHeaders: Record<string, string> = {
        'Accept': 'application/json',
        'User-Agent': 'Qualimetry-Gherkin-Extension/1.0',
    };
    const authHeaders = buildAuthHeaders(config.token);
    const authHeadersBasic = buildBasicAuthHeader(config.token);
    let page = 1;
    const pageSize = 100;

    while (true) {
        const url = `${base}/api/rules/search?activation=true&qprofile=${encodeURIComponent(profileKey)}&f=actives&p=${page}&ps=${pageSize}`;
        let res = await fetch(url, { headers: { ...baseHeaders, ...authHeaders } });
        if ((res.status === 401 || res.status === 403) && config.token) {
            res = await fetch(url, { headers: { ...baseHeaders, ...authHeadersBasic } });
        }
        if (!res.ok) {
            throw new Error(`SonarQube rules request failed: ${res.status} ${res.statusText}`);
        }
        const data = (await res.json()) as RulesSearchResponse;
        const list = data.rules ?? [];
        const activesByKey = data.actives ?? {};
        for (const r of list) {
            const fullKey = r.key ?? '';
            if (!fullKey.startsWith(REPO_KEY + ':')) {
                continue;
            }
            const ruleKey = fullKey.slice((REPO_KEY + ':').length);
            const activationsList = activesByKey[fullKey] ?? r.activations ?? [];
            const activation = Array.isArray(activationsList) && activationsList.length > 0
                ? activationsList[0]
                : undefined;
            const severity = (activation?.severity ?? r.severity ?? 'MAJOR').toLowerCase();
            const entry: { enabled: boolean; severity: string; [k: string]: unknown } = {
                enabled: true,
                severity,
            };
            if (activation?.params && activation.params.length > 0) {
                for (const p of activation.params) {
                    if (p.key && p.value !== undefined) {
                        entry[p.key] = p.value;
                    }
                }
            }
            rules[ruleKey] = entry;
        }
        const total = data.total ?? 0;
        if (page * pageSize >= total || list.length === 0) {
            break;
        }
        page += 1;
    }
    return rules;
}
