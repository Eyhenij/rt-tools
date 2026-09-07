import { ESLintUtils, TSESLint, TSESTree } from '@typescript-eslint/utils';

/**
 * It demands the prefix `E` on EVERY `enum` declaration (`EUserRole`, `EActions`).
 * Unlike `require-interface-prefix` and `require-type-prefix`, this rule has NO namespace skip:
 * an enum carries the prefix `E` inside a namespace too
 * (`ICustomerEvent.EActions`).
 *
 * The shape of the name: strict PascalCase, no all-caps abbreviations.
 *   ^E[A-Z][a-z]+([A-Z][a-z]+)*([0-9]+)?$
 *
 * - `EUserRole`, `EActions`, `EFooBar`  — valid
 * - `UserRole`, `Actions`               — invalid (`missingPrefix`)
 * - `Euser`, `EAPI`, `E`                — invalid (`invalidFormat`)
 *
 * There is no autofix — an existing violation is renamed by hand (Rename Symbol).
 *
 * In the ESLint configs it is available as `@nx/workspace-require-enum-prefix`.
 */
export const RULE_NAME: string = 'require-enum-prefix';

const VALID_NAME_REGEX: RegExp = /^E[A-Z][a-z]+([A-Z][a-z]+)*([0-9]+)?$/;
const HAS_E_PREFIX_REGEX: RegExp = /^E/;

type TMessageIds = 'missingPrefix' | 'invalidFormat';
type TOptions = [];

export const rule: TSESLint.RuleModule<TMessageIds, TOptions> = ESLintUtils.RuleCreator(() => __filename)<TOptions, TMessageIds>({
    name: RULE_NAME,
    meta: {
        type: 'problem',
        docs: {
            description:
                'Enforce the `E` prefix on every `enum` declaration, including enums inside namespaces (no module-block skip — `E` is required everywhere).',
        },
        schema: [],
        messages: {
            missingPrefix: 'Enum `{{name}}` must be prefixed with `E` (e.g. `E{{name}}`).',
            invalidFormat:
                'Enum `{{name}}` must match strict PascalCase with the `E` prefix and no all-caps abbreviations (e.g. `EApi`, not `EAPI`).',
        },
    },
    defaultOptions: [],
    create(context: Readonly<TSESLint.RuleContext<TMessageIds, TOptions>>): TSESLint.RuleListener {
        return {
            TSEnumDeclaration(node: TSESTree.TSEnumDeclaration): void {
                const name: string = node.id.name;

                if (!HAS_E_PREFIX_REGEX.test(name)) {
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
