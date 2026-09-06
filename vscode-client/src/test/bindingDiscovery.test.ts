import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
    collectCandidates,
    projectKeyFromScannerConfig,
    repositoryNameFromRemote,
    type WorkspaceFile,
} from '../bindingDiscovery';

function file(path: string, content: string): WorkspaceFile {
    return { path, content };
}

test('reads sonar.projectKey from sonar-project.properties', () => {
    const files = [file('sonar-project.properties', 'sonar.projectKey=acme_checkout\nsonar.sources=.\n')];
    assert.equal(projectKeyFromScannerConfig(files), 'acme_checkout');
});

test('prefers an explicit maven property over the coordinates', () => {
    const pom = `<project>
        <groupId>com.acme</groupId>
        <artifactId>checkout</artifactId>
        <properties><sonar.projectKey>acme-checkout-explicit</sonar.projectKey></properties>
      </project>`;
    assert.equal(projectKeyFromScannerConfig([file('pom.xml', pom)]), 'acme-checkout-explicit');
});

test('falls back to maven coordinates when no property is set', () => {
    const pom = `<project>
        <groupId>com.acme</groupId>
        <artifactId>checkout</artifactId>
      </project>`;
    assert.equal(projectKeyFromScannerConfig([file('pom.xml', pom)]), 'com.acme:checkout');
});

test('ignores coordinates inherited from a parent block', () => {
    const pom = `<project>
        <parent><groupId>com.acme</groupId><artifactId>parent</artifactId></parent>
        <artifactId>checkout</artifactId>
      </project>`;
    assert.equal(projectKeyFromScannerConfig([file('pom.xml', pom)]), undefined);
});

test('ignores unresolved maven placeholders rather than binding to a literal', () => {
    const pom = `<project>
        <groupId>\${company.group}</groupId>
        <artifactId>checkout</artifactId>
      </project>`;
    assert.equal(projectKeyFromScannerConfig([file('pom.xml', pom)]), undefined);
});

test('reads the key from a gradle build', () => {
    const gradle = `sonarqube { properties { property "sonar.projectKey", "acme-gradle" } }`;
    assert.equal(projectKeyFromScannerConfig([file('build.gradle', gradle)]), 'acme-gradle');
    assert.equal(
        projectKeyFromScannerConfig([file('gradle.properties', 'systemProp.sonar.projectKey=acme-props')]),
        'acme-props'
    );
});

test('reads the key from a GitHub workflow', () => {
    const workflow = `jobs:
  scan:
    steps:
      - run: mvn sonar:sonar -Dsonar.projectKey=acme_ci -Dsonar.host.url=https://sonar
`;
    assert.equal(projectKeyFromScannerConfig([file('.github/workflows/build.yml', workflow)]), 'acme_ci');
});

test('reads the key from a dotnet scanner invocation in an azure pipeline', () => {
    const pipeline = `steps:
  - script: dotnet sonarscanner begin /k:"acme-dotnet" /d:sonar.host.url=https://sonar
`;
    assert.equal(projectKeyFromScannerConfig([file('azure-pipelines.yml', pipeline)]), 'acme-dotnet');
});

test('scanner properties win over CI definitions', () => {
    const files = [
        file('.github/workflows/build.yml', 'run: sonar -Dsonar.projectKey=from_ci'),
        file('sonar-project.properties', 'sonar.projectKey=from_properties'),
    ];
    assert.equal(projectKeyFromScannerConfig(files), 'from_properties');
});

test('a workspace with no scanner signals yields nothing', () => {
    assert.equal(projectKeyFromScannerConfig([file('README.md', '# hello')]), undefined);
});

test('extracts the repository name from every remote URL form', () => {
    assert.equal(repositoryNameFromRemote('https://github.com/acme/checkout.git'), 'checkout');
    assert.equal(repositoryNameFromRemote('git@github.com:acme/checkout.git'), 'checkout');
    assert.equal(repositoryNameFromRemote('https://dev.azure.com/acme/proj/_git/checkout'), 'checkout');
    assert.equal(repositoryNameFromRemote('https://github.com/acme/checkout/'), 'checkout');
    assert.equal(repositoryNameFromRemote(undefined), undefined);
    assert.equal(repositoryNameFromRemote('   '), undefined);
});

test('candidates are ordered by confidence and de-duplicated', () => {
    const candidates = collectCandidates({
        files: [file('sonar-project.properties', 'sonar.projectKey=from_properties')],
        gitRemoteUrl: 'https://github.com/acme/checkout.git',
        folderName: 'checkout',
    });
    assert.deepEqual(candidates, [
        { projectKey: 'from_properties', source: 'scannerConfig' },
        { projectKey: 'checkout', source: 'gitRemote' },
    ]);
});

test('a workspace with no signals produces no candidate rather than a guess', () => {
    assert.deepEqual(collectCandidates({ files: [], folderName: '  ' }), []);
});
