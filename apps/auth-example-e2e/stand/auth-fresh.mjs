/**
 * Whether the auth stand raised earlier may serve the suite as it stands, without raising it again.
 *
 * Raising the stand costs about three seconds even when nothing changed: the compose call, the wait
 * for health and the realm import. The suite runs right after the push step that has just raised
 * the same stand, so the second raising is skipped when the stand is provably current. Keycloak
 * reads its theme only at start: a stand that started before the archive was last written answers
 * with the theme loaded earlier, so such a stand never counts as current, and the raising runs as
 * before.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

/** Where Keycloak reads the theme archive inside its container. */
export const THEME_TARGET = '/opt/keycloak/providers/rt-auth-keycloak-theme.jar';

/** The theme archive, relative to the root of the tree. */
export const THEME_ARCHIVE = 'dist/auth-keycloak-theme/rt-auth-keycloak-theme.jar';

/** The files whose edit changes the stand, relative to the root of the tree. */
export const STAND_FILES = ['deploy/auth/compose.yml', 'deploy/auth/realm/rt.json'];

/**
 * The variables the stand takes from the environment of the raising command: the name there, the
 * container and the name it gets inside, and the default of the compose file.
 */
export const STAND_ENV = [
    { name: 'COUNTERS_BY_REALM', container: 'keycloak', inside: 'COUNTERS_BY_REALM', fallback: '' },
    { name: 'E2E_ADMIN_PORT', container: 'config', inside: 'RT_E2E_ADMIN_PORT', fallback: '4310' },
    { name: 'RT_GOOGLE_ENABLED', container: 'config', inside: 'RT_GOOGLE_ENABLED', fallback: 'false' },
    { name: 'RT_GOOGLE_CLIENT_ID', container: 'config', inside: 'RT_GOOGLE_CLIENT_ID', fallback: 'not-set' },
    { name: 'RT_GOOGLE_CLIENT_SECRET', container: 'config', inside: 'RT_GOOGLE_CLIENT_SECRET', fallback: 'not-set' },
];

/** How far the clock of the Docker machine may run ahead of the host, milliseconds. */
export const CLOCK_MARGIN = 5_000;

/** The file compose reads the variables from next to its own file; it lies outside the history. */
export const STAND_DOTENV = 'deploy/auth/.env';

/**
 * The decision itself, over facts already read. Returns the reason the stand is raised again, or
 * null when it may be used as it stands.
 */
export function staleReason(facts) {
    if (facts.keycloak === null || facts.config === null) {
        return 'the stand is not raised';
    }
    if (facts.keycloak.health !== 'healthy') {
        return `Keycloak is ${facts.keycloak.health}`;
    }
    if (facts.keycloak.themeSource !== join(facts.root, THEME_ARCHIVE)) {
        return 'Keycloak mounts the theme of another tree';
    }
    // The container times come from the clock of the Docker machine and the file times from the
    // host: a file written within the margin before the start counts as written after it.
    const startedAt = facts.keycloak.startedAt - CLOCK_MARGIN;
    if (facts.archiveWrittenAt === null || facts.archiveWrittenAt >= startedAt) {
        return 'the theme archive was written after Keycloak started';
    }
    if (facts.standFilesWrittenAt >= startedAt) {
        return 'the stand composition was edited after Keycloak started';
    }
    if (facts.config.exitCode !== 0 || facts.config.finishedAt - CLOCK_MARGIN <= facts.standFilesWrittenAt) {
        return 'the realm file was not applied after its last edit';
    }
    const differing = STAND_ENV.find(({ name }) => facts.env[name] !== facts.running[name]);
    return differing === undefined ? null : `${differing.name} differs from the running stand`;
}

function inspect(container) {
    try {
        const [state, env, mounts] = JSON.parse(
            execFileSync('docker', ['inspect', container, '--format', '[{{json .State}},{{json .Config.Env}},{{json .Mounts}}]'], {
                encoding: 'utf8',
                stdio: ['ignore', 'pipe', 'ignore'],
            })
        );
        return {
            state,
            env: Object.fromEntries(env.map((line) => [line.slice(0, line.indexOf('=')), line.slice(line.indexOf('=') + 1)])),
            mounts,
        };
    } catch {
        return null;
    }
}

function writtenAt(path) {
    try {
        return statSync(path).mtimeMs;
    } catch {
        return null;
    }
}

/** The `NAME=value` lines of the compose variables file; an absent file gives nothing. */
function dotenvOf(path) {
    try {
        return Object.fromEntries(
            readFileSync(path, 'utf8')
                .split('\n')
                .map((line) => line.trim())
                .filter((line) => line !== '' && !line.startsWith('#') && line.includes('='))
                .map((line) => [
                    line.slice(0, line.indexOf('=')).trim(),
                    line
                        .slice(line.indexOf('=') + 1)
                        .trim()
                        .replace(/^(["'])(.*)\1$/, '$2'),
                ])
        );
    } catch {
        return {};
    }
}

/** Reads the facts the decision needs: the two containers of the stand and the files of the tree. */
export function readFacts(root, env = process.env) {
    const keycloak = inspect('rt-auth-keycloak-1');
    const config = inspect('rt-auth-keycloak-config-1');
    const containers = { keycloak, config };
    const dotenv = dotenvOf(join(root, STAND_DOTENV));
    return {
        root,
        archiveWrittenAt: writtenAt(join(root, THEME_ARCHIVE)),
        standFilesWrittenAt: Math.max(...STAND_FILES.map((file) => writtenAt(join(root, file)) ?? Infinity)),
        // Compose takes a variable set in the command environment, even an empty one, over its
        // variables file, and `${NAME:-default}` puts the default in place of an empty value.
        env: Object.fromEntries(STAND_ENV.map(({ name, fallback }) => [name, (name in env ? env[name] : dotenv[name]) || fallback])),
        running: Object.fromEntries(STAND_ENV.map(({ name, container, inside }) => [name, containers[container]?.env[inside] ?? ''])),
        keycloak:
            keycloak === null
                ? null
                : {
                      health: keycloak.state.Health?.Status ?? keycloak.state.Status,
                      startedAt: Date.parse(keycloak.state.StartedAt),
                      themeSource: keycloak.mounts.find((mount) => mount.Destination === THEME_TARGET)?.Source ?? '',
                  },
        config: config === null ? null : { exitCode: config.state.ExitCode, finishedAt: Date.parse(config.state.FinishedAt) },
    };
}
