import * as path from 'path';
import * as fs from 'fs';
import * as vscode from 'vscode';
import {
    LanguageClient,
    LanguageClientOptions,
    ServerOptions,
} from 'vscode-languageclient/node';
import { findJavaExecutable, getConfiguration, getJavaVersion } from './configuration';

const MIN_JAVA_VERSION = 17;

let client: LanguageClient | undefined;
let outputChannel: vscode.OutputChannel;

export async function activate(context: vscode.ExtensionContext): Promise<void> {
    outputChannel = vscode.window.createOutputChannel('Gherkin Analyzer');
    context.subscriptions.push(outputChannel);
    outputChannel.appendLine('Gherkin Analyzer: activating...');

    const config = getConfiguration();

    if (!config.enabled) {
        outputChannel.appendLine('Gherkin Analyzer is disabled via settings.');
        return;
    }

    const javaPath = findJavaExecutable(config.javaHome);
    if (!javaPath) {
        const msg = 'Gherkin Analyzer: Java 17+ is required but was not found. ' +
            'Set "gherkinAnalyzer.java.home" in settings, or ensure JAVA_HOME or java is on PATH.';
        outputChannel.appendLine(msg);
        vscode.window.showErrorMessage(msg);
        return;
    }
    outputChannel.appendLine(`Java executable: ${javaPath}`);

    const version = getJavaVersion(javaPath);
    outputChannel.appendLine(`Java version detected: ${version ?? 'unknown'}`);
    if (version !== undefined && version < MIN_JAVA_VERSION) {
        const msg = `Gherkin Analyzer: Java ${MIN_JAVA_VERSION}+ is required, but found Java ${version} at "${javaPath}". ` +
            'Set "gherkinAnalyzer.java.home" to a JDK 17+ installation.';
        outputChannel.appendLine(msg);
        vscode.window.showErrorMessage(msg);
        return;
    }

    const serverJar = path.join(context.extensionPath, 'server', 'gherkin-lsp-server.jar');
    if (!fs.existsSync(serverJar)) {
        const msg = `Gherkin Analyzer: Server JAR not found at ${serverJar}.`;
        outputChannel.appendLine(msg);
        vscode.window.showErrorMessage(msg);
        return;
    }
    outputChannel.appendLine(`Server JAR: ${serverJar}`);

    const serverOptions: ServerOptions = {
        command: javaPath,
        args: ['-jar', serverJar],
        options: { env: process.env },
    };

    const clientOptions: LanguageClientOptions = {
        documentSelector: [{ scheme: 'file', language: 'gherkin' }],
        synchronize: {
            configurationSection: 'gherkinAnalyzer',
        },
        outputChannel,
    };

    client = new LanguageClient(
        'gherkinAnalyzer',
        'Gherkin Analyzer',
        serverOptions,
        clientOptions
    );

    const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
    statusBar.text = '$(checklist) Gherkin Analyzer';
    statusBar.tooltip = 'Gherkin Analyzer is active';
    statusBar.show();
    context.subscriptions.push(statusBar);

    outputChannel.appendLine('Starting language server...');
    try {
        await client.start();
        outputChannel.appendLine('Language server started successfully.');
    } catch (err) {
        const msg = `Gherkin Analyzer: Failed to start language server: ${err}`;
        outputChannel.appendLine(msg);
        vscode.window.showErrorMessage(msg);
        return;
    }
    context.subscriptions.push({ dispose: () => client?.stop() });
}

export async function deactivate(): Promise<void> {
    if (client) {
        await client.stop();
        client = undefined;
    }
}
