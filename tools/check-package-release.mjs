#!/usr/bin/env node
/**
 * The release wiring of every package without a framework.
 *
 *   node tools/check-package-release.mjs                       — every such package
 *   node tools/check-package-release.mjs --package <folder>    — one
 *   node tools/check-package-release.mjs --package <folder> --build   — and build it, which runs
 *                                                                      its verify step
 *
 * The first release of `ai-chat-protocol` went out unloadable: the package was built from a copy of
 * the neighbour's pipeline that left out the neighbour's `verify` step, and the push set, which
 * takes only projects that have a `verify` target, never saw it. A second miss in the same release
 * came from the same copy: the publication workflow writes commit headers of its own, and the area
 * it named was not on the list the header check holds, so the version bump failed at the release.
 *
 * Neither was visible to any check, because each looked at one file. This one reads the wiring
 * whole. A package without a framework is the one whose project builds twice with `tsc`
 * (`build:esm` and `build:cjs`). For each of them it demands:
 *
 *   - the project has a `verify` target that calls `tools/verify-package.cjs`;
 *   - the root build command `build:<folder>` runs `nx verify` for it, so a build is never
 *     "built" without being loaded;
 *   - a publication workflow `publish-<folder>.yml` exists and builds through that command;
 *   - every commit header the workflow writes is a header the commit check accepts: its type is
 *     listed, its area is listed and its subject has Russian words.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);

/** The folders under `projects/` whose project builds with `tsc` in two formats. */
export function discoverPackages(root = ROOT) {
    return readdirSync(join(root, 'projects'), { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name)
        .filter((folder) => {
            const file = join(root, 'projects', folder, 'project.json');

            if (!existsSync(file)) {
                return false;
            }

            const targets = JSON.parse(readFileSync(file, 'utf8')).targets ?? {};

            return 'build:esm' in targets && 'build:cjs' in targets;
        });
}

/** The commit headers a workflow writes: the `message:` lines of its commit steps. */
export function workflowHeaders(text) {
    return [...text.matchAll(/^\s*message:\s*(['"]?)(.+?)\1\s*$/gm)].map((match) =>
        // A workflow expression stands for a value known only at the run; a version is what they hold.
        match[2].replace(/\$\{\{[^}]*\}\}/g, '0.0.0')
    );
}

/** The faults of one header against the commit check's own settings. */
export function workflowHeaderFaults(header, rules) {
    const match = /^(\w+)\(([^)]+)\):\s*(.+)$/.exec(header);

    if (!match) {
        return [`the header «${header}» is not «type(area): subject»`];
    }

    const [, type, area, subject] = match;
    const faults = [];
    const types = rules['type-enum']?.[2] ?? [];
    const areas = rules['scope-enum']?.[2] ?? [];

    if (types.length > 0 && !types.includes(type)) {
        faults.push(`the type «${type}» of «${header}» is not on the list of the commit check`);
    }

    if (areas.length > 0 && !areas.includes(area)) {
        faults.push(`the area «${area}» of «${header}» is not on the list of the commit check: ${areas.join(', ')}`);
    }

    if (!/[а-яё]/i.test(subject)) {
        faults.push(`the subject of «${header}» has no Russian words`);
    }

    return faults;
}

/** The faults of one package's wiring. */
export function packageFaults(folder, root = ROOT) {
    const faults = [];
    const project = JSON.parse(readFileSync(join(root, 'projects', folder, 'project.json'), 'utf8'));
    const rootPackage = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
    const manifest = JSON.parse(readFileSync(join(root, 'projects', folder, 'package.json'), 'utf8'));
    const verify = project.targets?.verify?.options?.command ?? '';

    if (!verify.includes('verify-package.cjs')) {
        faults.push(`projects/${folder}/project.json has no «verify» target calling tools/verify-package.cjs`);
    }

    const build = rootPackage.scripts?.[`build:${folder}`] ?? '';

    if (!build.includes(`nx verify ${manifest.name}`)) {
        faults.push(`the root script «build:${folder}» does not run «nx verify ${manifest.name}»: a built package would never be loaded`);
    }

    const workflow = join(root, '.github', 'workflows', `publish-${folder}.yml`);

    if (!existsSync(workflow)) {
        faults.push(`.github/workflows/publish-${folder}.yml does not exist`);

        return faults;
    }

    const text = readFileSync(workflow, 'utf8');

    if (!text.includes(`pnpm run build:${folder}`)) {
        faults.push(`.github/workflows/publish-${folder}.yml does not build through «pnpm run build:${folder}», which runs the verify step`);
    }

    const rules = require(join(root, 'commitlint.config.cjs')).rules ?? {};

    for (const header of workflowHeaders(text)) {
        faults.push(...workflowHeaderFaults(header, rules).map((line) => `.github/workflows/publish-${folder}.yml: ${line}`));
    }

    return faults;
}

function main() {
    const args = process.argv.slice(2);
    const named = args.includes('--package') ? args[args.indexOf('--package') + 1] : undefined;
    const all = discoverPackages();
    const folders = named ? all.filter((folder) => folder === named) : all;

    // A package that is not built with `tsc` in two formats is another kind of package, and its
    // release is not judged here.
    const faults = folders.flatMap((folder) => packageFaults(folder));

    if (faults.length === 0 && args.includes('--build')) {
        for (const folder of folders) {
            const run = spawnSync('pnpm', ['run', `build:${folder}`], { cwd: ROOT, encoding: 'utf8' });

            if (run.status !== 0) {
                faults.push(`«pnpm run build:${folder}» failed:\n${(run.stdout + run.stderr).split('\n').slice(-25).join('\n')}`);
            }
        }
    }

    if (faults.length > 0) {
        console.error(`check-package-release: ${faults.length} fault(s):\n${faults.map((line) => `  - ${line}`).join('\n')}`);
        process.exit(1);
    }

    console.log(`check-package-release: ${folders.length} package(s) without a framework, wiring in place${args.includes('--build') ? ', built and verified' : ''}.`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    main();
}
