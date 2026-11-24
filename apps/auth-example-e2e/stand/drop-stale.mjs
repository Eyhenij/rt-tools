/**
 * Removes the Keycloak container raised with another theme archive than the one on disk.
 *
 * Keycloak reads its theme only at start, and `docker compose up` recreates a container by its
 * composition alone: a new archive at the same path changes nothing there, and the stand answered
 * with the former theme. `serve:auth` calls this between the build of the theme and the raising, so
 * the raising starts a new container. A container of the current theme stays, and without Docker or a
 * container there is nothing to remove. The digest of the archive is written down for the next call.
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { KEYCLOAK_CONTAINER, readFacts, themeRecord, themeStale } from './auth-fresh.mjs';

const ROOT = fileURLToPath(new URL('../../..', import.meta.url)).replace(/\/$/, '');
const facts = readFacts(ROOT);

if (themeStale(facts)) {
    console.log('drop-stale: Keycloak was raised with another theme archive — its container is raised anew');
    execFileSync('docker', ['rm', '-f', KEYCLOAK_CONTAINER], { stdio: ['ignore', 'ignore', 'inherit'] });
}

const record = themeRecord(ROOT);
mkdirSync(dirname(record), { recursive: true });
writeFileSync(record, `${facts.theme.digest ?? ''}\n`);
