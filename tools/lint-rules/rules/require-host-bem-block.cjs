'use strict';

/**
 * Принуждает каждый `@Component`-декоратор иметь `host: { class: BEM_BLOCK }`,
 * где `BEM_BLOCK` — локальная const с ровно этим именем (не строковый литерал,
 * не выражение). Унифицирует host-class pattern по всему workspace и закрывает
 * дыру с `<ng-container rtBlock="...">` (Comment-node skip в BlockDirective —
 * block-class не применяется на хост компонента).
 *
 * Доступно в ESLint-конфигах как `rt/require-host-bem-block`.
 */

const REQUIRED_IDENTIFIER = 'BEM_BLOCK';

function findProperty(obj, targetKey) {
    for (const prop of obj.properties) {
        if (prop.type !== 'Property' || prop.computed) {
            continue;
        }
        const keyName =
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

module.exports = {
    meta: {
        type: 'problem',
        docs: {
            description:
                'Every @Component decorator must declare host: { class: BEM_BLOCK } referencing a ' +
                'local const named exactly BEM_BLOCK.',
        },
        schema: [],
        messages: {
            missingHost:
                "@Component must declare host: { class: BEM_BLOCK }. Add `const BEM_BLOCK = '<block-name>';` " +
                'and `host: { class: BEM_BLOCK }` to the @Component decorator.',
            missingClassKey: "@Component.host must include 'class: BEM_BLOCK'.",
            stringLiteralClass:
                '@Component.host.class must reference the BEM_BLOCK const, not a string literal. ' +
                "Define `const BEM_BLOCK = '<block-name>';` and use `class: BEM_BLOCK`.",
            wrongIdentifier: "@Component.host.class must reference an identifier named exactly BEM_BLOCK, found '{{actual}}'.",
            complexValue:
                '@Component.host.class must be a direct identifier reference to BEM_BLOCK ' +
                '(not a template literal, expression, member access, or spread).',
        },
    },
    create(context) {
        return {
            Decorator(node) {
                const expr = node.expression;
                if (expr.type !== 'CallExpression' || expr.callee.type !== 'Identifier' || expr.callee.name !== 'Component') {
                    return;
                }

                const arg = expr.arguments[0];
                if (!arg || arg.type !== 'ObjectExpression') {
                    context.report({ node, messageId: 'missingHost' });
                    return;
                }

                const hostProp = findProperty(arg, 'host');
                if (!hostProp) {
                    context.report({ node, messageId: 'missingHost' });
                    return;
                }

                if (hostProp.value.type !== 'ObjectExpression') {
                    context.report({ node: hostProp, messageId: 'missingClassKey' });
                    return;
                }

                const classProp = findProperty(hostProp.value, 'class');
                if (!classProp) {
                    context.report({ node: hostProp, messageId: 'missingClassKey' });
                    return;
                }

                const classValue = classProp.value;
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
                context.report({ node: classProp, messageId: 'complexValue' });
            },
        };
    },
};
