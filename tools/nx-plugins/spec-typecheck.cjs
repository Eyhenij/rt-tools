/**
 * The `typecheck` target of every project whose specs run on Vitest.
 *
 * Vitest strips types and does not check them, and the libs of the receiver had no other step that
 * did: a type error in a spec lived until somebody opened the file in an editor. The target is
 * inferred rather than written into each project file, so a lib created later gets it by the same
 * two signs — a Vitest config and a spec settings file next to it.
 *
 * `--rootDir .` sets the workspace root as the root of the sources. The spec settings inherit the
 * root directory of the build, and a lib that imports a neighbour then fails on where the file
 * lies instead of on its types; with no output written, the root directory decides nothing else.
 *
 * A project that declares `typecheck` in its own file keeps its own: the project file is merged
 * over what a plugin infers.
 */
const { dirname, join } = require('node:path');
const { existsSync } = require('node:fs');

const TARGET = 'typecheck';

module.exports.createNodesV2 = [
    '**/vitest.config.mts',
    (configFiles, _options, context) =>
        configFiles.flatMap((configFile) => {
            const root = dirname(configFile);
            const specSettings = join(root, 'tsconfig.spec.json');

            if (!existsSync(join(context.workspaceRoot, specSettings))) {
                return [];
            }

            return [
                [
                    configFile,
                    {
                        projects: {
                            [root]: {
                                targets: {
                                    [TARGET]: {
                                        executor: 'nx:run-commands',
                                        cache: true,
                                        inputs: ['default', '^default'],
                                        options: {
                                            command: `tsc --noEmit -p ${specSettings} --rootDir .`,
                                        },
                                    },
                                },
                            },
                        },
                    },
                ],
            ];
        }),
];
