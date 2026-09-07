#!/usr/bin/env node
/**
 * The receiver's commands on production.
 *
 * Creating a tree, issuing a token, the list of trees and the accounts are called by one and the same
 * long line: ssh, the rollout directory, the production composition with the environment file, the
 * service and the image's entry point. Assembled from memory, it refuses — a line break inside single
 * quotes tears it in two, and the remote shell gets two pieces instead of a command.
 *
 *   pnpm run prod:api tree:list
 *   pnpm run prod:api tree:add 'The tree name' a1b2c3d4e5f6
 *
 * The arguments go to production as they are: the reading is written in the receiver itself, and a
 * second reading here would mean two answers to the question what argument arrived. An unknown
 * argument the receiver meets with a list of its commands — so there is no list here either.
 *
 * Without arguments the command is not called at all: an empty argument at the image's entry point
 * means not a list but a raised service — next to the one already working.
 */
import { spawnSync } from 'node:child_process';

/** The production node — a name from the ssh settings; the rollout directory and the composition are described in `docs/PROD.md`. */
const HOST = 'message-bus';
const DIRECTORY = '/opt/message-bus';
const COMPOSE = 'docker compose -f docker-compose.prod.yml --env-file .env.prod';

/** The receiver's service in the production composition and the entry point of its image. */
const SERVICE = 'api';
const ENTRY = 'node main.js';

/** The exit code on a reading refusal: the same one the receiver itself answers an unfit argument with. */
const EXIT_REFUSED = 2;

/**
 * An argument in a shape the remote shell will not read: the whole string travels as one word.
 * A single quote inside closes the string, puts an escaped one and opens it again.
 */
function quoted(argument) {
    return `'${String(argument).replace(/'/g, `'\\''`)}'`;
}

function main() {
    const argv = process.argv.slice(2);

    if (argv.length === 0) {
        process.stderr.write(
            [
                'prod-api: an argument is needed — a receiver command',
                'the list is printed by the receiver itself: pnpm run prod:api help',
                '',
            ].join('\n')
        );
        process.exit(EXIT_REFUSED);
    }

    const remote = `cd ${DIRECTORY} && ${COMPOSE} exec -T ${SERVICE} ${ENTRY} ${argv.map(quoted).join(' ')}`;
    const answer = spawnSync('ssh', [HOST, remote], { stdio: 'inherit' });

    if (answer.error) {
        process.stderr.write(`prod-api: the node ${HOST} cannot be reached — ${answer.error.message}\n`);
        process.exit(EXIT_REFUSED);
    }

    // Two different cases end in a refusal: the receiver did not accept the argument, and there is no
    // receiver at all — `exec` has nowhere to go. The first is visible by what is printed above, the
    // second by nothing, so the line names what to tell it by and asserts no cause. A one-off
    // container is not called here: it raises a database and a run of the migrations behind it, and
    // that is already a partial rollout.
    if (answer.status !== 0) {
        process.stderr.write(
            [
                '',
                'above is the receiver answer; if there is no answer at all, the state of the services will show:',
                `  ssh ${HOST} 'cd ${DIRECTORY} && ${COMPOSE} ps'`,
                '',
            ].join('\n')
        );
    }

    process.exit(answer.status ?? EXIT_REFUSED);
}

main();
