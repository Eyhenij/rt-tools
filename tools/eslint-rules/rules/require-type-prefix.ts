import { ESLintUtils, TSESLint, TSESTree } from '@typescript-eslint/utils';

/**
 * Требует префикс `I` на top-level `type`-алиасах (`IExportFormat`, `IReadonlyState`).
 * Type-алиасы внутри любого `TSModuleBlock` пропускаются — это сохраняет
 * flat-two-level namespace-конвенцию (`namespace ITurnstile { type Theme = ... }`
 * остаётся `Theme`).
 *
 * Формат имени: строгий PascalCase без аббревиатур-капсом.
 *   ^I[A-Z][a-z]+([A-Z][a-z]+)*([0-9]+)?$
 *
 * - `IExportFormat`, `IFoo`, `ISizeFn`  — valid
 * - `TExportFormat`, `ReadonlyState`    — invalid (`missingPrefix`)
 * - `Iuser`, `IAPI`, `I`                — invalid (`invalidFormat`)
 *
 * Без autofix — переименование существующих нарушений делается вручную (Rename Symbol).
 *
 * Доступно в ESLint-конфигах как `@nx/workspace-require-type-prefix`.
 */
export const RULE_NAME: string = 'require-type-prefix';

const VALID_NAME_REGEX: RegExp = /^I[A-Z][a-z]+([A-Z][a-z]+)*([0-9]+)?$/;
const HAS_I_PREFIX_REGEX: RegExp = /^I/;

type IMessageIds = 'missingPrefix' | 'invalidFormat';
type IOptions = [];

export const rule: TSESLint.RuleModule<IMessageIds, IOptions> = ESLintUtils.RuleCreator(() => __filename)<IOptions, IMessageIds>({
    name: RULE_NAME,
    meta: {
        type: 'problem',
        docs: {
            description:
                'Enforce the `I` prefix on top-level `type` alias declarations. Skipped for type aliases inside any `TSModuleBlock` — preserves the flat-two-level namespace convention (`ITurnstile.Theme`).',
        },
        schema: [],
        messages: {
            missingPrefix: 'Type alias `{{name}}` must be prefixed with `I` (e.g. `I{{name}}`).',
            invalidFormat:
                'Type alias `{{name}}` must match strict PascalCase with the `I` prefix and no all-caps abbreviations (e.g. `IApi`, not `IAPI`).',
        },
    },
    defaultOptions: [],
    create(context: Readonly<TSESLint.RuleContext<IMessageIds, IOptions>>): TSESLint.RuleListener {
        return {
            TSTypeAliasDeclaration(node: TSESTree.TSTypeAliasDeclaration): void {
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
