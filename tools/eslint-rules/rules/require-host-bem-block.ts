import { ESLintUtils, TSESLint, TSESTree } from '@typescript-eslint/utils';

/**
 * It demands that every `@Component` decorator hold `host: { class: BEM_BLOCK }`.
 *
 * It makes the host class one for the whole tree: every component declares its BEM block by a
 * local const `BEM_BLOCK` and puts it on the host through
 * `@Component({ ..., host: { class: BEM_BLOCK } })`. That closes the hole with
 * `<ng-container rtBlock="...">`: the container unfolds into a comment node, `BlockDirective`
 * skips it, and the block class is not applied at all — the markup looks marked up while there
 * are no rules under it.
 *
 * In the ESLint configs it is available as `@nx/workspace-require-host-bem-block`.
 */
export const RULE_NAME: string = 'require-host-bem-block';

type TMessageIds = 'missingHost' | 'missingClassKey' | 'stringLiteralClass' | 'wrongIdentifier' | 'complexValue';
type TOptions = [];

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

export const rule: TSESLint.RuleModule<TMessageIds, TOptions> = createRule<TOptions, TMessageIds>({
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
    create(context: Readonly<TSESLint.RuleContext<TMessageIds, TOptions>>): TSESLint.RuleListener {
        return {
            Decorator(node: TSESTree.Decorator): void {
                const expr: TSESTree.Expression = node.expression;
                if (expr.type !== 'CallExpression' || expr.callee.type !== 'Identifier' || expr.callee.name !== 'Component') {
                    return;
                }

                const arg: TSESTree.CallExpressionArgument | undefined = expr.arguments[0];
                if (!arg || arg.type !== 'ObjectExpression') {
                    // `@Component()` without arguments, or with an identifier or an external
                    // const: the host cannot be read statically. Reported as missingHost.
                    context.report({ node, messageId: 'missingHost' });
                    return;
                }

                const hostProp: TSESTree.Property | null = findProperty(arg, 'host');
                if (!hostProp) {
                    context.report({ node, messageId: 'missingHost' });
                    return;
                }

                if (hostProp.value.type !== 'ObjectExpression') {
                    // host: SOME_CONST or host: a spread — the class key cannot be checked statically.
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
                // TemplateLiteral, MemberExpression, CallExpression, BinaryExpression and the like.
                context.report({ node: classProp, messageId: 'complexValue' });
            },
        };
    },
});
