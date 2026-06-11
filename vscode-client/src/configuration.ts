import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { execSync } from 'child_process';

export interface GherkinAnalyzerConfig {
    enabled: boolean;
    javaHome: string;
    rules: Record<string, unknown>;
}

export function getConfiguration(): GherkinAnalyzerConfig {
    const config = vscode.workspace.getConfiguration('gherkinAnalyzer');
    return {
        enabled: config.get<boolean>('enabled', true),
        javaHome: config.get<string>('java.home', ''),
        rules: config.get<Record<string, unknown>>('rules', {}),
    };
}

export function findJavaExecutable(configuredPath?: string): string | undefined {
    // 1. Check user-configured path
    if (configuredPath) {
        const resolved = resolveJavaPath(configuredPath);
        if (resolved) {
            return resolved;
        }
    }

    // 2. Check JAVA_HOME
    const javaHome = process.env['JAVA_HOME'];
    if (javaHome) {
        const resolved = resolveJavaPath(javaHome);
        if (resolved) {
            return resolved;
        }
    }

    // 3. Check PATH
    try {
        const cmd = process.platform === 'win32' ? 'where java' : 'which java';
        const result = execSync(cmd, { encoding: 'utf8', timeout: 5000 }).trim();
        const firstLine = result.split(/\r?\n/)[0];
        if (firstLine && fs.existsSync(firstLine)) {
            return firstLine;
        }
    } catch {
        // java not on PATH
    }

    return undefined;
}

export function getJavaVersion(javaExe: string): number | undefined {
    try {
        const output = execSync(`"${javaExe}" -version`, {
            encoding: 'utf8',
            timeout: 10000,
            stdio: ['pipe', 'pipe', 'pipe'],
        });
        // java -version outputs to stderr, but execSync with encoding captures both
        // Try stderr first (most JVMs), then stdout
        const combined = output || '';
        return parseJavaVersion(combined);
    } catch (err: unknown) {
        // java -version writes to stderr, which causes execSync to get it in the error
        if (err && typeof err === 'object' && 'stderr' in err) {
            const stderr = (err as { stderr: string }).stderr;
            if (stderr) {
                return parseJavaVersion(stderr);
            }
        }
        return undefined;
    }
}

function parseJavaVersion(output: string): number | undefined {
    // Matches: "17.0.1", "21.0.2", "11.0.18", "1.8.0_352"
    const match = output.match(/version\s+"(\d+)(?:\.(\d+))?/);
    if (!match) {
        return undefined;
    }
    const major = parseInt(match[1], 10);
    // JDK 8 and earlier used "1.x" format
    if (major === 1 && match[2]) {
        return parseInt(match[2], 10);
    }
    return major;
}

function resolveJavaPath(javaHomeOrPath: string): string | undefined {
    // If it points directly to a java executable
    if (fs.existsSync(javaHomeOrPath) && fs.statSync(javaHomeOrPath).isFile()) {
        return javaHomeOrPath;
    }

    // Treat as JAVA_HOME directory
    const ext = process.platform === 'win32' ? '.exe' : '';
    const javaExe = path.join(javaHomeOrPath, 'bin', `java${ext}`);
    if (fs.existsSync(javaExe)) {
        return javaExe;
    }

    return undefined;
}
