import { ESLintUtils, TSESLint, TSESTree } from '@typescript-eslint/utils';

/**
 * It demands the prefix `I` on top-level `interface` declarations (`IUser`, `ITour`).
 * Interfaces inside any `TSModuleBlock` are skipped — one check covers both the flat two-level
 * namespace convention of the models (`namespace IMdm { interface Table {} }` stays `Table`,
 * not `ITable`) and declaration merging (`declare global { interface Window {} }` extends
 * lib.dom and MUST keep the original name).
 *
 * The shape of the name: strict PascalCase, no all-caps abbreviations.
 *   ^I[A-Z][a-z]+([A-Z][a-z]+)*([0-9]+)?$
 *
 * - `IUser`, `IApi`, `IFooBar`, `IUser2024`  — valid
 * - `Iuser`, `I2User`, `I_User`, `I`         — invalid (`invalidFormat`)
 * - `IAPI`, `IURL`, `IUSER`                  — invalid (`invalidFormat` — an all-caps abbreviation)
 * - `User`, `FooBar`                         — invalid (`missingPrefix`)
 *
 * There is no autofix — an existing violation is renamed by hand (Rename Symbol).
 *
 * In the ESLint configs it is available as `@nx/workspace-require-interface-prefix`.
 */
export const RULE_NAME: string = 'require-interface-prefix';

const VALID_NAME_REGEX: RegExp = /^I[A-Z][a-z]+([A-Z][a-z]+)*([0-9]+)?$/;
const HAS_I_PREFIX_REGEX: RegExp = /^I/;

type TMessageIds = 'missingPrefix' | 'invalidFormat';
type TOptions = [];

export const rule: TSESLint.RuleModule<TMessageIds, TOptions> = ESLintUtils.RuleCreator(() => __filename)<TOptions, TMessageIds>({
    name: RULE_NAME,
    meta: {
        type: 'problem',
        docs: {
            description:
                'Enforce the `I` prefix on top-level interface declarations. Skipped for interfaces inside any `TSModuleBlock` — covers the flat-two-level namespace convention (`IMdm.Table.Api`) and `declare global { interface Window {} }` declaration merging.',
        },
        schema: [],
        messages: {
            missingPrefix: 'Interface `{{name}}` must be prefixed with `I` (e.g. `I{{name}}`).',
            invalidFormat:
                'Interface `{{name}}` must match strict PascalCase with the `I` prefix and no all-caps abbreviations (e.g. `IApi`, not `IAPI`).',
        },
    },
    defaultOptions: [],
    create(context: Readonly<TSESLint.RuleContext<TMessageIds, TOptions>>): TSESLint.RuleListener {
        return {
            TSInterfaceDeclaration(node: TSESTree.TSInterfaceDeclaration): void {
                const parent: TSESTree.Node | undefined = node.parent;
                const insideModuleBlock: boolean =
                    parent?.type === 'TSModuleBlock' ||
                    (parent?.type === 'ExportNamedDeclaration' && parent.parent?.type === 'TSModuleBlock');
                if (insideModuleBlock) {
                    return;
                }

                const name: string = node.id.name;

                if (!HAS_I_PREFIX_REGEX.test(name)) {
                    context.report({ node: node.id, messageId: 'missingPrefix', data: { name } });
                    return;
                }

                if (!VALID_NAME_REGEX.test(name)) {
                    context.report({ node: node.id, messageId: 'invalidFormat', data: { name } });
                }
            },
        };
    },
});
