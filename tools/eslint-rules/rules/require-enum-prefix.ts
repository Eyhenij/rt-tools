import { ESLintUtils, TSESLint, TSESTree } from '@typescript-eslint/utils';

/**
 * Требует префикс `E` на КАЖДОМ `enum`-объявлении (`EUserRole`, `EActions`).
 * В отличие от `require-interface-prefix` и `require-type-prefix`, у этого правила
 * НЕТ namespace-skip — enum обязан нести префикс `E` даже внутри namespace
 * (`ICustomerEvent.EActions`).
 *
 * Формат имени: строгий PascalCase без аббревиатур-капсом.
 *   ^E[A-Z][a-z]+([A-Z][a-z]+)*([0-9]+)?$
 *
 * - `EUserRole`, `EActions`, `EFooBar`  — valid
 * - `UserRole`, `Actions`               — invalid (`missingPrefix`)
 * - `Euser`, `EAPI`, `E`                — invalid (`invalidFormat`)
 *
 * Без autofix — переименование существующих нарушений делается вручную (Rename Symbol).
 *
 * Доступно в ESLint-конфигах как `@nx/workspace-require-enum-prefix`.
 */
export const RULE_NAME: string = 'require-enum-prefix';

const VALID_NAME_REGEX: RegExp = /^E[A-Z][a-z]+([A-Z][a-z]+)*([0-9]+)?$/;
const HAS_E_PREFIX_REGEX: RegExp = /^E/;

type IMessageIds = 'missingPrefix' | 'invalidFormat';
type IOptions = [];

export const rule: TSESLint.RuleModule<IMessageIds, IOptions> = ESLintUtils.RuleCreator(() => __filename)<IOptions, IMessageIds>({
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
    create(context: Readonly<TSESLint.RuleContext<IMessageIds, IOptions>>): TSESLint.RuleListener {
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
