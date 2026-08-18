import { ESLintUtils, TSESLint, TSESTree } from '@typescript-eslint/utils';

/**
 * Требует префикс `T` на top-level `type`-алиасах (`TExportFormat`, `TReadonlyState`) —
 * приставка рода из конвенции этого дерева: `I` у интерфейса, `E` у перечисления, `T` у типа.
 * Type-алиасы внутри любого `TSModuleBlock` пропускаются — это сохраняет
 * flat-two-level namespace-конвенцию (`namespace IRtuiButton { type Theme = ... }`
 * остаётся `Theme`).
 *
 * Формат имени: строгий PascalCase без аббревиатур-капсом.
 *   ^T[A-Z][a-z]+([A-Z][a-z]+)*([0-9]+)?$
 *
 * - `TExportFormat`, `TFoo`, `TSizeFn`  — valid
 * - `IExportFormat`, `ReadonlyState`    — invalid (`missingPrefix`)
 * - `Tuser`, `TAPI`, `T`                — invalid (`invalidFormat`)
 *
 * Без autofix — переименование существующих нарушений делается вручную (Rename Symbol).
 *
 * Доступно в ESLint-конфигах как `@nx/workspace-require-type-prefix`.
 */
export const RULE_NAME: string = 'require-type-prefix';

const VALID_NAME_REGEX: RegExp = /^T[A-Z][a-z]+([A-Z][a-z]+)*([0-9]+)?$/;
const HAS_T_PREFIX_REGEX: RegExp = /^T/;

type TMessageIds = 'missingPrefix' | 'invalidFormat';
type TOptions = [];

export const rule: TSESLint.RuleModule<TMessageIds, TOptions> = ESLintUtils.RuleCreator(() => __filename)<TOptions, TMessageIds>({
    name: RULE_NAME,
    meta: {
        type: 'problem',
        docs: {
            description:
                'Enforce the `T` prefix on top-level `type` alias declarations. Skipped for type aliases inside any `TSModuleBlock` — preserves the flat-two-level namespace convention (`IRtuiButton.Theme`).',
        },
        schema: [],
        messages: {
            missingPrefix: 'Type alias `{{name}}` must be prefixed with `T` — `I` is the interface prefix in this tree.',
            invalidFormat:
                'Type alias `{{name}}` must match strict PascalCase with the `T` prefix and no all-caps abbreviations (e.g. `TApi`, not `TAPI`).',
        },
    },
    defaultOptions: [],
    create(context: Readonly<TSESLint.RuleContext<TMessageIds, TOptions>>): TSESLint.RuleListener {
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

                if (!HAS_T_PREFIX_REGEX.test(name)) {
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
