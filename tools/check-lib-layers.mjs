#!/usr/bin/env node
// rt-kit v0.29.0 · checks/check-lib-layers.mjs · b72b6f61df2f · правится надстройкой, не здесь
/**
 * The check of the domain grid invariant: every domain has exactly the layers due to
 * its form, and every lib has a name, tag, alias and configs matching its path.
 *
 * Four forms of a domain:
 *   feature   libs/{site,admin}/<domain>/          api, data-access, feature/<screen>+, shell, ui, util
 *   shared    libs/{site,admin}/common/<domain>/   api, data-access, feature, ui, util   (shell is an error)
 *   container                                      the same five as the shared one
 *   backend   libs/api/<domain>/                   api, data-access, feature, util
 *
 * Every subject of the audit lives in a module of its own next door: the domain grid and the layer
 * set — `lib-domains.mjs`, the files of a lib together with its name, tag and alias —
 * `lib-manifests.mjs`, boundaries and dependency lists — `lib-boundaries.mjs`, barrels and
 * re-exports — `lib-reexports.mjs`, the shared reading of the tree — `lib-common.mjs`. What is left
 * here is the run: it collects the libs, calls every subject over them and puts what was found into
 * one list.
 *
 * The exceptions are listed in tools/lib-layers-allowlist.json.
 * A non-zero exit code and the list of discrepancies.
 */
import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { checkBoundaries, checkCoreLibs, checkNoDependencyLibs } from './lib-boundaries.mjs';
import { FAMILIES, LIBS_ROOT, LIB_ROOTS, isDir, problems, report } from './lib-common.mjs';
import { collectAllDomainLibs, collectApiDomainLibs, collectFlatLibs, collectStrayLibs } from './lib-domains.mjs';
import { checkAliases, checkLib } from './lib-manifests.mjs';
import { checkReexports } from './lib-reexports.mjs';
import { ROOT, allowlistOf, skipUnless } from './rt-kit-checks.config.mjs';

// There is nothing to check in a tree without a domain grid: not everyone who takes the package
// has a lib layout. While there was no skip, the very first install got the refusal "no
// tsconfig.base.json" — that is, a breakage instead of the answer "this layout is not here".
skipUnless(
    LIB_ROOTS.some((root) => isDir(root)) && existsSync(join(ROOT, 'tsconfig.base.json')),
    `the layout of the libs ${LIB_ROOTS.join(', ')} or the file tsconfig.base.json`
);

// A family named in the settings whose directory the tree does not hold. The walk goes past it in
// silence, and the answer comes out the same as an honest one: the check reads the names of the
// families from the settings, and a tree that renamed one keeps the package default. The whole
// absence of the layout is another matter — it is the skip above.
const lost = FAMILIES.filter((family) => !isDir(`${LIBS_ROOT}/${family}`));
if (lost.length > 0) {
    console.error(`check-lib-layers: the family «${lost.join('», «')}» is declared by the key «families», and the tree holds no ${lost.map((family) => `${LIBS_ROOT}/${family}`).join(', ')}\n`);
    console.error('  A family walked past in silence answers exactly like an honest zero. Either the directory is named otherwise — then the key is fixed — or the family is gone, and its name leaves the key.');
    process.exit(1);
}

const domainLibs = collectAllDomainLibs();
const apiLibs = collectApiDomainLibs();
const flatLibs = collectFlatLibs();
const strays = collectStrayLibs([...domainLibs, ...apiLibs]);

// A walk that met not a single lib is a refusal, not a green answer. The skip above says the tree
// has no lib layout at all; here the roots are in place, and the walk came back empty — the domains
// lie a level deeper, the settings named an empty list of families, or a lib carries no
// `project.json` and is therefore not a lib to this check. The line «0 libs, no divergences» is
// indistinguishable from an honest zero, and the check stands in the push gate: its silence reads
// as its green answer.
if (domainLibs.length + apiLibs.length + flatLibs.length === 0) {
    console.error(`check-lib-layers: not a single lib was met over the roots ${LIB_ROOTS.join(', ')}\n`);
    console.error('  The check would answer «no divergences» without having read a lib. The roots are named by the keys «libsRoot», «families» and «apiFamily» of the checks config; a lib is recognised by its `project.json`.');
    process.exit(1);
}

strays.forEach((path) => report(path, `the lib is outside the domain grid and is not listed in ${allowlistOf('lib-layers')}`));
domainLibs.forEach((libPath) => checkLib(libPath));
apiLibs.forEach((libPath) => checkLib(libPath, { requirePrefix: false }));
flatLibs.forEach((libPath) => checkLib(libPath, { requirePrefix: false }));
checkAliases([...domainLibs, ...apiLibs, ...flatLibs]);
checkBoundaries([...domainLibs, ...apiLibs, ...flatLibs]);
checkNoDependencyLibs();
checkReexports();
await checkCoreLibs();

if (problems.length > 0) {
    console.error(`check-lib-layers: divergences ${problems.length}\n`);
    problems.forEach((problem) => console.error(`  ${problem}`));
    process.exit(1);
}

console.log(
    `check-lib-layers: ${domainLibs.length} libs of the front domain grid, ${apiLibs.length} of the backend and ${flatLibs.length} flat ones, no divergences`
);
