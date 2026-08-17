import { ESLintUtils, TSESLint, TSESTree } from '@typescript-eslint/utils';

/**
 * Принуждает каждый `@Component`-декоратор иметь `host: { class: BEM_BLOCK }`.
 *
 * Унифицирует host-class pattern для всего workspace: каждый компонент
 * декларирует свой BEM-блок через локальную const `BEM_BLOCK` и проставляет
 * её на host через `@Component({ ..., host: { class: BEM_BLOCK } })`. Это
 * закрывает дыру с `<ng-container rtBlock="...">`: контейнер разворачивается в
 * узел-комментарий, `BlockDirective` его пропускает, и класс блока не
 * применяется вовсе — разметка выглядит размеченной, а правил под ней нет.
 *
 * Эталон: `libs/common/ui/src/lib/components/container/vm-container.component.ts`.
 *
 * Доступно в ESLint-конфигах как `@nx/workspace-require-host-bem-block`.
 */
export const RULE_NAME: string = 'require-host-bem-block';

type IMessageIds = 'missingHost' | 'missingClassKey' | 'stringLiteralClass' | 'wrongIdentifier' | 'complexValue';
type IOptions = [];

const REQUIRED_IDENTIFIER: string = 'BEM_BLOCK';

const createRule: ReturnType<typeof ESLintUtils.RuleCreator> = ESLintUtils.RuleCreator(() => __filename);

function findProperty(obj: TSESTree.ObjectExpression, targetKey: string): TSESTree.Property | null {
    for (const prop of obj.properties) {
        if (prop.type !== 'Property' || prop.computed) {
            continue;
        }
        const keyName: string | null =
            prop.key.type === 'Identifier'
                ? prop.key.name
                : prop.key.type === 'Literal' && typeof prop.key.value === 'string'
                  ? prop.key.value
                  : null;
        if (keyName === targetKey) {
            return prop;
        }
    }
    return null;
}

export const rule: TSESLint.RuleModule<IMessageIds, IOptions> = createRule<IOptions, IMessageIds>({
    name: RULE_NAME,
    meta: {
        type: 'problem',
        docs: {
            description:
                'Every @Component decorator must declare host: { class: BEM_BLOCK }. ' +
                'Enforces a unified host-class pattern across the workspace (see ' +
                'vm-container.component.ts as the reference implementation).',
        },
        schema: [],
        messages: {
            missingHost:
                "@Component must declare host: { class: BEM_BLOCK }. Missing 'host' " +
                "property in decorator metadata. Add `const BEM_BLOCK = '<block-name>';` " +
                'and `host: { class: BEM_BLOCK }` to the @Component decorator.',
            missingClassKey:
                "@Component.host must include 'class: BEM_BLOCK'. The 'host' property " + "exists but does not declare a 'class' key.",
            stringLiteralClass:
                '@Component.host.class must reference the BEM_BLOCK const, not a string ' +
                "literal. Define `const BEM_BLOCK = '<block-name>';` at the top of the file " +
                'and use `class: BEM_BLOCK` instead.',
            wrongIdentifier:
                '@Component.host.class must reference an identifier named exactly BEM_BLOCK, ' +
                "found '{{actual}}'. Rename the const to BEM_BLOCK for consistency.",
            complexValue:
                '@Component.host.class must be a direct identifier reference to BEM_BLOCK ' +
                '(not a template literal, expression, member access, or spread).',
        },
    },
    defaultOptions: [],
    create(context: Readonly<TSESLint.RuleContext<IMessageIds, IOptions>>): TSESLint.RuleListener {
        return {
            Decorator(node: TSESTree.Decorator): void {
                const expr: TSESTree.Expression = node.expression;
                if (expr.type !== 'CallExpression' || expr.callee.type !== 'Identifier' || expr.callee.name !== 'Component') {
                    return;
                }

                const arg: TSESTree.CallExpressionArgument | undefined = expr.arguments[0];
                if (!arg || arg.type !== 'ObjectExpression') {
                    // `@Component()` без аргументов либо с identifier/external const —
                    // не можем статически разобрать host. Рапортуем как missingHost.
                    context.report({ node, messageId: 'missingHost' });
                    return;
                }

                const hostProp: TSESTree.Property | null = findProperty(arg, 'host');
                if (!hostProp) {
                    context.report({ node, messageId: 'missingHost' });
                    return;
                }

                if (hostProp.value.type !== 'ObjectExpression') {
                    // host: SOME_CONST или host: spread — нельзя статически проверить class:.
                    context.report({ node: hostProp, messageId: 'missingClassKey' });
                    return;
                }

                const classProp: TSESTree.Property | null = findProperty(hostProp.value, 'class');
                if (!classProp) {
                    context.report({ node: hostProp, messageId: 'missingClassKey' });
                    return;
                }

                const classValue: TSESTree.Node = classProp.value;
                if (classValue.type === 'Literal') {
                    context.report({ node: classProp, messageId: 'stringLiteralClass' });
                    return;
                }
                if (classValue.type === 'Identifier') {
                    if (classValue.name !== REQUIRED_IDENTIFIER) {
                        context.report({
                            node: classProp,
                            messageId: 'wrongIdentifier',
                            data: { actual: classValue.name },
                        });
                    }
                    return;
                }
                // TemplateLiteral, MemberExpression, CallExpression, BinaryExpression и т.п.
                context.report({ node: classProp, messageId: 'complexValue' });
            },
        };
    },
});
