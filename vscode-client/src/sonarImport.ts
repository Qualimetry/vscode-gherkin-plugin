/**
 * Fetches a Gherkin quality profile from SonarQube and converts it to gherkinAnalyzer.rules format.
 */

import { sonarGetJson, type SonarConnection } from './sonarHttp';

const GHERKIN_LANGUAGE = 'gherkin';
export const REPO_KEY = 'qualimetry-gherkin';
export const RULE_KEY_PREFIX = REPO_KEY + ':';

export interface SonarConfig extends SonarConnection {
    profileNameOrKey?: string;
}

export interface QualityProfile {
    key: string;
    name: string;
    language: string;
    languageName?: string;
    isDefault?: boolean;
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

export async function fetchQualityProfiles(config: SonarConfig): Promise<QualityProfile[]> {
    const data = await sonarGetJson<QualityProfilesResponse>(
        config,
        `/api/qualityprofiles/search?language=${encodeURIComponent(GHERKIN_LANGUAGE)}`,
        'profiles'
    );
    return data.profiles ?? [];
}

/**
 * Profiles the server actually applies to a bound project, which is authoritative in a way
 * that a typed profile name is not.
 */
export async function fetchProjectQualityProfiles(
    config: SonarConfig,
    projectKey: string
): Promise<QualityProfile[]> {
    const data = await sonarGetJson<QualityProfilesResponse>(
        config,
        `/api/qualityprofiles/search?project=${encodeURIComponent(projectKey)}`,
        'project profiles'
    );
    return (data.profiles ?? []).filter((p) => p.language === GHERKIN_LANGUAGE);
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
    const rules: Record<string, { enabled: boolean; severity: string; [k: string]: unknown }> = {};
    let page = 1;
    const pageSize = 100;

    while (true) {
        const data = await sonarGetJson<RulesSearchResponse>(
            config,
            `/api/rules/search?activation=true&qprofile=${encodeURIComponent(profileKey)}&f=actives&p=${page}&ps=${pageSize}`,
            'rules'
        );
        const list = data.rules ?? [];
        const activesByKey = data.actives ?? {};
        for (const r of list) {
            const fullKey = r.key ?? '';
            if (!fullKey.startsWith(RULE_KEY_PREFIX)) {
                continue;
            }
            const ruleKey = fullKey.slice(RULE_KEY_PREFIX.length);
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
