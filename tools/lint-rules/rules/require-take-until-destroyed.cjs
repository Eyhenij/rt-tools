'use strict';

/**
 * Каждый `.subscribe()` обязан стоять после `.pipe(...)` с терминирующим
 * оператором (`takeUntilDestroyed`/`takeUntil`/`take`/`first`/`last`/`toPromise`/
 * `firstValueFrom`/`lastValueFrom`). Защита от утечек подписок.
 *
 * Доступно в ESLint-конфигах как `rt/require-take-until-destroyed`.
 */

const TERMINATING_OPERATORS = new Set([
    'takeUntilDestroyed',
    'takeUntil',
    'take',
    'first',
    'last',
    'toPromise',
    'firstValueFrom',
    'lastValueFrom',
]);

/** Поднимается вверх по цепочке `a.b().pipe(...)` и возвращает аргументы ближайшего `.pipe()`. */
function findPipeArguments(node) {
    let current = node;
    while (current && current.type === 'CallExpression' && current.callee.type === 'MemberExpression') {
        if (current.callee.property.type === 'Identifier' && current.callee.property.name === 'pipe') {
            return current.arguments;
        }
        current = current.callee.object;
    }
    return null;
}

function hasTerminatingOperator(args) {
    return args.some(
        (arg) => arg.type === 'CallExpression' && arg.callee.type === 'Identifier' && TERMINATING_OPERATORS.has(arg.callee.name)
    );
}

module.exports = {
    meta: {
        type: 'problem',
        docs: {
            description:
                'Require every .subscribe() to be terminated via takeUntilDestroyed() or another ' +
                'terminating operator (takeUntil/take/first/firstValueFrom/...).',
        },
        schema: [],
        messages: {
            missing:
                'Subscription must be terminated via takeUntilDestroyed() or another terminating ' +
                'operator (takeUntil/take/first/firstValueFrom/...).',
        },
    },
    create(context) {
        return {
            'CallExpression[callee.type="MemberExpression"][callee.property.name="subscribe"]'(node) {
                const pipeArgs = findPipeArguments(node.callee.object);
                if (!pipeArgs || !hasTerminatingOperator(pipeArgs)) {
                    context.report({ node, messageId: 'missing' });
                }
            },
        };
    },
};
