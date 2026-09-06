/**
 * Lets the user choose a SonarQube project from an instance that may hold thousands of them.
 */

import * as vscode from 'vscode';
import {
    canListProjects,
    createSearchScheduler,
    fetchFavouriteProjects,
    searchProjects,
    truncationNotice,
    type ProjectSearchResult,
    type ProjectSummary,
} from './projectSearch';
import type { SonarConnection } from './sonarHttp';

interface ProjectQuickPickItem extends vscode.QuickPickItem {
    projectKey?: string;
}

function toItems(projects: ProjectSummary[]): ProjectQuickPickItem[] {
    return projects.map((project) => ({
        label: project.name,
        description: project.key,
        projectKey: project.key,
    }));
}

/**
 * Opens the picker seeded with a starting query, usually the repository name, so the list is
 * already narrowed when it appears. Returns undefined when the user dismisses it.
 */
export async function pickProject(
    connection: SonarConnection,
    seedQuery: string | undefined
): Promise<string | undefined> {
    if (!(await canListProjects(connection))) {
        return promptForProjectKey(seedQuery);
    }

    const quickPick = vscode.window.createQuickPick<ProjectQuickPickItem>();
    quickPick.title = 'Select the SonarQube project for this workspace';
    quickPick.placeholder = 'Type to search projects';
    quickPick.matchOnDescription = true;
    // Results are already filtered by the server; filtering again would hide valid matches.
    quickPick.ignoreFocusOut = true;

    const applyResult = (result: ProjectSearchResult) => {
        quickPick.items = toItems(result.projects);
        const notice = truncationNotice(result);
        quickPick.title = notice
            ? `Select the SonarQube project for this workspace - ${notice}`
            : 'Select the SonarQube project for this workspace';
    };

    const scheduler = createSearchScheduler(
        (query, signal) => searchProjects(connection, query, signal),
        (_query, result) => {
            quickPick.busy = false;
            applyResult(result);
        },
        (_query, error) => {
            quickPick.busy = false;
            quickPick.items = [];
            quickPick.title = `Project search failed: ${error instanceof Error ? error.message : String(error)}`;
        }
    );

    quickPick.onDidChangeValue((value) => {
        quickPick.busy = true;
        if (!value.trim()) {
            showFavouritesOrSearch();
            return;
        }
        scheduler.schedule(value);
    });

    const showFavouritesOrSearch = () => {
        fetchFavouriteProjects(connection)
            .then((favourites) => {
                if (favourites.length > 0) {
                    quickPick.busy = false;
                    quickPick.items = toItems(favourites);
                    quickPick.title = 'Your favourite SonarQube projects - type to search all';
                } else {
                    scheduler.schedule('');
                }
            })
            .catch(() => scheduler.schedule(''));
    };

    return new Promise<string | undefined>((resolve) => {
        quickPick.onDidAccept(() => {
            const selected = quickPick.selectedItems[0];
            quickPick.hide();
            resolve(selected?.projectKey);
        });
        quickPick.onDidHide(() => {
            scheduler.dispose();
            quickPick.dispose();
            resolve(undefined);
        });

        quickPick.busy = true;
        quickPick.show();
        if (seedQuery && seedQuery.trim()) {
            quickPick.value = seedQuery.trim();
            scheduler.schedule(seedQuery.trim());
        } else {
            showFavouritesOrSearch();
        }
    });
}

/**
 * Fallback for tokens that cannot enumerate projects. The key is still validated before use,
 * so a typo fails at binding time rather than silently syncing nothing.
 */
export async function promptForProjectKey(seed: string | undefined): Promise<string | undefined> {
    const value = await vscode.window.showInputBox({
        title: 'SonarQube project key',
        prompt: 'This token cannot list projects, so enter the project key directly.',
        value: seed ?? '',
        ignoreFocusOut: true,
        validateInput: (v) => (v.trim() ? undefined : 'Project key is required'),
    });
    return value?.trim() || undefined;
}
