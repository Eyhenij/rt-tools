#!/usr/bin/env node
/**
 * The check that the migrations and `prisma/schema.prisma` describe one and the same database.
 *
 * Neither the linter nor the build sees a divergence between them: it lives not in the code but
 * between the schema and the SQL. That is how a migration creating two indexes the schema did not
 * declare went into the main branch — the rollout fell already in the pipeline.
 *
 * What is measured is the migrations, not the database of whoever runs the check. A developer's
 * database lawfully carries the trace of any unfinished branch: one such held the push of someone
 * else's edit with four tables and eight columns that the schema of the main branch does not
 * have — while the migrations and the schema agreed.
 *
 * So the migrations are applied to a one-off shadow database, and it is that one which is
 * compared. The shadow database is started for every run and torn down after: left between runs,
 * it will itself accumulate the trace of a branch with a migration, and the check will again start
 * judging the state of the machine instead of the repository.
 *
 * A non-zero return code and an explanation of the divergence.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';
import { CONFIG, ROOT } from './rt-kit-checks.config.mjs';

/** The suffix of the shadow database: by it one sees that it is the shadow being torn down, not somebody's working base */
const SHADOW_SUFFIX = '_gate_shadow';

/**
 * The signs of the production database — the same as in `sql-guard`. The schema in production
 * changes only by a rollout, and the check goes there neither to read nor to write.
 */
const PRODUCTION_MARKS = CONFIG.productionMarks ?? [];

/** The server is alive but the database is not there; there is no server at all — both mean "nowhere to check" */
const SERVER_DOWN_CODES = ['ECONNREFUSED', 'ENOTFOUND', 'EHOSTUNREACH', 'ETIMEDOUT'];

function databaseUrl() {
    if (process.env['DATABASE_URL']) {
        return process.env['DATABASE_URL'];
    }

    const envFile = join(ROOT, '.env');
    if (!existsSync(envFile)) {
        return '';
    }

    const line = readFileSync(envFile, 'utf8')
        .split('\n')
        .find((row) => row.startsWith('DATABASE_URL='));

    return line
        ? line
              .slice('DATABASE_URL='.length)
              .trim()
              .replace(/^["']|["']$/g, '')
        : '';
}

/** The address of the shadow database and the address of the service one it is started and torn down from */
function shadowAddresses(url) {
    const parsed = new URL(url);
    const name = decodeURIComponent(parsed.pathname.replace(/^\//, ''));
    const shadowName = `${name}${SHADOW_SUFFIX}`;

    const shadow = new URL(url);
    shadow.pathname = `/${encodeURIComponent(shadowName)}`;

    // A database can be started and torn down only from another database of the same server;
    // `postgres` is always there, and the working one will not do for this — the teardown happens
    // while connections to it are alive.
    const service = new URL(url);
    service.pathname = '/postgres';

    return { shadowName, shadowUrl: shadow.toString(), serviceUrl: service.toString() };
}

// The code by which the check declares that there was nothing to look at. Formerly every such exit
// was a zero: the line about the skip went to the output, and in the digest of the push gate the
// zero stood next to the checks that had passed and differed from them in nothing — the set read
// as checked in full. The push guard knows the number too: it names what was skipped out loud
// without refusing the push, because a check with nothing to look at is not a breakage.
const SKIP = Number(process.env.RT_SKIP_CODE ?? 7);

/**
 * Whether the branch touched the storage — the schema or the migrations directory.
 *
 * Skipping the check is lawful exactly up to this line. A database on a developer's machine is shut
 * down as a matter of routine, and there is nothing in that to refuse a push of documentation for;
 * but a branch that edited the migrations goes into main blind without a run of the chain — and
 * falls not there but at the rollout. That is how production fell: five fields appeared in the
 * schema without migrations, some pages started answering "not found", half an hour of downtime,
 * fixed by a rollback. The gate was green all the while: the check returned the skip code.
 *
 * Both sides are looked at — what is uncommitted in the working tree and the branch's contribution
 * from main. The contribution alone is not enough: an edit that has not reached a commit yet goes
 * out with the same push right after.
 *
 * FAIL-OPEN: no git, no main branch, the call fell — it counts as not touched. A check that refuses
 * a push out of its own blindness is worse than a skip: there is nothing in it to fix.
 */
function touchedStorage() {
    const paths = [CONFIG.schemaFile, CONFIG.migrationsDir].filter(Boolean);
    if (!paths.length) {
        return false;
    }

    const git = (args) => {
        const out = spawnSync('git', args, { cwd: ROOT, encoding: 'utf8' });

        return out.status === 0 ? (out.stdout ?? '') : '';
    };

    // The main branch is taken by the remote ref: the local one is a snapshot of the last pull, and
    // a contribution counted from it lies exactly in the direction where the check stays silent.
    const main = CONFIG.mainBranch ?? 'main';
    const base = [`origin/${main}`, main].find((ref) => git(['rev-parse', '--verify', '--quiet', ref]).trim()) ?? '';

    const changed = [git(['status', '--porcelain']), base ? git(['diff', '--name-only', `${base}...HEAD`]) : ''].join('\n');

    return paths.some((one) => changed.split('\n').some((line) => line.includes(one)));
}

function prisma(args, url) {
    return spawnSync('npx', ['prisma', ...args], {
        cwd: ROOT,
        encoding: 'utf8',
        env: { ...process.env, DATABASE_URL: url },
    });
}

async function withServiceClient(serviceUrl, run) {
    // The database client is pulled in on the spot, not by an import at the top: a tree without
    // storage does not keep this package in its dependencies, and a static import would drop the
    // check before it managed to say that there is nothing here to audit.
    const pg = (await import('pg')).default;
    const client = new pg.Client({ connectionString: serviceUrl });
    try {
        await client.connect();
    } catch (error) {
        // Docker shut down is an ordinary state of the machine, not a reason to keep documentation
        // from being pushed.
        if (SERVER_DOWN_CODES.includes(error?.code)) {
            return unavailable('the database is unavailable');
        }
        throw error;
    }

    try {
        return await run(client);
    } finally {
        await client.end();
    }
}

/**
 * The answer to "nowhere to check": a skip or a refusal — depending on whether the branch touched
 * the storage.
 *
 * The refusal names what to raise the database with. "Nowhere" said on its own the executor reads
 * as a permission: raising it is not his duty, and the gate is green.
 */
function unavailable(why) {
    if (!touchedStorage()) {
        console.log(`check-schema-drift: ${why} — there is nowhere to check`);

        return SKIP;
    }

    console.error(`check-schema-drift: ${why}, and the branch edited the schema or the migrations — there is nowhere to check, though there was something to check\n`);
    console.error(
        'The chain of migrations on an empty storage is the only place where their true order shows:\n' +
            'the timestamp is set by the minute of creation, and a migration from a branch started earlier\n' +
            'stands before the one it depends on. On the deployed storage of a developer it applies, on a\n' +
            'clean one it fails — and that shows for the first time at the rollout.\n\n' +
            'Raise the database and repeat; when it is not at hand, the chain runs on a one-off container —\n' +
            'the ready-made commands are in the pattern `git-workflow-migration`.'
    );

    return 1;
}

async function main() {
    // A name that is not set is asked about separately from a file that does not exist. Glued to
    // the root, an empty name gives the root itself — and the root is always there, so the check
    // went on as if the schema were in place. A tree without storage says just that: there is no
    // name, there is nothing to audit.
    if (!CONFIG.schemaFile) {
        console.log('check-schema-drift: the schema file name is not set — there is nothing to check');

        return SKIP;
    }

    if (!existsSync(join(ROOT, CONFIG.schemaFile))) {
        console.log('check-schema-drift: there is no schema — there is nothing to check');

        return SKIP;
    }

    const url = databaseUrl();
    if (!url) {
        return unavailable('the database address is not set');
    }

    if (PRODUCTION_MARKS.some((mark) => url.includes(mark))) {
        console.log('check-schema-drift: the address is production — the check does not go there');

        return SKIP;
    }

    const { shadowName, shadowUrl, serviceUrl } = shadowAddresses(url);

    return withServiceClient(serviceUrl, async (client) => {
        // The identifier is quoted: the database name comes from the address, not from the text of the query
        const quoted = `"${shadowName.replace(/"/g, '""')}"`;
        await client.query(`DROP DATABASE IF EXISTS ${quoted}`);

        try {
            // `migrate deploy` starts the database itself: no creation command of our own is needed
            const deploy = prisma(['migrate', 'deploy'], shadowUrl);
            if (deploy.status !== 0) {
                console.error('check-schema-drift: the migrations do not apply to a clean database\n');
                console.error(`${deploy.stdout ?? ''}${deploy.stderr ?? ''}`);

                return 1;
            }

            // `--exit-code`: 0 — no divergences, 2 — there are some, anything else — a failure of the command itself
            const diff = prisma(
                ['migrate', 'diff', '--from-config-datasource', '--to-schema', CONFIG.schemaFile, '--exit-code'],
                shadowUrl
            );
            if (diff.status === 2) {
                console.error('check-schema-drift: the migrations and the schema describe different databases\n');
                console.error(`${diff.stdout ?? ''}${diff.stderr ?? ''}`);
                console.error(
                    '\nEither the schema was edited without a migration, or the migration creates what the schema does not declare.\nHow a migration is written — the pattern `git-workflow-migration`.'
                );

                return 1;
            }
            if (diff.status !== 0) {
                // Neither "agreed" nor "diverged" — the comparison command itself did not work. A
                // skip here is indistinguishable from migrations that agreed, and it was by exactly
                // that the check stayed silent about an empty schema name: with it the check called
                // the comparison without a required argument, and the refusal read as a green gate.
                console.error('check-schema-drift: the comparison did not work out\n');
                console.error(`${diff.stdout ?? ''}${diff.stderr ?? ''}`);

                return 1;
            }

            console.log('check-schema-drift: the migrations and the schema match');

            return 0;
        } finally {
            await client.query(`DROP DATABASE IF EXISTS ${quoted}`);
        }
    });
}

main().then(
    (code) => process.exit(code),
    (error) => {
        // A broken harness is not a skip but a refusal. "Nowhere to check" the check says itself and
        // earlier: no schema, no address, a production address, the server does not answer — all of
        // these are lawful exits with a zero, and each is named by a line of its own. What reaches
        // here is what the check did not foresee, and a silent zero here means "the gate is green
        // because the audit did not work out". There is nothing to tell it from "audited and
        // agreed": behind such a zero the check stood switched off until it was called by hand.
        console.error(`check-schema-drift: the check did not work out — ${error?.message ?? error}\n`);
        console.error(
            'This is a refusal of the check itself, not a divergence of the schema. Fix the harness: a missing package is installed at the root,\n' +
                'an empty name of the schema or of the migrations directory is set in the checks config of the tree.'
        );
        process.exit(1);
    }
);
