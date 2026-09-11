// rt-kit v0.27.0 · checks/lib-boundaries.mjs · f4544d295d9e · правится надстройкой, не здесь
/**
 * Boundaries and tags: where a lib is described as a source, whose dependency list must stay empty
 * and what the family base sees. All three subjects read the same files
 * `eslint/boundaries/domains/`, and they cannot be laid out apart.
 *
 * The name does not begin with `check-`: by walking such names the package default assembles the
 * push gate set, and a helper with one would be run by the gate as a check of its own.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import { BOUNDARIES_DIR, FAMILIES, isDir, libTag, report } from './lib-common.mjs';
import { CONFIG, ROOT } from './rt-kit-checks.config.mjs';

/**
 * A lib must be described by exactly one `sourceTag` and in exactly one boundaries file:
 * a lib described twice means two different allowlists for it, and which one wins is a
 * matter of the build order. In other allowlists the tag, on the contrary, occurs as many
 * times as needed: that is the enumeration of those the lib is visible to.
 */
function checkBoundaries(libs) {
    if (!isDir(BOUNDARIES_DIR)) {
        report(BOUNDARIES_DIR, 'there is no directory with boundary files');

        return;
    }

    const files = readdirSync(join(ROOT, BOUNDARIES_DIR)).filter((name) => name.endsWith('.config.mjs'));
    const sources = files.map((name) => ({ name, text: readFileSync(join(ROOT, BOUNDARIES_DIR, name), 'utf8') }));

    for (const libPath of libs) {
        const tag = libTag(libPath);
        const declaration = `sourceTag: '${tag}'`;
        const owners = sources.flatMap(({ name, text }) => {
            const count = text.split(declaration).length - 1;

            return count > 0 ? Array.from({ length: count }, () => name) : [];
        });

        if (owners.length === 0) {
            report(libPath, `the tag ${tag} is described in no file of ${BOUNDARIES_DIR}/`);
        } else if (owners.length > 1) {
            report(libPath, `the tag ${tag} is described ${owners.length} times: ${owners.join(', ')}`);
        }
    }
}

/**
 * Libs whose dependency list must stay empty. The barrel of such a lib travels
 * into the backend bundle, and the API build runs without tree-shaking: any dependency
 * spreads from there across the whole graph.
 *
 * The tags are named by the tree: a tag name is its own word, and one hard-coded here would demand
 * a boundaries description for a lib the tree does not have at all. Empty — the tree keeps no such
 * libs.
 */
const NO_DEPENDENCY_TAGS = CONFIG.noDependencyTags;

function checkNoDependencyLibs() {
    if (!isDir(BOUNDARIES_DIR)) {
        return;
    }

    const files = readdirSync(join(ROOT, BOUNDARIES_DIR)).filter((name) => name.endsWith('.config.mjs'));

    for (const tag of NO_DEPENDENCY_TAGS) {
        const declaration = `sourceTag: '${tag}'`;
        let described = false;

        for (const name of files) {
            const text = readFileSync(join(ROOT, BOUNDARIES_DIR, name), 'utf8');
            const declaredAt = text.indexOf(declaration);
            if (declaredAt === -1) {
                continue;
            }
            described = true;

            const rest = text.slice(declaredAt);
            const listAt = rest.indexOf('onlyDependOnLibsWithTags:');
            const opensAt = rest.indexOf('[', listAt);
            const closesAt = rest.indexOf(']', opensAt);
            if (listAt === -1 || opensAt === -1 || closesAt === -1) {
                report(`${BOUNDARIES_DIR}/${name}`, `${tag} has no list of dependencies`);
                continue;
            }

            const dependencies = rest.slice(opensAt + 1, closesAt).trim();
            if (dependencies.length > 0) {
                report(`${BOUNDARIES_DIR}/${name}`, `${tag} depends on nobody, and its list is not empty: ${dependencies}`);
            }
        }

        if (!described) {
            report(BOUNDARIES_DIR, `the tag ${tag} is described in no boundary file`);
        }
    }
}

/**
 * The family base sees `common/util` and the `util` layers of the shared domains of its
 * own family. Everything beyond that is named by a line here: the base is called by every
 * domain, and any dependency of it becomes shared by the whole family.
 */
const CORE_EXCEPTIONS = {
    // The Connect transport in admin-transport.provider.ts: the sign-in descriptor and the
    // transport token
    'scope:admin-core': ['scope:common-proto', 'scope:common-connect'],
};

/** `scope:<family>-common-<domain>-util` — the `util` layer of a shared domain of the same family */
const isFamilyCommonUtil = (tag, family) => new RegExp(`^scope:${family}-common-[a-z0-9-]+-util$`).test(tag);

async function checkCoreLibs() {
    // Not every tree with a domain grid has a boundaries index: it is assembled by a separate file,
    // and while its absence was not handled the check fell on the import — that is, it answered a
    // tree where boundaries are declared differently with a breakage.
    const boundaries = join(ROOT, 'eslint/boundaries/index.mjs');
    if (!existsSync(boundaries)) {
        console.log('skipped: the tree has no boundary digest eslint/boundaries/index.mjs');

        return;
    }
    const { allBoundaries } = await import(boundaries);

    for (const family of FAMILIES) {
        const tag = `scope:${family}-core`;
        const rule = allBoundaries.find((entry) => entry.sourceTag === tag);
        if (!rule) {
            continue;
        }

        const allowed = CORE_EXCEPTIONS[tag] ?? [];
        for (const dependency of rule.onlyDependOnLibsWithTags ?? []) {
            if (dependency === 'scope:common-util' || isFamilyCommonUtil(dependency, family) || allowed.includes(dependency)) {
                continue;
            }
            report(
                `${BOUNDARIES_DIR}/${family}-core.config.mjs`,
                `${tag} sees ${dependency}: the base of a family may reach only scope:common-util and scope:${family}-common-*-util`
            );
        }
    }
}

export { checkBoundaries, checkCoreLibs, checkNoDependencyLibs };
